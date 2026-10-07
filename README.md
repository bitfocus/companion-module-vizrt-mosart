# companion-module-vizrt-mosart

A Bitfocus Companion module for controlling Vizrt Mosart. It talks to Mosart over the Web API or the REST API, so you can run the rundown, take templates, fire control commands and show Mosart state on your buttons.

Setup, actions, feedbacks and presets are described in [HELP.md](./companion/HELP.md).

## Release notes

### 1.5.0

- Lots of new control command actions for devices, servers and faders
- Optional polling for the timeline, audio toggles, fader levels and on-air graphics. Everything is off by default, so nothing changes until you turn it on
- New feedbacks and variables for that state, plus presets for timeline, audio, faders and on-air graphics
- The camera and external presets are now preset groups you can configure: template type, variant, label, bus, count, icon and colour. There are six slots
- Audio toggle presets (HA, HV, K, FM, L2P, L2O) now send the matching command when pressed and light up blue when on
- New instances get "CAM" as the default label. Existing instances keep their old labels, including "KAM"

### 1.4.1

- Polling backs off while the server is unreachable, and an empty host no longer starts a retry loop

### 1.4.0

- Log level setting, so the log isn't flooded with poll responses. Defaults to Warning

### 1.3.0

- Poll interval can be set in the config (defaults to 1000 ms, same as before)

### 1.2.1

- HTTPS works with the self-signed certificate Mosart ships with

### 1.2.0

- HTTPS support

### 1.1.0

- Overlay list (experimental, needs Mosart 5.13 or newer): story navigation, overlay buttons and a take-out-last button
- Camera and external preset names can be changed

### 1.0.0

- Fixed control commands
- Fixed status polling after changing the connection settings
- Module ID changed to `vizrt-mosart`

## Development

Run `yarn` to install dependencies.

- `yarn build` builds the module once. That's enough for Companion to load it
- `yarn dev` rebuilds when files change
- `yarn package` builds a `.tgz` you can import into Companion
- `yarn package:to <folder>` builds the package and puts it in a folder, for example straight into your Companion modules folder:

```powershell
yarn package:to "C:\Users\<you>\AppData\Roaming\Bitfocus\Buttons\modules\vizrt-mosart_1.5.0"
```

The target folder is deleted and replaced, so don't point it at anything you want to keep.

## License

MIT, see [LICENSE](./LICENSE).
