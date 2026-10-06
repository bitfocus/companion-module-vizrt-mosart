import { BusType, DeviceApiType, DeviceApiTypeWithId } from './api.js'
import { MosartInstance } from './main.js'
import { TEMPLATE_TYPES } from './presetGroups.js'

const deviceTypes: DeviceApiType[] = [
	'switcher',
	'video',
	'audio',
	'audio-player',
	'fullscreen-graphics',
	'graphics',
	'robotic-camera',
	'gpi',
	'lights',
	'router',
	'subtitling',
	'video-wall',
	'weather',
	'virtual-set',
	'loudness',
	'generic-rest',
]

const deviceTypesWithId: DeviceApiTypeWithId[] = ['graphics', 'fullscreen-graphics', 'robotic-camera', 'generic-rest']

function deviceTypeChoices(types: string[]): { id: string; label: string }[] {
	return types.map((type) => ({
		id: type,
		label: type
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' '),
	}))
}

const busChoices = [
	{ id: 'Program', label: 'Program' },
	{ id: 'Preview', label: 'Preview' },
]

const standbyOption = {
	type: 'dropdown',
	label: 'Standby',
	id: 'standby',
	choices: [
		{ id: 'true', label: 'On (standby)' },
		{ id: 'false', label: 'Off (active)' },
	],
	default: 'true',
}

