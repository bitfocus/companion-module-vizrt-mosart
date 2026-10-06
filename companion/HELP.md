# Vizrt Mosart Control Module

## Overview

This module provides comprehensive control of Vizrt Mosart newsroom automation systems via the Mosart REST API and Web API. It enables operators to control rundown playback, manage templates, control graphics overlays, and integrate with various broadcast equipment through Mosart's extensive control commands.

## Connection Configuration

### Target IP or Hostname

Enter the IP address or hostname of your Mosart server. This field is required. If it is blank, the module stays idle (`Bad Config`) and does not open HTTP connections or poll. That prevents an unconfigured instance from retrying `http://undefined:...` or `http://:...` in a tight loop.

### Use Web API

- **Enabled (default)**: Uses the Mosart Web API on port 55142 (default)
- **Disabled**: Uses the Mosart REST API on port 55167 (default)

### Target Port

The port number for the Mosart API:

- Web API default: `55142`
- REST API default: `55167`

### API Key

Required authentication key for accessing the Mosart API. Obtain this from your Mosart system administrator.

### Log Level

Controls how much detail the module writes to the Companion log:

- **Off**: No logging at all
- **Error**: Failed requests and connection errors only
- **Warning (default)**: Errors plus warnings, such as connection loss or actions triggered with missing parameters
- **Info**: Adds startup, configuration, and connection state changes
- **Debug**: Adds every API request and response, including poll traffic. Very verbose - intended for troubleshooting only

Because the module polls the Mosart server every second while connected, leaving this on **Debug** for long periods will fill the Companion log quickly. Repeating messages (such as a server that stays unreachable) are only logged when the connection state actually changes.

While the connection is down, poll retries back off (2s, 4s, 8s, … up to 30s at the default interval) instead of retrying on every poll tick. The interval returns to the configured value as soon as a poll succeeds.

### Enable Overlay List (Experimental)

**Requires Mosart version 5.13.0 or higher**

When enabled, this feature:

- Fetches and tracks overlay graphics from the Mosart API
- Creates dynamic variables for each story containing overlay information
- Enables story navigation actions and presets
- Provides up to 20 overlay buttons per story with automatic variable population
- Tracks the last taken overlay for easy take-out operations

The overlay list is not polled. It is fetched once each time the connection to Mosart comes up, and again whenever the **Refresh Overlay List** action runs.

**Note**: This feature is experimental and may require additional configuration in your Mosart system.

### Additional State Polling

All of these options are off by default. Each one you enable adds one request to the Mosart server per poll interval. They run alongside the status poll, so a slow endpoint does not delay the status update. Enable only the ones your buttons use; a feedback or variable that depends on a disabled option stays inactive.

- **Poll timeline stories/items (default off)**: Feeds the Timeline Story/Item Match feedback and the `timeline_*` variables
  - Item slugs are template names (for example `DVE` or `HK`), so matching an item slug tells you which kind of item is on air rather than which specific one. MOS video clips use the clip ID as their slug, which shows up as a GUID. To match specific content, use the story slug instead
- **Poll audio toggles (default off)**: Feeds the Audio Toggle State feedback, the audio toggle presets and the `audioToggle_*` variables
- **Poll fader levels (default off)**: Feeds the Fader Level feedback and the `fader_*` variables. If two channel names produce the same variable ID, the later one (alphabetically) gets a `_2`, `_3`, … suffix
- **Poll on-air graphics (default off)**: Feeds the Graphic On Air feedback and the `onair_graphics_*` variables

If the fader levels request returns 404 (for example on an older Mosart version), the module pauses it for 60 seconds instead of retrying on every poll. A 404 from the on-air graphics request is treated as "nothing on air".

### Preset Groups

Preset groups build numbered sets of **Take template** buttons from a template type, variant and bus, so the presets match the template names used in your Mosart setup. Tick **Show preset groups** to see the settings. Hiding them again does not reset them; the values still apply.

There are 6 slots. Slots 1-3 are enabled by default and recreate the original presets:

