import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import fastify from 'fastify';
import {
  buildBase64DataUri,
  createExecutor,
  ensureExecutable,
  parseDictionary,
  removeKeysWithPrefix,
  transformMediaInfoKeys,
} from './utils.mjs';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  bin: process.env.PATH_BIN ?? 'nowplaying-cli',
  binFallback: resolve(__dirname, 'bin', 'nowplaying'),
  port: process.env.PORT ?? 3333,
  host: process.env.HOST ?? '0.0.0.0',
  commands: new Set(['play', 'pause', 'toggle', 'next', 'previous']),
};

config.bin = ensureExecutable(config.bin, config.binFallback);
const execCommand = createExecutor(config.bin);
const app = fastify();

app.get('/command/:command', async (request, reply) => {
  let { command } = request.params;
  if (command === 'toggle') command = 'togglePlayPause';

  if (!config.commands.has(command)) {
    reply.status(400);
    return { error: 'Invalid command' };
  }

  try {
    await execCommand(command);
    return { ok: true };
  } catch (error) {
    reply.status(500);
    return { error: error.toString() };
  }
});

app.get('/', async (request, reply) => {
  try {
    const rawOutput = await execCommand('get-raw');
    const isRaw = request.query.raw !== undefined;
    if (isRaw) return rawOutput;

    let data = transformMediaInfoKeys(parseDictionary(rawOutput));
    const includeArtwork = request.query.artwork !== undefined;
    if (!includeArtwork) data = removeKeysWithPrefix(data, 'artwork');

    if (includeArtwork) {
      const artworkData = await execCommand('get', 'artworkData');
      if (artworkData) data.artworkData = buildBase64DataUri(data.artworkMIMEType, artworkData);
    }

    // https://www.reddit.com/r/jailbreakdevelopers/comments/ogneoy/help_how_do_i_get_the_current_elapsed_time_of_the/
    const [elapsedTime, duration] = await Promise.all([
      execCommand('get', 'elapsedTime'),
      execCommand('get', 'duration'),
    ]);

    if (elapsedTime) data.elapsedTime = Number(elapsedTime);
    if (duration) data.duration = Number(duration);

    return data;
  } catch (error) {
    reply.status(500);
    return { error: error.toString() };
  }
});

app.get('/bruh', async (request, reply) => {
  const notBase64EncodedOpusBruhSoundEffect =
    'T2dnUwACAAAAAAAAAABT4/2NAAAAALkYVJoBE09wdXNIZWFkAQE4AUAfAAAAAABPZ2dTAAAAAAAAAAAAAFPj/Y0BAAAAwVC6kw' +
    'E9T3B1c1RhZ3MMAAAATGF2ZjYxLjcuMTAwAQAAAB0AAABlbmNvZGVyPUxhdmM2MS4xOS4xMDEgbGlib3B1c09nZ1MABGiaAAAA' +
    'AAAAU+P9jQIAAAAQnlHTKgsLCQ0ODQ8NDQ0NDQ8MDg4ODg4MCwwMDAwOCQoJCQkLCQoKCwoLCgsJCwgMr7JnX7NBArTECIIDHS' +
    'wgrZbmk/wIhYlrgfNcgnwIujFNgc5MEW6v6rtACLacGG2L8cLIcl7Dj8AItk15hwINDTf004G6CL0GGw0SCO0AJZIsTXa/CL16' +
    'vzULQwhXPcHZ4Ai9euYiVS2eIfQhz8AIvXqvghOcNMXYCXecCL16oZvlsDJ9A5X0Fgi9evk3gzZfhGKHIboIvXpsQMbmsiw0Q7' +
    '2FYDAIvXsrwroj88y3GJMIvXr6E5bzwOlPNzxjoAi9ekXw1dXA4tSrdpqACL17KZeZkKXgNWPVhkAIvXr2A1LCcxNaJ0B8YAi9' +
    'eugAsSQhZcd3n6OACL16r8hq4N33M3OACL16d7PKcPJJPwgIvXpaMLwnZp2HgoAIvXlXi4eAZ/uePQIIvWUmuhseC/PuSfwIvU' +
    'CNFf6TLNLt2bwIv/WGWuFWp7MAckx9+ggGdLRtPf+RdAgGckf+ZTh8aJgIBm41fqSQ63IIP1TFi103pjgIBmO02N9zfsAIPgAy' +
    'U2KrBN0jgAg9Vl8m9z4CFgg7E69AaTk7WxgINzQKfrzBreiACDRKydU7e5PQbUAIJ7OoUYBj+FMoCCe2dHIa9h2W/sAIJ5lrpQ' +
    'qQb6PgCCmCeAKS5p5HCKwIBDaWtdacg8AIGkRFO3Ug207vBg==';

  reply.header('Content-Type', 'audio/ogg').send(Buffer.from(notBase64EncodedOpusBruhSoundEffect, 'base64'));
});

app.setNotFoundHandler((request, reply) => {
  reply.status(404);
  return { error: 'Not Found' };
});

async function init() {
  try {
    app.listen({ port: config.port, host: config.host });
    console.log(`Server running at http://${config.host}:${config.port}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

init();
