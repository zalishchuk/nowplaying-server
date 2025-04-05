import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Parses a dictionary-like string format into object.
 *
 * @param {string} rawInput - The string representation of the dictionary
 * @returns {Object} - The parsed object representation of the input dictionary
 */
export function parseDictionary(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return {};

  let input = rawInput.trim();
  if (input.startsWith('{')) input = input.slice(1);
  if (input.endsWith('}')) input = input.slice(0, -1);

  const result = {};
  const parts = input.split(';').filter(Boolean);

  for (const part of parts) {
    const equalIndex = part.indexOf('=');
    if (equalIndex === -1) continue;

    const key = part.slice(0, equalIndex).trim();
    const value = part.slice(equalIndex + 1).trim();

    if (value.startsWith('{') && value.endsWith('}')) {
      result[key] = parseDictionary(value);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      result[key] = value.slice(1, -1);
    } else {
      result[key] = value;
    }

    const parsedNumber = Number(result[key]);
    if (!Number.isNaN(parsedNumber) && result[key] !== '') result[key] = parsedNumber;
  }

  return result;
}

/**
 * Lowercases the first letter of a string.
 *
 * @param {string} input - The input string to lowercase
 * @returns {string} The input string with the first letter lowercased
 */
export function lowercaseFirst(input) {
  if (!input || typeof input !== 'string' || input.length === 0) return input;

  return input.charAt(0).toLowerCase() + input.slice(1);
}

/**
 * Transforms keys in a media information object, removing a specified prefix from keys.
 *
 * @param {Object} input - The input object whose keys should be transformed.
 * @param {string} [prefix='kMRMediaRemoteNowPlayingInfo'] - The prefix to remove from keys.
 * @returns {Object} A new object with transformed keys, or the original value if input is not an object.
 */
export function transformMediaInfoKeys(input, prefix = 'kMRMediaRemoteNowPlayingInfo') {
  if (typeof input !== 'object' || input === null) return input;

  return Object.entries(input).reduce((acc, [key, value]) => {
    const newKey = key.startsWith(prefix) ? lowercaseFirst(key.replace(prefix, '')) : key;
    acc[newKey] = value;
    return acc;
  }, {});
}

/**
 * Removes keys with a specific prefix from an object.
 *
 * @param {Object} input - The input object to process
 * @param {string} prefix - The prefix to match for removal
 * @returns {Object} A new object with matching keys removed
 */
export function removeKeysWithPrefix(input, prefix) {
  if (typeof input !== 'object' || input === null) return input;

  return Object.entries(input).reduce((result, [key, value]) => {
    if (!key.startsWith(prefix)) result[key] = value;
    return result;
  }, {});
}

/**
 * Creates a function that executes a binary with provided arguments.
 *
 * @param {string} binaryPath - The path to the binary file to be executed.
 * @returns {Function} A function that takes arguments and executes the binary with them.
 */
export function createExecutor(binaryPath) {
  return async (...args) => {
    const { stdout, stderr } = await execFileAsync(binaryPath, args);
    if (stderr) console.error(stderr);
    return stdout;
  };
}

/**
 * Builds a base64 data URI from a mime type and base64 data.
 *
 * @param {string} mimeType - The MIME type of the data (e.g., 'image/jpeg', 'text/plain').
 * @param {string} base64Data - The base64-encoded data to include in the URI.
 * @returns {string} A complete data URI in the format 'data:[mimeType];base64,[base64Data]'.
 */
export function buildBase64DataUri(mimeType, base64Data) {
  return `data:${mimeType};base64,${String(base64Data).trim()}`;
}

/**
 * Checks if a file is executable.
 *
 * @param {string} path - The path to the file to check.
 * @returns {boolean} True if the file at the specified path is executable, false otherwise.
 * @throws {TypeError} If the file at the specified path does not exist or is not executable
 */
export function canExecFile(path) {
  try {
    fs.accessSync(path, fs.constants.X_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Ensures an executable is available, first checking for a local binary, then falling back to a global.
 *
 * @param {string} path - Path to the local executable binary to check first
 * @param {string} globalPath - Name of the global executable to use as fallback
 * @returns {string} The path to the available executable
 * @throws {Error} If neither the local nor global binary is accessible
 */
export function ensureExecutable(path, globalPath) {
  if (canExecFile(path)) return path;

  try {
    const binaryPath = execFileSync('which', [globalPath], { encoding: 'utf-8' }).trim();
    if (!binaryPath) throw new Error('Executable Not Found');

    console.log(`Warning: Local executable not found at ${path}`);
    console.log(`Using fallback global executable from ${binaryPath}`);
    return binaryPath;
  } catch (error) {
    console.log(error);
    throw new Error(`Executable Not Found: ${path} and ${globalPath} are not accessible.`);
  }
}
