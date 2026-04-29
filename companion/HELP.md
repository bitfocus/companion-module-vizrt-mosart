# Vizrt Mosart Control Module

## Overview

This module provides comprehensive control of Vizrt Mosart newsroom automation systems via the Mosart REST API and Web API. It enables operators to control rundown playback, manage templates, control graphics overlays, and integrate with various broadcast equipment through Mosart's extensive control commands.

## Connection Configuration

### Target IP or Hostname
Enter the IP address or hostname of your Mosart server.

### Use Web API
- **Enabled (default)**: Uses the Mosart Web API on port 55142 (default)
- **Disabled**: Uses the Mosart REST API on port 55167 (default)

### Target Port
The port number for the Mosart API:
- Web API default: `55142`
- REST API default: `55167`

### API Key
Required authentication key for accessing the Mosart API. Obtain this from your Mosart system administrator.

### Enable Overlay List (Experimental)
**Requires Mosart version 5.13.0 or higher**

When enabled, this feature:
- Fetches and tracks overlay graphics from the Mosart API
- Creates dynamic variables for each story containing overlay information
- Enables story navigation actions and presets
- Provides up to 20 overlay buttons per story with automatic variable population
- Tracks the last taken overlay for easy take-out operations

**Note**: This feature is experimental and may require additional configuration in your Mosart system.

### Preset Customization
Customize the text displayed on preset buttons for cameras and external sources. This allows you to match the terminology used in your production environment.

- **Camera Hard Preset Name**: Text to display for hard camera presets (default: "HARD")
  - Examples: "HARD", "H", "DIR", "CUT"
- **Camera Soft Preset Name**: Text to display for soft camera presets (default: "SOFT")
  - Examples: "SOFT", "S", "MIX", "FADE"
- **External Preset Name**: Text to display for external source presets (default: "EXT")
  - Examples: "EXT", "LIVE", "FEED", "REMOTE"

Leave fields blank to use the default values. Changes will be reflected in all camera and external presets.

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

### Camera Category
- **Hard Cameras (1-10)**: Pre-configured camera buttons for hard camera takes (KAM 1-10 HARD)
  - Button text can be customized via the "Camera Hard Preset Name" config field
- **Soft Cameras (1-10)**: Pre-configured camera buttons for soft camera takes (KAM 1-10 SOFT)
  - Button text can be customized via the "Camera Soft Preset Name" config field

### External Category
- **External Sources (1-10)**: Pre-configured buttons for external sources (EXT 1-10) to preview
  - Button text can be customized via the "External Preset Name" config field

### Status Category
- **Mosart Status**: Connection status indicator with feedback

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

2. **Preset Customization**: Customize camera and external preset button labels to match your production terminology. For example, if your facility uses "CUT" instead of "HARD" or "LIVE" instead of "EXT", you can configure these in the module settings. Changes will automatically update all preset buttons.

3. **Overlay List Feature**: Enable this for advanced graphics control. The module will automatically fetch overlay information and create dynamic buttons. Use the story navigation to browse through different stories and their associated overlays.

4. **Variables in Presets**: The preset buttons use variables (e.g., `$(mosart:current_overlay_0_overlayName)`) to dynamically display information. These update automatically as you navigate stories.

5. **Control Commands**: The extensive control command actions provide low-level access to Mosart functions. Consult your Mosart documentation for specific parameter requirements.

6. **Polling**: The module polls the Mosart server at regular intervals (default 1000ms) to update status and variables.

---

## Troubleshooting

- **Connection Issues**: Verify the IP address, port, and API key. Check that the Mosart server is accessible on the network.
- **Overlay List Not Working**: Ensure you're running Mosart 5.13.0 or higher and that the overlay list feature is properly configured in Mosart.

---

## Support

For issues, feature requests, or contributions, please use [**Github**](https://github.com/bitfocus/companion-module-vizrt-mosart/issues)

## License

This module is licensed under the MIT License.