| Slot | Name             | Type   | Variant   | Bus     | Label           |
| ---- | ---------------- | ------ | --------- | ------- | --------------- |
| 1    | Hard Cameras     | Camera | `{n}HARD` | Program | `CAM {n}\nHARD` |
| 2    | Soft Cameras     | Camera | `{n}SOFT` | Program | `CAM {n}\nSOFT` |
| 3    | External Sources | Live   | `{n}`     | Preview | `EXT {n}`       |

Connections created before 1.5.0 keep their earlier labels, including "KAM" on the camera presets.

Each enabled slot has these settings:

- **Name**: Header above the group in the preset list, and the start of each preset's name
- **Category**: Preset category the group appears in. Several groups can share a category, like the two camera groups
- **Number of presets**: How many buttons to create (1-20), numbered from 1
- **Template type**: The Mosart template type, e.g. Camera, Live, Package, DVE
- **Variant**: The template variant. `{n}` is replaced by the button number, so `{n}HARD` gives `1HARD`, `2HARD`, … A variant without `{n}` gets the number added at the end, so `KAM` gives `KAM1`, `KAM2`, …
- **Bus**: Program or Preview. **Insert** (Preview only) inserts the template into preview instead of replacing it
- **Button label**: Text on each button. `{n}` is replaced by the number, and typing `\n` gives a line break
- **Icon** and **Background**: Button look. The text colour is picked automatically to stay readable

A blank text field uses the slot's default. Companion copies a preset onto a button when you drag it, so a change only shows on presets placed after it. Buttons that are already placed keep their text and template; edit those buttons directly or place the preset again.

---

## Available Actions

### Rundown Control

- **Reload Rundown**: Reloads the current rundown
- **Start/Continue**: Start or continue rundown playback with options for transition type (Default, Continue, Mix, Wipe, Effect), rate, effect number, and delay
- **Start from Top**: Restart the rundown from the first story
- **Skip to Next Story**: Skip to the next story in the rundown
- **Unskip Next Story**: Unskip the next story
- **Skip to Next Subitem**: Skip to the next subitem within a story
- **Unskip Next Subitem**: Unskip the next subitem
- **Set as Next**: Set a specific story as next by Story ID
- **Toggle Rehearsal Mode**: Toggle rehearsal mode on/off
- **Open Rundown**: Open a rundown by ID

### Template Control

- **Take Template**: Execute a template with options for type (Camera, Package, VoiceOver, Live, Graphics, DVE, Jingle, Telephone, AdlibPix, Break, VideoWall, Sound, Accessories), variant, and bus (Program/Preview)
- **Direct Take**: Execute a DirectTake template by number

### Overlay Graphics Control (when Overlay List enabled)

- **Refresh Overlay List**: Manually refresh the overlay list from Mosart
- **Select Next Story**: Navigate to the next story in the overlay list
- **Select Previous Story**: Navigate to the previous story
- **Select Story by ID**: Jump to a specific story by its ID
- **Select Story by Index**: Jump to a story by its position (1-based)
- **Trigger Overlay from Current Story**: Take an overlay by index (0-19) from the currently selected story
- **Take Overlay In**: Take an overlay in by ID or name (slug)
- **Take Overlay Out**: Take an overlay out by ID or name
- **Take Out Last Taken Overlay**: Quickly take out the last overlay that was taken in

### Control Commands

The module includes extensive control command actions for advanced Mosart integration:

**Automation & Playback**

- Auto Take (toggle/activate/deactivate)
- Play Story by name
- Auto Trans (with mix effect and transition rate)

**Graphics**

- Overlay Graphics (continue, take manual out, take all out, take last out, pretake next, clear, macro, take named overlay)
- Fullscreen Graphics (continue, macro)
- Graphics Profile selection
- Switch/Enable Graphics Mirroring
- Overlay to Manual (selected/onair/preview targets)

**Video Control**