export function UpdateActions(self: MosartInstance): void {
	const actions: any = {
		reload: {
			name: 'Reload rundown',
			options: [],
			callback: async () => {
				await self.mosartAPI.reloadRundown()
			},
		},
		start_continue: {
			name: 'Start/Continue the rundown',
			options: [
				{
					type: 'dropdown',
					choices: [
						{ id: 'Default', label: 'Default' },
						{ id: 'Continue', label: 'Continue' },
						{ id: 'Mix', label: 'Mix' },
						{ id: 'Wipe', label: 'Wipe' },
						{ id: 'Effect', label: 'Effect' },
					],
					label: 'Option',
					id: 'option',
					default: 'Default',
				},
				{
					type: 'number',
					label: 'Rate',
					id: 'rate',
					tooltip: 'The transition rate for mix/wipe',
					default: 0,
					min: 0,
					max: 1000000,
				},
				{
					type: 'number',
					label: 'Effect',
					id: 'effect',
					tooltip: 'The effect number',
					default: 0,
					min: 0,
					max: 100,
				},
				{
					type: 'number',
					label: 'Delay',
					id: 'delay',
					tooltip: 'The delay in milliseconds for continue',
					default: 0,
					min: 0,
					max: 1000000,
				},
			],
			callback: async (action: any) => {
				await self.mosartAPI.startContinue(action.options)
			},
		},
		skip_next: {
			name: 'Skip to next story',
			options: [],
			callback: async () => {
				await self.mosartAPI.skipNext()
			},
		},
		unskip_next: {
			name: 'Unskip to next story',
			options: [],
			callback: async () => {
				await self.mosartAPI.unskipNext()
			},
		},
		skip_next_subitem: {
			name: 'Skip to next subitem',
			options: [],
			callback: async () => {
				await self.mosartAPI.skipNextSubitem()
			},
		},
		unskip_next_subitem: {
			name: 'Unskip to next subitem',
			options: [],
			callback: async () => {
				await self.mosartAPI.unskipNextSubitem()
			},
		},
		start_from_top: {
			name: 'Restart the rundown from the first story',
			options: [],
			callback: async () => {
				await self.mosartAPI.startFromTop()
			},
		},
		set_as_next: {
			name: 'Set the current story as next',
			options: [
				{
					type: 'textinput',
					label: 'Story ID',
					id: 'storyId',
					default: '',
				},
			],
			callback: async (action: any) => {
				const options = {
					storyId: action.options.storyId as string,
				}
				await self.mosartAPI.setAsNext(options)
			},
		},
		rehearsal_mode: {
			name: 'Toggle Rehearsal Mode',
			options: [],

			callback: async () => {
				const currentState = self.mosartAPI.getRehearsalModeStatus()
				self.logMsg('debug', `Rehearsal mode current state: ${currentState}`)
				const newState = !currentState

				await self.mosartAPI.setRehearsalMode({ state: newState })
				self.checkFeedbacks('RehearsalStatus')
			},
		},
		template: {
			name: 'Take template',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					choices: TEMPLATE_TYPES.map((type) => ({ id: type, label: type })),
					default: 'Camera',
				},
				{
					type: 'textinput',
					label: 'Variant',
					id: 'variant',
					default: '',
				},
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					choices: [
						{ id: 'Program', label: 'Program' },
						{ id: 'Preview', label: 'Preview' },
					],
					default: '',
				},
				{
					type: 'checkbox',
					label: 'Insert',
					id: 'insert',
					tooltip: 'Insert the template into preview. Only used when the bus is Preview',
					default: false,
				},
			],
			callback: async (action: any) => {
				const options: { type: string; variant: string; bus: string; insert?: boolean } = {
					type: action.options.type as string,
					variant: action.options.variant as string,
					bus: action.options.bus as string,
				}
				if (action.options.insert && options.bus === 'Preview') options.insert = true
				await self.mosartAPI.takeTemplate(options)
			},
		},
		direct_take: {
			name: 'Executes a DirectTake template',
			options: [
				{
					type: 'number',
					label: 'Number',
					id: 'number',
					default: 1,
					min: 1,
					max: 10000000,
				},
			],
			callback: async (action: any) => {
				const options = {
					number: action.options.number as number,
				}
				await self.mosartAPI.directTakeTemplate(options)
			},
		},
		control_command: {
			name: 'Control command',
			options: [
				{
					type: 'textinput',
					label: 'Command',
					id: 'command',
					default: '',
				},
			],
			callback: async (action: any) => {
				const commandString = action.options.command as string
				const [command, paramString] = commandString.split('?')
				const searchParams = new URLSearchParams(paramString || '')

				await self.mosartAPI.controlCommand(command, searchParams)
			},
		},
		open_rundown: {
			name: 'Open rundown',
			options: [
				{
					type: 'textinput',
					label: 'ID',
					id: 'id',
					default: '',
				},
			],
			callback: async (action: any) => {
				const options = {
					id: action.options.id as string,
				}
				await self.mosartAPI.openRundown(options)
			},
		},
		take_asset_template: {
			name: 'Take template by ID',
			options: [
				{
					type: 'textinput',
					label: 'Mosart item ID',
					id: 'mosartItemId',
					default: '',
				},
				{
					type: 'dropdown',
					label: 'Target',
					id: 'target',
					choices: busChoices,
					default: 'Program',
				},
				{
					type: 'checkbox',
					label: 'Insert',
					id: 'insert',
					tooltip: 'Insert the template into preview. Only used when the target is Preview',
					default: false,
				},
			],
			callback: async (action: any) => {
				const mosartItemId = action.options.mosartItemId as string
				if (!mosartItemId) {
					self.logMsg('warn', 'Take template by ID action called without an item ID - skipping')
					return
				}
				const target = action.options.target as BusType
				await self.mosartAPI.takeAssetTemplateById(
					mosartItemId,
					target,
					action.options.insert && target === 'Preview' ? true : undefined,
				)
			},
		},
		update_timeline_fields: {
			name: 'Update crosspoint on current item',
			description: 'Changes the crosspoint assignment of a newsroom tag field on the item on Program or Preview',
			options: [
				{
					type: 'dropdown',
					label: 'Target',
					id: 'target',
					choices: busChoices,
					default: 'Program',
				},
				{
					type: 'textinput',
					label: 'Newsroom tag',
					id: 'newsroomTag',
					tooltip: 'The field name to update, e.g. left or right',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Crosspoint',
					id: 'crosspoint',
					tooltip: 'The crosspoint to assign, e.g. INPUT 1',
					default: '',
				},
			],
			callback: async (action: any) => {
				const newsroomTag = action.options.newsroomTag as string
				const crosspoint = action.options.crosspoint as string
				if (!newsroomTag || !crosspoint) {
					self.logMsg('warn', 'Update crosspoint action called without a newsroom tag or crosspoint - skipping')
					return
				}
				await self.mosartAPI.updateTimelineFields(action.options.target as BusType, { newsroomTag, crosspoint })
			},
		},
		device_standby: {
			name: 'Set device type standby',
			description: 'Sets standby for all devices of a type',
			options: [
				{
					type: 'dropdown',
					label: 'Device type',
					id: 'type',
					choices: deviceTypeChoices(deviceTypes),
					default: 'switcher',
				},
				standbyOption,
			],
			callback: async (action: any) => {
				await self.mosartAPI.setDeviceStandby(action.options.type as DeviceApiType, action.options.standby === 'true')
			},
		},
		device_standby_by_id: {
			name: 'Set device standby by ID',
			options: [
				{
					type: 'dropdown',
					label: 'Device type',
					id: 'type',
					choices: deviceTypeChoices(deviceTypesWithId),
					default: 'graphics',
				},
				{
					type: 'textinput',
					label: 'ID',
					id: 'id',
					tooltip: 'The device or controller ID. For graphics this can be the engine ID or destination name',
					default: '',
				},
				standbyOption,
			],
			callback: async (action: any) => {
				const id = action.options.id as string
				if (!id) {
					self.logMsg('warn', 'Set device standby by ID action called without an ID - skipping')
					return
				}
				await self.mosartAPI.setDeviceStandbyById(
					action.options.type as DeviceApiTypeWithId,
					id,
					action.options.standby === 'true',
				)
			},
		},
		robotic_camera_standby: {
			name: 'Set robotic camera standby',
			options: [
				{
					type: 'number',
					label: 'Controller ID',
					id: 'controllerId',
					default: 1,
					min: 0,
					max: 10000,
				},
				{
					type: 'number',
					label: 'Device ID',
					id: 'deviceId',
					default: 1,
					min: 0,
					max: 10000,
				},
				standbyOption,
			],
			callback: async (action: any) => {
				await self.mosartAPI.setDeviceStandbyByIds(
					'robotic-camera',
					action.options.controllerId as number,
					action.options.deviceId as number,
					action.options.standby === 'true',
				)
			},
		},
		update_nrcs_settings: {
			name: 'Update NRCS settings',
			description: 'Changes the Mosart server NRCS configuration immediately, with no confirmation',
			options: [
				{
					type: 'textinput',
					label: 'Settings (JSON)',
					id: 'settings',
					tooltip: 'The NRCS settings to update, e.g. {"useBackServer": true}',
					default: '{}',
				},
			],
			callback: async (action: any) => {
				const settings = parseJsonOption(self, action.options.settings as string)
				if (!settings) return
				await self.mosartAPI.updateNrcsSettings(settings)
			},
		},
		server_active: {
			name: 'Set server active',
			description: 'Takes the Mosart server out of idle, like clicking the backend status indicator in the Mosart GUI',
			options: [],
			callback: async () => {
				await self.mosartAPI.setServerActive()
			},
		},
		set_fader_level: {
			name: 'Set fader level',
			options: [
				{
					type: 'textinput',
					label: 'Fader name',
					id: 'faderName',
					tooltip: 'The fader/channel name, e.g. CHN0',
					default: '',
				},
				{
					type: 'number',
					label: 'Level',
					id: 'level',
					tooltip: 'The normalized level to set, e.g. 0.75',
					default: 0.75,
					min: 0,
					max: 1,
					step: 0.01,
				},
			],
			callback: async (action: any) => {
				const faderName = action.options.faderName as string
				if (!faderName) {
					self.logMsg('warn', 'Set fader level action called without a fader name - skipping')
					return
				}
				await self.mosartAPI.setFaderLevel(faderName, action.options.level as number)
			},
		},
		update_media_server: {
			name: 'Update media server',
			description: 'Changes a media server configuration on the Mosart server immediately, with no confirmation',
			options: [
				{
					type: 'textinput',
					label: 'Server name',
					id: 'name',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Settings (JSON)',
					id: 'settings',
					tooltip: 'The properties to update, e.g. {"enable": true, "server": "localhost", "port": 3381}',
					default: '{"enable": true}',
				},
			],
			callback: async (action: any) => {
				const name = action.options.name as string
				if (!name) {
					self.logMsg('warn', 'Update media server action called without a server name - skipping')
					return
				}
				const settings = parseJsonOption(self, action.options.settings as string)
				if (!settings) return
				await self.mosartAPI.updateMediaServer(name, settings)
			},
		},
		upsert_named_overlay: {
			name: 'Create/update named overlay',
			description: 'Writes a named overlay on the Mosart server. Update replaces the whole item',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					choices: [
						{ id: 'create', label: 'Create' },
						{ id: 'update', label: 'Update' },
					],
					default: 'create',
				},
				{
					type: 'textinput',
					label: 'Slug',
					id: 'slug',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Item (JSON)',
					id: 'item',
					tooltip:
						'Named overlay properties, e.g. {"templatetype": "...", "contentItems": [{"elementName": "title", "value": "..."}]}',
					default: '{}',
				},
			],
			callback: async (action: any) => {
				const slug = action.options.slug as string
				if (!slug) {
					self.logMsg('warn', 'Named overlay action called without a slug - skipping')
					return
				}
				const item = parseJsonOption(self, action.options.item as string)
				if (!item) return
				if (action.options.mode === 'update') {
					await self.mosartAPI.updateNamedOverlay(slug, { ...item, slug })
				} else {
					await self.mosartAPI.createNamedOverlay({ ...item, slug })
				}
			},
		},
		delete_named_overlay: {
			name: 'Delete named overlay',
			description: 'Permanently deletes a named overlay from the Mosart server, with no confirmation',
			options: [
				{
					type: 'textinput',
					label: 'Slug',
					id: 'slug',
					default: '',
				},
			],
			callback: async (action: any) => {
				const slug = action.options.slug as string
				if (!slug) {
					self.logMsg('warn', 'Delete named overlay action called without a slug - skipping')
					return
				}
				await self.mosartAPI.deleteNamedOverlay(slug)
			},
		},
		// Control Commands
		autotake: {
			name: 'Auto Take (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'TOGGLE', label: 'Toggle' },
						{ id: 'ACTIVATE', label: 'Activate' },
						{ id: 'DEACTIVATE', label: 'Deactivate' },
						{ id: 'TRUE', label: 'True' },
						{ id: 'FALSE', label: 'False' },
					],
					default: 'TOGGLE',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				await self.mosartAPI.controlCommand('autotake', params)
			},
		},
		play_story: {
			name: 'Play Story (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Story Name',
					id: 'Story_Name',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				params.Story_Name = action.options.Story_Name as string
				await self.mosartAPI.controlCommand('play_story', params)
			},
		},
		videowallmode: {
			name: 'Video Wall Mode (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Mic Effect',
					id: 'MicEffect',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				params.MicEffect = action.options.MicEffect as string
				await self.mosartAPI.controlCommand('videowallmode', params)
				await self.mosartAPI.controlCommand('videowallmode', params)
			},
		},
		release_background: {
			name: 'Release Background (Control Command)',
			options: [
				{
					type: 'checkbox',
					label: 'Cue Only',
					id: 'CueOnly',
					default: false,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				params.CueOnly = (action.options.CueOnly as boolean).toString()
				await self.mosartAPI.controlCommand('release_background', params)
			},
		},
		overlay_graphics: {
			name: 'Overlay Graphics (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Render',
					id: 'Render',
					default: '',
				},
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'CONTINUE', label: 'Continue' },
						{ id: 'TAKE_MANUAL_OUT', label: 'Take Manual Out' },
						{ id: 'TAKE_ALL_OUT', label: 'Take All Out' },
						{ id: 'TAKE_LAST_OUT', label: 'Take Last Out' },
						{ id: 'PRETAKE_NEXT', label: 'Pretake Next' },
						{ id: 'CLEAR', label: 'Clear' },
						{ id: 'MACRO', label: 'Macro' },
						{ id: 'TAKE_NAMED_OVERLAY', label: 'Take Named Overlay' },
					],
					default: 'CONTINUE',
				},
				{
					type: 'textinput',
					label: 'Parameter',
					id: 'Parameter',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Value',
					id: 'Value',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Render?.length) params.Render = action.options.Render as string
				if (action.options.Action?.length) params.Action = action.options.Action as string
				if (action.options.Parameter?.length) params.Parameter = action.options.Parameter as string
				if (action.options.Value?.length) params.Value = action.options.Value as string
				await self.mosartAPI.controlCommand('overlay_graphics', params)
			},
		},
		marked: {
			name: 'Marked (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Description',
					id: 'Description',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Description?.length) params.Description = action.options.Description as string
				await self.mosartAPI.controlCommand('marked', params)
			},
		},
		directtake_cmd: {
			name: 'Direct Take (Control Command)',
			options: [
				{
					type: 'number',
					label: 'Template',
					id: 'Template',
					default: 1,
					min: 1,
					max: 10000000,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Template?.length) params.Template = (action.options.Template as number).toString()
				await self.mosartAPI.controlCommand('directtake', params)
			},
		},
		accessories_cmd: {
			name: 'Accessories (Control Command)',
			options: [],
			callback: async () => {
				await self.mosartAPI.controlCommand('accessories', {})
			},
		},
		ncs: {
			name: 'NCS (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'START_STATUS', label: 'Start Status' },
						{ id: 'STOP_STATUS', label: 'Stop Status' },
					],
					default: 'START_STATUS',
				},
				{
					type: 'textinput',
					label: 'Parameter',
					id: 'Parameter',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				if (action.options.Parameter) params.Parameter = action.options.Parameter as string
				await self.mosartAPI.controlCommand('ncs', params)
			},
		},
		rundown_ncs_resync: {
			name: 'Rundown NCS Resync (Control Command)',
			options: [],
			callback: async () => {
				await self.mosartAPI.controlCommand('rundown_ncs_resync', {})
			},
		},
		user_message: {
			name: 'User Message (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Message',
					id: 'Message',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Message?.length) params.Message = action.options.Message as string
				await self.mosartAPI.controlCommand('user_message', params)
			},
		},
		overlay_to_manual: {
			name: 'Overlay to Manual (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Target',
					id: 'Target',
					choices: [
						{ id: 'SELECTED', label: 'Selected' },
						{ id: 'ONAIR', label: 'On Air' },
						{ id: 'PREVIEW', label: 'Preview' },
					],
					default: 'SELECTED',
				},
				{
					type: 'textinput',
					label: 'Handlers',
					id: 'Handlers',
					default: '',
				},
				{
					type: 'dropdown',
					label: 'Take Out Method',
					id: 'TakeOutMethod',
					choices: [
						{ id: 'AUTOMATIC', label: 'Automatic' },
						{ id: 'MANUAL', label: 'Manual' },
					],
					default: 'AUTOMATIC',
				},
				{
					type: 'textinput',
					label: 'Story ID',
					id: 'storyid',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Target) params.Target = action.options.Target as string
				if (action.options.Handlers) params.Handlers = action.options.Handlers as string
				if (action.options.TakeOutMethod) params.TakeOutMethod = action.options.TakeOutMethod as string
				if (action.options.storyid) params.storyid = action.options.storyid as string
				await self.mosartAPI.controlCommand('overlay_to_manual', params)
			},
		},
		gui: {
			name: 'GUI (Control Command)',
			options: [],
			callback: async () => {
				await self.mosartAPI.controlCommand('gui', {})
			},
		},
		asrunlog_event: {
			name: 'As Run Log Event (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [{ id: 'RemotePanelFunctions', label: 'Remote Panel Functions' }],
					default: 'RemotePanelFunctions',
				},
				{
					type: 'textinput',
					label: 'Parameter',
					id: 'Parameter',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				if (action.options.Parameter) params.Parameter = action.options.Parameter as string
				await self.mosartAPI.controlCommand('asrunlog_event', params)
			},
		},
		switch_graphics_mirroring: {
			name: 'Switch Graphics Mirroring (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'TOGGLE', label: 'Toggle' },
						{ id: 'ACTIVATE', label: 'Activate' },
						{ id: 'DE-ACTIVATE', label: 'Deactivate' },
					],
					default: 'TOGGLE',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				await self.mosartAPI.controlCommand('switch_graphics_mirroring', params)
			},
		},
		enable_graphics_mirroring: {
			name: 'Enable Graphics Mirroring (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Target',
					id: 'Target',
					choices: [
						{ id: 'NONE', label: 'None' },
						{ id: 'OVERLAY', label: 'Overlay' },
					],
					default: 'NONE',
				},
				{
					type: 'checkbox',
					label: 'Action',
					id: 'Action',
					default: false,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Target) params.Target = action.options.Target as string
				if (action.options.Action) params.Action = (action.options.Action as boolean).toString()
				await self.mosartAPI.controlCommand('enable_graphics_mirroring', params)
			},
		},
		switch_genlock_mode: {
			name: 'Switch Genlock Mode (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'TOGGLE', label: 'Toggle' },
						{ id: 'ACTIVATE', label: 'Activate' },
					],
					default: 'TOGGLE',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				await self.mosartAPI.controlCommand('switch_genlock_mode', params)
			},
		},
		engine_switcher: {
			name: 'Engine Switcher (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'INIT', label: 'Init' },
						{ id: 'PRESET_STYLE', label: 'Preset Style' },
						{ id: 'GOTO_PREV_PRESET', label: 'Goto Prev Preset' },
					],
					default: 'INIT',
				},
				{
					type: 'textinput',
					label: 'Preset Name',
					id: 'PresetName',
					default: '',
				},
				{
					type: 'dropdown',
					label: 'Transition',
					id: 'Transition',
					choices: [
						{ id: 'CUT', label: 'Cut' },
						{ id: 'TAKE', label: 'Take' },
					],
					default: 'CUT',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				if (action.options.PresetName) params.PresetName = action.options.PresetName as string
				if (action.options.Transition) params.Transition = action.options.Transition as string
				await self.mosartAPI.controlCommand('engine_switcher', params)
			},
		},
		autotrans: {
			name: 'Auto Trans (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Mix Effect',
					id: 'MixEffect',
					choices: [
						{ id: 'PP', label: 'PP' },
						{ id: 'PROGRAM', label: 'Program' },
						{ id: 'ME1', label: 'ME1' },
						{ id: 'ME2', label: 'ME2' },
						{ id: 'ME3', label: 'ME3' },
					],
					default: 'PP',
				},
				{
					type: 'textinput',
					label: 'Transition Rate',
					id: 'Transitionrate',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.MixEffect) params.MixEffect = action.options.MixEffect as string
				if (action.options.Transitionrate) params.Transitionrate = action.options.Transitionrate as string
				await self.mosartAPI.controlCommand('autotrans', params)
			},
		},
		video_server_goto: {
			name: 'Video Server Goto (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Server Channel',
					id: 'ServerChannel',
					choices: [
						{ id: 'CURRENT', label: 'Current' },
						{ id: 'ONAIR', label: 'On Air' },
						{ id: 'PREVIEW', label: 'Preview' },
					],
					default: 'CURRENT',
				},
				{
					type: 'number',
					label: 'Frame',
					id: 'frame',
					default: 0,
					min: 0,
					max: 1000000,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.ServerChannel) params.ServerChannel = action.options.ServerChannel as string
				if (action.options.frame) params.frame = (action.options.frame as number).toString()
				await self.mosartAPI.controlCommand('video_server_goto', params)
			},
		},
		dve: {
			name: 'DVE (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Direction',
					id: 'Direction',
					choices: [
						{ id: 'FORWARD', label: 'Forward' },
						{ id: 'FWD', label: 'FWD' },
						{ id: 'REVERSE', label: 'Reverse' },
						{ id: 'REV', label: 'REV' },
						{ id: 'BACKWARD', label: 'Backward' },
					],
					default: 'FORWARD',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Direction) params.Direction = action.options.Direction as string
				await self.mosartAPI.controlCommand('dve', params)
			},
		},
		fullscreen_graphics: {
			name: 'Fullscreen Graphics (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Engine',
					id: 'Engine',
					default: '',
				},
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'CONTINUE', label: 'Continue' },
						{ id: 'MACRO', label: 'Macro' },
					],
					default: 'CONTINUE',
				},
				{
					type: 'textinput',
					label: 'Parameter',
					id: 'Parameter',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Engine) params.Engine = action.options.Engine as string
				if (action.options.Action) params.Action = action.options.Action as string
				if (action.options.Parameter) params.Parameter = action.options.Parameter as string
				await self.mosartAPI.controlCommand('fullscreen_graphics', params)
			},
		},
		audio: {
			name: 'Audio (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'FADE_MANUAL', label: 'Fade Manual' },
						{ id: 'FADE_OUT_KEEPS', label: 'Fade Out Keeps' },
						{ id: 'FREEZE_AUDIO', label: 'Freeze Audio' },
						{ id: 'SET_LEVEL_2_PREVIEW', label: 'Set Level 2 Preview' },
						{ id: 'SET_LEVEL_2_ONAIR', label: 'Set Level 2 On Air' },
						{ id: 'FADE_DOWN_ALL_MAINS', label: 'Fade Down All Mains' },
						{ id: 'FADE_DOWN_SECONDARY_AUDIO', label: 'Fade Down Secondary Audio' },
						{ id: 'FADE_UP_LAST_MAINS', label: 'Fade Up Last Mains' },
						{ id: 'FADE_UP_SECONDARY_AUDIO', label: 'Fade Up Secondary Audio' },
					],
					default: 'FADE_MANUAL',
				},
				{
					type: 'number',
					label: 'Fade Rate',
					id: 'Faderate',
					default: 0,
					min: 0,
					max: 1000000,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				if (action.options.Faderate) params.Faderate = (action.options.Faderate as number).toString()
				await self.mosartAPI.controlCommand('audio', params)
			},
		},
		light: {
			name: 'Light (Control Command)',
			options: [
				{
					type: 'number',
					label: 'Scene',
					id: 'Scene',
					default: 0,
					min: 0,
					max: 1000000,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Scene) params.Scene = (action.options.Scene as number).toString()
				await self.mosartAPI.controlCommand('light', params)
			},
		},
		sequence: {
			name: 'Sequence (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'START', label: 'Start' },
						{ id: 'STOP', label: 'Stop' },
						{ id: 'LOOP', label: 'Loop' },
						{ id: 'STOPLOOP', label: 'Stop Loop' },
					],
					default: 'START',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				await self.mosartAPI.controlCommand('sequence', params)
			},
		},
		take_server_to_program: {
			name: 'Take Server to Program (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Mix Effect',
					id: 'MixEffect',
					choices: [
						{ id: 'PP', label: 'PP' },
						{ id: 'PROGRAM', label: 'Program' },
						{ id: 'ME1', label: 'ME1' },
						{ id: 'ME2', label: 'ME2' },
						{ id: 'ME3', label: 'ME3' },
					],
					default: 'PP',
				},
				{
					type: 'number',
					label: 'Transition Rate',
					id: 'Transitionrate',
					default: 0,
					min: 0,
					max: 1000000,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.MixEffect) params.MixEffect = action.options.MixEffect as string
				if (action.options.Transitionrate) params.Transitionrate = (action.options.Transitionrate as number).toString()
				await self.mosartAPI.controlCommand('take_server_to_program', params)
			},
		},
		video_port: {
			name: 'Video Port (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'PLAY_PAUSE', label: 'Play Pause' },
						{ id: 'PLAY', label: 'Play' },
						{ id: 'PAUSE', label: 'Pause' },
						{ id: 'PLAY_CONTINUE', label: 'Play Continue' },
						{ id: 'STOP', label: 'Stop' },
						{ id: 'CUE', label: 'Cue' },
						{ id: 'RECUE', label: 'Recue' },
						{ id: 'SET_LOOP', label: 'Set Loop' },
						{ id: 'SET_LOOP_OFF', label: 'Set Loop Off' },
						{ id: 'PLAY_TAIL', label: 'Play Tail' },
						{ id: 'CUE_TAIL', label: 'Cue Tail' },
					],
					default: 'PLAY',
				},
				{
					type: 'textinput',
					label: 'Video Port',
					id: 'VideoPort',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Parameter',
					id: 'Parameter',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				if (action.options.VideoPort) params.VideoPort = action.options.VideoPort as string
				if (action.options.Parameter) params.Parameter = action.options.Parameter as string
				await self.mosartAPI.controlCommand('video_port', params)
			},
		},
		get_player_status: {
			name: 'Get Player Status (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Video Port',
					id: 'VideoPort',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.VideoPort) params.VideoPort = action.options.VideoPort as string
				await self.mosartAPI.controlCommand('get_player_status', params)
			},
		},
		weather: {
			name: 'Weather (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'Action',
					choices: [
						{ id: 'PLAY', label: 'Play' },
						{ id: 'CONTINUE', label: 'Continue' },
						{ id: 'GOTO_FIRST', label: 'Goto First' },
					],
					default: 'PLAY',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Action) params.Action = action.options.Action as string
				await self.mosartAPI.controlCommand('weather', params)
			},
		},
		graphicsprofile: {
			name: 'Graphics Profile (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'Name',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Name) params.Name = action.options.Name as string
				await self.mosartAPI.controlCommand('graphicsprofile', params)
			},
		},
		studiosetup: {
			name: 'Studio Setup (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'Name',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Name) params.Name = action.options.Name as string
				await self.mosartAPI.controlCommand('studiosetup', params)
			},
		},
		set_aux_crosspoint: {
			name: 'Set Aux Crosspoint (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Bus',
					id: 'Bus',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Cross Point',
					id: 'CrossPoint',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Bus) params.Bus = action.options.Bus as string
				if (action.options.CrossPoint) params.CrossPoint = action.options.CrossPoint as string
				await self.mosartAPI.controlCommand('set_aux_crosspoint', params)
			},
		},
		set_crosspoint: {
			name: 'Set Crosspoint (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Mix Effect',
					id: 'MixEffect',
					choices: [
						{ id: 'PP', label: 'PP' },
						{ id: 'PROGRAM', label: 'Program' },
						{ id: 'ME1', label: 'ME1' },
						{ id: 'ME2', label: 'ME2' },
						{ id: 'ME3', label: 'ME3' },
					],
					default: 'PP',
				},
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'Bus',
					choices: [
						{ id: 'A', label: 'A' },
						{ id: 'B', label: 'B' },
						{ id: 'C', label: 'C' },
						{ id: 'D', label: 'D' },
						{ id: 'KEY1', label: 'KEY1' },
						{ id: 'KEY2', label: 'KEY2' },
						{ id: 'KEY3', label: 'KEY3' },
						{ id: 'KEY4', label: 'KEY4' },
					],
					default: 'A',
				},
				{
					type: 'textinput',
					label: 'Cross Point',
					id: 'CrossPoint',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.MixEffect) params.MixEffect = action.options.MixEffect as string
				if (action.options.Bus) params.Bus = action.options.Bus as string
				if (action.options.CrossPoint) params.CrossPoint = action.options.CrossPoint as string
				await self.mosartAPI.controlCommand('set_crosspoint', params)
			},
		},
		transition_type: {
			name: 'Transition Type (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Transition Type',
					id: 'TransitionType',
					choices: [
						{ id: 'MIX', label: 'Mix' },
						{ id: 'WIPE', label: 'Wipe' },
						{ id: 'EFFECT', label: 'Effect' },
						{ id: 'Default', label: 'Default' },
						{ id: 'Toggle', label: 'Toggle' },
						{ id: 'Cut', label: 'Cut' },
						{ id: 'None', label: 'None' },
					],
					default: 'MIX',
				},
				{
					type: 'number',
					label: 'Value',
					id: 'Value',
					default: 0,
					min: 0,
					max: 1000000,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.TransitionType) params.TransitionType = action.options.TransitionType as string
				if (action.options.Value) params.Value = (action.options.Value as number).toString()
				await self.mosartAPI.controlCommand('transition_type', params)
			},
		},
		record: {
			name: 'Record (Control Command)',
			options: [
				{
					type: 'dropdown',
					label: 'Command',
					id: 'Command',
					choices: [
						{ id: 'PREPARE', label: 'Prepare' },
						{ id: 'START', label: 'Start' },
						{ id: 'STOP', label: 'Stop' },
						{ id: 'STOP_AND_DETACH', label: 'Stop and Detach' },
						{ id: 'DELETE', label: 'Delete' },
						{ id: 'GETSOM', label: 'Get SOM' },
					],
					default: 'PREPARE',
				},
				{
					type: 'textinput',
					label: 'Clip Name',
					id: 'ClipName',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Port Name',
					id: 'PortName',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Group',
					id: 'Group',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Recorder',
					id: 'Recorder',
					default: '',
				},
				{
					type: 'number',
					label: 'Duration',
					id: 'Duration',
					default: 0,
					min: 0,
					max: 1000000,
				},
				{
					type: 'checkbox',
					label: 'Ignore Clip Name Pattern',
					id: 'IgnoreClipNamePattern',
					default: false,
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Command) params.Command = action.options.Command as string
				if (action.options.ClipName) params.ClipName = action.options.ClipName as string
				if (action.options.PortName) params.PortName = action.options.PortName as string
				if (action.options.Group) params.Group = action.options.Group as string
				if (action.options.Recorder) params.Recorder = action.options.Recorder as string
				if (action.options.Duration) params.Duration = (action.options.Duration as number).toString()
				if (action.options.IgnoreClipNamePattern)
					params.IgnoreClipNamePattern = (action.options.IgnoreClipNamePattern as boolean).toString()
				await self.mosartAPI.controlCommand('record', params)
			},
		},
		device_properties: {
			name: 'Device Properties (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Parameter 1',
					id: 'Parameter1',
					default: 'AUDIO',
				},
				{
					type: 'textinput',
					label: 'Parameter 2',
					id: 'Parameter2',
					tooltip: 'The key of the property you want to set',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Parameter 3',
					id: 'Parameter3',
					tooltip: 'The value of the property you want to set',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Parameter1) params.Parameter1 = action.options.Parameter1 as string
				if (action.options.Parameter2) params.Parameter2 = action.options.Parameter2 as string
				if (action.options.Parameter3) params.Parameter3 = action.options.Parameter3 as string
				await self.mosartAPI.controlCommand('device_properties', params)
			},
		},
		set_videoserver_salvo: {
			name: 'Set Video Server Salvo (Control Command)',
			options: [
				{
					type: 'textinput',
					label: 'Salvo',
					id: 'Salvo',
					default: '',
				},
			],
			callback: async (action: any) => {
				const params: Record<string, string> = {}
				if (action.options.Salvo) params.Salvo = action.options.Salvo as string
				await self.mosartAPI.controlCommand('set_videoserver_salvo', params)
			},
		},
		switch_videoserver_mirroring: {
			name: 'Switch Video Server Mirroring (Control Command)',
			options: [],
			callback: async () => {
				await self.mosartAPI.controlCommand('switch_videoserver_mirroring', {})
			},
		},
		set_connection_string: {
			name: 'Set Connection String',
			options: [
				{
					type: 'textinput',
					label: 'Connection Host (host)',
					id: 'connectionHost',
					default: '',
				},
			],
			callback: async (action: any) => {
				self.config.host = action.options.connectionHost as string
				self.config.connectionString = `${self.config.host}:${self.config.port}`
				await self.configUpdated(self.config)
				self.setVariableValues({
					connectionString: self.config.connectionString,
				})
			},
		},
	}

	// Add overlay list refresh action if feature is enabled
	if (self.config.enableOverlayList) {
		actions.refresh_overlay_list = {
			name: 'Refresh Overlay List',
			options: [],
			callback: async () => {
				await self.fetchAndUpdateOverlayList()
			},
		}

		actions.next_story = {
			name: 'Select Next Story',
			options: [],
			callback: async () => {
				self.nextStory()
			},
		}

		actions.previous_story = {
			name: 'Select Previous Story',
			options: [],
			callback: async () => {
				self.previousStory()
			},
		}

		actions.select_story = {
			name: 'Select Story by ID',
			options: [
				{
					type: 'textinput',
					label: 'Story ID',
					id: 'storyId',
					default: '',
				},
			],
			callback: async (action: any) => {
				const storyId = action.options.storyId as string
				self.selectStory(storyId)
			},
		}

		actions.select_story_by_index = {
			name: 'Select Story by Index',
			options: [
				{
					type: 'number',
					label: 'Story Index (1-based)',
					id: 'index',
					default: 1,
					min: 1,
					max: 1000,
				},
			],
			callback: async (action: any) => {
				const index = (action.options.index as number) - 1
				if (index >= 0 && index < self.storyList.length) {
					self.selectStory(self.storyList[index])
				}
			},
		}

		// Actions to trigger overlays from current story
		actions.trigger_current_overlay = {
			name: 'Trigger Overlay from Current Story',
			options: [
				{
					type: 'number',
					label: 'Overlay Index',
					id: 'overlayIndex',
					default: 0,
					min: 0,
					max: 19,
				},
			],
			callback: async (action: any) => {
				const index = action.options.overlayIndex as number
				const overlays = self.overlayData[self.currentStoryId]
				if (overlays && overlays[index]) {
					const overlay = overlays[index]
					// Store the last taken overlay ID
					self.lastTakenOverlayId = overlay.id
					self.setVariableValues({
						last_taken_overlay_id: overlay.id,
					})
					// Take overlay in using the new endpoint
					await self.mosartAPI.takeOverlay({ id: overlay.id })
				}
			},
		}

		// Take overlay in by ID or name
		actions.take_overlay = {
			name: 'Take Overlay In',
			options: [
				{
					type: 'textinput',
					label: 'Overlay ID',
					id: 'id',
					default: '',
					tooltip: 'The id of the overlay graphic you want to take',
				},
				{
					type: 'textinput',
					label: 'Overlay Name (Slug)',
					id: 'name',
					default: '',
					tooltip: 'The name of the overlay graphic you want to take',
				},
			],
			callback: async (action: any) => {
				const id = action.options.id as string
				const name = action.options.name as string

				// Don't execute if both parameters are empty
				if (!id && !name) {
					self.logMsg('warn', 'Take overlay action called without ID or name - skipping')
					return
				}

				const params: { id?: string; name?: string } = {}

				if (id) params.id = id
				if (name) params.name = name

				// Only log if we have at least one parameter
				if (id || name) {
					const logParts = []
					if (id) logParts.push('id: ' + id)
					if (name) logParts.push('name: ' + name)
					self.logMsg('debug', 'Taking overlay in ' + logParts.join(', '))
				}

				// Store the last taken overlay ID
				if (id) {
					self.lastTakenOverlayId = id
					self.setVariableValues({
						last_taken_overlay_id: id,
					})
				}

				await self.mosartAPI.takeOverlay(params)
			},
		}

		// Take overlay out by ID or name
		actions.take_out_overlay = {
			name: 'Take Overlay Out',
			options: [
				{
					type: 'textinput',
					label: 'Overlay ID',
					id: 'id',
					default: '',
					tooltip: 'The id of the overlay graphic you want to take out',
				},
				{
					type: 'textinput',
					label: 'Overlay Name (Slug)',
					id: 'name',
					default: '',
					tooltip: 'The name of the overlay graphic you want to take out',
				},
			],
			callback: async (action: any) => {
				const id = action.options.id as string
				const name = action.options.name as string

				// Don't execute if both parameters are empty
				if (!id && !name) {
					self.logMsg('warn', 'Take out overlay action called without ID or name - skipping')
					return
				}

				const params: { id?: string; name?: string } = {}

				if (id) params.id = id
				if (name) params.name = name

				// Log the action
				const logParts = []
				if (id) logParts.push('id: ' + id)
				if (name) logParts.push('name: ' + name)
				self.logMsg('debug', 'Taking overlay out ' + logParts.join(', '))

				await self.mosartAPI.takeOutOverlay(params)
			},
		}

		// Take out last taken overlay
		actions.take_out_last_overlay = {
			name: 'Take Out Last Taken Overlay',
			options: [],
			callback: async () => {
				if (self.lastTakenOverlayId) {
					await self.mosartAPI.takeOutOverlay({ id: self.lastTakenOverlayId })
				} else {
					self.logMsg('warn', 'No overlay has been taken yet')
				}
			},
		}
	}

	self.setActionDefinitions(actions)
}

function parseJsonOption(self: MosartInstance, value: string): Record<string, any> | null {
	try {
		const parsed = JSON.parse(value || '{}')
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
		self.logMsg('warn', 'Expected a JSON object')
	} catch (error) {
		self.logMsg('warn', `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`)
	}
	return null
}
