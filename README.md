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
  "album": "electrock",
  "artist": "m.o.v.e",
  "artworkData": "data:image/jpeg;base64,{encoded_image_data}",
  "artworkDataHeight": 600,
  "artworkDataWidth": 600,
  "artworkIdentifier": "a18c1884c58f81f6",
  "artworkMIMEType": "image/jpeg",
  "contentItemIdentifier": "12618E11-E70B-42D8-A69E-9BFE2356714B",
  "discNumber": 1,
  "duration": 272.966,
  "elapsedTime": 46.636212,
  "mediaType": "kMRMediaRemoteNowPlayingInfoTypeAudio",
  "playbackRate": 1,
  "timestamp": "2025-04-05 01:09:57 +0000",
  "title": "Rage your dream",
  "totalDiscCount": 1,
  "totalTrackCount": 11,
  "trackNumber": 4
}
```