- Video Wall Mode
- Video Port (play, pause, stop, cue, recue, loop control)
- Video Server Goto (frame-based positioning)
- Get Player Status
- Set Video Server Salvo
- Switch Video Server Mirroring
- Record (prepare, start, stop, delete, get SOM)

**Switcher Control**

- Set Crosspoint (with mix effect and bus selection)
- Set Aux Crosspoint
- Transition Type (mix, wipe, effect, cut, toggle)
- DVE (forward/reverse direction)
- Take Server to Program
- Engine Switcher (init, preset style, goto prev preset)
- Switch Genlock Mode

**Audio**

- Audio (fade manual, fade out keeps, freeze audio, set level to preview/onair, fade down/up controls)

**Other Controls**

- Release Background
- Marked (with description)
- Accessories
- Light (scene control)
- Sequence (start, stop, loop, stop loop)
- Weather (play, continue, goto first)
- Studio Setup
- NCS (start/stop status)
- Rundown NCS Resync
- User Message
- GUI
- As Run Log Event
- Device Properties

### Connection Management

- **Set Connection String**: Update the connection host dynamically

---

## Available Feedbacks

### Mosart Status

Indicates whether the module is successfully connected to the Mosart server.

- **Default Style**: Green background when connected

### Rehearsal Status

Shows the current rehearsal mode state.

- **Default Style**: Yellow/gold background when rehearsal mode is active

### Timeline Status

Indicates whether the rundown timeline is currently running.

- **Default Style**: Green background with "F12 (Running)" text when timeline is active

---

## Available Variables

### System Variables

- `state`: Current Mosart state
- `timeline`: Timeline status
- `autoTake`: Auto take status
- `rehearsalMode`: Rehearsal mode status
- `crossoverClient`: Crossover client information
- `serverDescription`: Mosart server description
- `connectionString`: Current connection string

### Overlay List Variables (when enabled)

**Story Navigation**

- `current_story_id`: ID of the currently selected story
- `current_story_index`: Index of the current story (1-based)
- `story_count`: Total number of stories with overlays
- `current_story_overlay_count`: Number of overlays in the current story
- `last_taken_overlay_id`: ID of the last overlay taken in

**Current Story Overlays (0-19)**
For each overlay index (0-19) in the current story:

- `current_overlay_N_id`: Overlay ID
- `current_overlay_N_description`: Overlay description
- `current_overlay_N_variant`: Template variant
- `current_overlay_N_handler`: Handler name
- `current_overlay_N_slug`: Full slug name
- `current_overlay_N_overlayType`: Parsed overlay type (from slug)
- `current_overlay_N_overlayName`: Parsed overlay name (from slug)

**Per-Story Overlay Variables**
For each story with overlays (sanitized story ID):

- `overlay_STORYID_story_index`: Story index
- `overlay_STORYID_count`: Number of overlays in story
- `overlay_STORYID_N_id`: Overlay ID
- `overlay_STORYID_N_type`: Template type
- `overlay_STORYID_N_variant`: Template variant
- `overlay_STORYID_N_slug`: Slug name
- `overlay_STORYID_N_handler`: Handler name
- `overlay_STORYID_N_description`: Description
- `overlay_STORYID_N_in`: In point
- `overlay_STORYID_N_duration`: Duration
- `overlay_STORYID_N_graphics_id`: Graphics ID (if available)
- `overlay_STORYID_N_overlayType`: Parsed overlay type
- `overlay_STORYID_N_overlayName`: Parsed overlay name

---

## Available Presets

### Rundown Category

- **F12 (Start/Continue)**: Quick button to start or continue the rundown
- **Toggle Rehearsal Mode**: Button with feedback showing rehearsal status
- **Set Server Active**: Takes the server out of idle; turns green when the server is active

### Preset Group Categories (Camera, External, and your own)

- **Hard Cameras (1-10)** and **Soft Cameras (1-10)** in **Camera**, and **External Sources (1-10)** in **External**, by default
- Each enabled preset group adds its numbered buttons to its category; see **Preset Groups** above

### Status Category

