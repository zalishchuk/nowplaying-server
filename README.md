# NowPlaying Server

A simple HTTP server that provides a REST API for controlling and retrieving information about the currently playing media on macOS.

## Requirements

- macOS `<15.4`
- Node.js `>=20.0.0` 

> [!CAUTION]
> macOS 15.4 doesn't allow third party apps to access the system's "Now Playing" information anymore.
>
> https://forum.keyboardmaestro.com/t/beware-upgrading-to-macos-15-4-if-you-need-now-playing-data/40285
> 
> https://community.folivora.ai/t/now-playing-is-no-longer-working-on-macos-15-4/42802

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/zalishchuk/nowplaying-server.git && cd nowplaying-server
   ```

2. Install dependencies:

   ```
   npm install
   ```

## Usage

Start the server:

```
npm start
```

By default, the server runs on `0.0.0.0:3333`. You can configure the `host` and `port` using environment variables:

```
PORT=4000 HOST=localhost npm start
```

> [!TIP]
> You can also use a `.env*` to configure environment variables.

## API Endpoints

### Media Control

- `GET /command/play` - Start playback
- `GET /command/pause` - Pause playback
- `GET /command/toggle` - Toggle between play and pause
- `GET /command/next` - Skip to next track
- `GET /command/previous` - Go to previous track

### Media Information

- `GET /` - Get information about current media
- `GET /?raw` - Get raw information about current media
- `GET /?artwork` - Get information including artwork

## Example Response

```json
{
  "album": "",
  "artist": "M539 Restorations",
  "contentItemIdentifier": "EDB6BDDA-206B-4DA8-82C1-D0990D9B4644",
  "currentPlaybackDate": "2025-04-04 07:45:15 +0000",
  "duration": 4046.761,
  "elapsedTime": 2341.986012,
  "playbackRate": 0,
  "timestamp": "2025-04-04 18:34:31 +0000",
  "title": "I Traveled 5000 Miles to Save $17000 on a Rare BMW M Car"
}
```
