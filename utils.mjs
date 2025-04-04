export function parseDictionary(input) {
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
    } else {
      result[key] = value;
    }

    const parsedNumber = Number(result[key]);
    if (!isNaN(parsedNumber) && result[key] !== '') result[key] = parsedNumber;
  }

  return result;
}

export function transformMediaInfoKeys(input) {
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