- **Mosart Status**: Connection status indicator with feedback
- **Auto Take**, **Crossover Client**, **Server Description**: Indicators for the matching server status
- **Timeline State**: Shows the timeline state; green when running, orange when paused
- **Server State**: Shows Active/Idle; green when active, orange when idle
- **Mosart Version**: Shows the Mosart server version

### Categories that need Additional State Polling

The presets below only update when the matching option under **Additional State Polling** is enabled. Each of these categories starts with a header that says which option it needs, and shows a ⚠ warning while that option is off.

- **Timeline** (needs "Poll timeline stories/items")
  - **Current Story / Next Story / Current Item / Next Item**: Show the slug of each
  - **Story On Air / Story Next**: Light up when the current or next story has a given slug. Open the feedback on the button and type the slug
- **Audio** (needs "Poll audio toggles")
  - One button per audio toggle that lights up when the toggle is on. Fade Manual, Level 2 Preview and Level 2 On Air also send the matching audio command when pressed
- **Faders** (needs "Poll fader levels")
  - One button per fader channel showing its level, turning green when the fader is open (above 0). These are built from the channels the server reports, so they appear after the first fader poll
- **On-Air Graphics** (needs "Poll on-air graphics")
  - **Any Graphic On Air**: Shows how many graphics are on air; red while any are
  - **On-Air Graphic Slugs**: Lists the slugs of the graphics on air
  - **Graphic On Air**: Lights up when a graphic with a given slug is on air. Open the feedback on the button and type the slug

### Story Navigation Category (when Overlay List enabled)

- **Current Story**: Displays the current story ID
- **Previous Story**: Navigate to previous story
- **Next Story**: Navigate to next story
- **Refresh**: Manually refresh the overlay list

### Overlays Category (when Overlay List enabled)

- **Overlay Buttons (0-19)**: Dynamic buttons showing overlay names from the current story, automatically populated with variables
- **Take Out Last**: Quick button to take out the last taken overlay

---

## Usage Tips

1. **Initial Setup**: Ensure your API key is correct and the appropriate API type (Web/REST) is selected for your Mosart version.

2. **Preset Groups**: Build template buttons that match your Mosart setup. For example, if your camera templates are called `KAM1`, `KAM2`, …, set a group's variant to `KAM{n}`; to add a row of package buttons, enable a spare slot with type Package. Changes apply to presets you place afterwards, not to buttons already on your pages.

3. **Overlay List Feature**: Enable this for advanced graphics control. The module will automatically fetch overlay information and create dynamic buttons. Use the story navigation to browse through different stories and their associated overlays.

4. **Variables in Presets**: The preset buttons use variables (e.g., `$(mosart:current_overlay_0_overlayName)`, where `mosart` is your connection's label) to dynamically display information. These update automatically as you navigate stories.

5. **Control Commands**: The extensive control command actions provide low-level access to Mosart functions. Consult your Mosart documentation for specific parameter requirements.

6. **Polling**: The module polls the Mosart server at regular intervals (default 1000ms) to update status and variables. Failed polls use exponential backoff (capped at 30s) so a down or unconfigured server does not flood the network.

---

## Troubleshooting

- **Connection Issues**: Verify the IP address, port, and API key. Check that the Mosart server is accessible on the network.
- **Instance shows Bad Config / Target IP or Hostname is not set**: The host field is empty. Enter a valid Mosart address, or disable the unused connection instance. The module will not poll until a host is set.
- **Server unreachable**: The module keeps retrying, but each failed poll doubles the wait (up to 30s) so a down server does not generate thousands of requests per hour.
- **Overlay List Not Working**: Ensure you're running Mosart 5.13.0 or higher and that the overlay list feature is properly configured in Mosart.
- **Diagnosing a Problem**: Temporarily set **Log Level** to `Debug` to see every API request and response, then set it back to `Warning` when you're done.

---

## Support

For issues, feature requests, or contributions, please use [**Github**](https://github.com/bitfocus/companion-module-vizrt-mosart/issues)

## License

This module is licensed under the MIT License.
