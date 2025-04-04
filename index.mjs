import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fastify from 'fastify';

const app = fastify();

const execAsync = promisify(exec);
const config = {
  bin: 'nowplaying-cli',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  commands: new Set(['play', 'pause', 'togglePlayPause', 'next', 'previous']),
};

function parseDictionary(input) {
  if (!input || typeof input !== 'string') return {};

  input = input.trim();
  if (input.startsWith('{')) input = input.slice(1);
  if (input.endsWith('}')) input = input.slice(0, -1);

  const result = {};
  const parts = input.split(';').filter(Boolean);

  for (const part of parts) {
    const equalIndex = part.indexOf('=');
    if (equalIndex === -1) continue;

    const key = part.slice(0, equalIndex).trim();
    let value = part.slice(equalIndex + 1).trim();

    if (value.startsWith('{') && value.endsWith('}')) {
      result[key] = parseDictionary(value);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      result[key] = value.slice(1, -1);
    } else if (!isNaN(value) && value !== '') {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function transformMediaInfoKeys(input) {
  if (typeof input !== 'object' || input === null) return input;

  const result = {};
  const prefix = 'kMRMediaRemoteNowPlayingInfo';

  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      let newKey = key;

      if (key.startsWith(prefix)) {
        newKey = key.replace(prefix, '');
        if (newKey.length > 0) newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
      }

      result[newKey] = input[key];
    }
  }

  return result;
}

async function executeCliCommand(command) {
  const { stdout, stderr } = await execAsync(`${config.bin} ${command}`);
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
    await executeCliCommand(command);
    return { ok: true };
  } catch (error) {
    reply.status(500);
    return { error: error.toString() };
  }
});

app.get('/info', async (request, reply) => {
  try {
    const rawOutput = await executeCliCommand('get-raw');
    const data = transformMediaInfoKeys(parseDictionary(rawOutput));

    if (data.artworkData) delete data.artworkData;

    if (request.query.artwork !== undefined) {
      const artworkData = await executeCliCommand('get artworkData');
      if (artworkData) data.artworkData = `data:${data.artworkMIMEType};base64,${artworkData.trim()}`;
    }

    return data;
  } catch (error) {
    reply.status(500);
    return { error: error.toString() };
  }
});

app.get('/', (request, reply) => {
  reply.send({ message: 'Bruh, go to /info' });
});

async function verifyBinaryInPath() {
  try {
    await execAsync(`which ${config.bin}`);
  } catch (error) {
    console.error(`Error: ${config.bin} not found in PATH. Please install it first.`);
    process.exit(1);
  }
}

async function init() {
  try {
    await verifyBinaryInPath();
    app.listen({ port: config.port, host: config.host });
    console.log(`Server running at http://${config.host}:${config.port}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

init();
