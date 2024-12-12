import type { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		reload_rundown: {
			name: 'Reload rundown',
			options: [],
			callback: async () => {
				const response = await self.mosartAPI.reloadRundown()
				console.log(response)
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
			callback: async (action) => {
				const response = await self.mosartAPI.startContinue(action.options)
				console.log(response)
			},
		},
		start_from_top: {
			name: 'Restart the rundown from the first story',
			options: [],
			callback: async () => {
				const response = await self.mosartAPI.startFromTop()
				console.log(response)
			},
		},
		rehearsal_mode: {
			name: 'Toggle Rehearsal Mode',
			options: [],

			callback: async () => {
				const currentState = self.mosartAPI.getRehearsalModeStatus()
				const newState = !currentState

				await self.mosartAPI.rehearsalMode({ state: newState })
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
					choices: [
						{ id: 'Camera', label: 'Camera' },
						{ id: 'Package', label: 'Package' },
						{ id: 'VoiceOver', label: 'VoiceOver' },
						{ id: 'Live', label: 'Live' },
						{ id: 'Graphics', label: 'Graphics' },
						{ id: 'DVE', label: 'DVE' },
						{ id: 'Jingle', label: 'Jingle' },
						{ id: 'Telephone', label: 'Telephone' },
						{ id: 'AdlibPix', label: 'AdlibPix' },
						{ id: 'Break', label: 'Break' },
						{ id: 'VideoWall', label: 'VideoWall' },
						{ id: 'Sound', label: 'Sound' },
						{ id: 'Accessories', label: 'Accessories' },
					],
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
			],
			callback: async (action) => {
				const options = {
					type: action.options.type as string,
					variant: action.options.variant as string,
					bus: action.options.bus as string,
				}
				const response = await self.mosartAPI.takeTemplate(options)
				console.log(response)
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
			callback: async (action) => {
				const options = {
					number: action.options.number as number,
				}
				const response = await self.mosartAPI.directTakeTemplate(options)
				console.log(response)
			},
		},
	})
}
