# NowPlaying Server

A simple HTTP server that provides a REST API for controlling and retrieving information about the currently playing media on macOS.

## Requirements

- Node.js `v20.0.0` or later
- `nowplaying-cli` must be installed and available in your PATH

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/zalishchuk/nowplaying-server.git
   cd nowplaying-server
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Make sure the `nowplaying-cli` is installed:
   ```
   which nowplaying-cli
   ```
   If not installed, follow the installation instructions for [`nowplaying-cli`](https://github.com/kirtan-shah/nowplaying-cli).

## Usage

Start the server:

```
npm start
```

By default, the server runs on `0.0.0.0:3000`. You can configure the host and port using environment variables:

```
PORT=4000 HOST=localhost npm start
```

## API Endpoints

### Media Control

- `GET /command/play` - Start playback
- `GET /command/pause` - Pause playback
- `GET /command/togglePlayPause` - Toggle between play and pause
- `GET /command/next` - Skip to next track
- `GET /command/previous` - Go to previous track

### Media Information

- `GET /info` - Get information about current media
- `GET /info?artwork` - Get information including base64-encoded artwork

## Example Response

```json
{
  "album": "",
  "artist": "M539 Restorations",
  "artworkDataHeight": 83,
  "artworkDataWidth": 150,
  "artworkIdentifier": "94f585d110b8d7a0",
  "artworkMIMEType": "image/jpeg",
  "contentItemIdentifier": "EDB6BDDA-206B-4DA8-82C1-D0990D9B4644",
  "currentPlaybackDate": "2025-04-04 07:45:15 +0000",
  "duration": "4046.761",
  "elapsedTime": "2341.986012",
  "playbackRate": 0,
  "timestamp": "2025-04-04 18:34:31 +0000",
  "title": "I Traveled 5000 Miles to Save $17000 on a Rare BMW M Car"
}
```

> [!TIP]
When requesting with `artwork`, you'll also receive an `artworkData` field containing a base64-encoded image with data URI format.
