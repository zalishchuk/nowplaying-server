import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import fastify from 'fastify';
import { parseDictionary, transformMediaInfoKeys } from './utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execFileAsync = promisify(execFile);

const app = fastify();

const config = {
  bin: resolve(__dirname, 'bin', 'nowplaying'),
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  commands: new Set(['play', 'pause', 'togglePlayPause', 'next', 'previous']),
};

async function runCommand(command) {
  const args = command.split(' ').filter(Boolean);
  const { stdout, stderr } = await execFileAsync(config.bin, args);
  if (stderr) console.error(stderr);
  return stdout;
}

app.get('/command/:command', async (request, reply) => {
  const { command } = request.params;

  if (!config.commands.has(command)) {
    reply.status(400);
    return { error: 'Invalid command' };
  }

  try {
    await runCommand(command);
    return { ok: true };
  } catch (error) {
    reply.status(500);
    return { error: error.toString() };
  }
});

app.get('/info', async (request, reply) => {
  try {
    const rawOutput = await runCommand('get-raw');
    const data = transformMediaInfoKeys(parseDictionary(rawOutput));

    if (data.artworkData) delete data.artworkData;

    if (request.query.artwork !== undefined) {
      const artworkData = await runCommand('get artworkData');
      if (artworkData) data.artworkData = `data:${data.artworkMIMEType};base64,${artworkData.trim()}`;
    }

    return data;
  } catch (error) {
    reply.status(500);
    return { error: error.toString() };
  }
});

app.get('/', (request, reply) => {
  reply.status(404);
  return { message: 'Bruh, go to /info' };
});

app.setNotFoundHandler(async (request, reply) => {
  reply.status(404);
  return { error: 'Bruh...' };
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
