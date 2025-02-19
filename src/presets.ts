import type { ModuleInstance } from './main.js'
import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'

export function UpdatePresetDefinitions(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {
		my_preset: {
			type: 'button', // This must be 'button' for now
			category: 'Rundown', // This groups presets into categories in the ui. Try to create logical groups to help users find presets
			name: `Start/Continue the rundown`, // A name for the preset. Shown to the user when they hover over it
			style: {
				text: `F12`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'start_continue',
							options: {
								// options values to use
								option: 'Default',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [], // You can add some presets from your module here
		},
	}

	presets['header1'] = {
		category: `Camera`,
		name: 'Hard Cameras',
		type: 'text',
		text: 'Hard Camera Presets',
	}

	for (let i = 1; i <= 10; i++) {
		presets[`cam_hard_${i}`] = {
			type: 'button',
			category: 'Camera',
			name: `Camera ${i}`,
			style: {
				text: `KAM ${i}\nHARD`,
				alignment: 'center:top',
				size: 16,
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(128, 255, 128),
				pngalignment: 'center:bottom',
				png64:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAhCAYAAABX5MJvAAAACXBIWXMAAAsSAAALEgHS3X78AAABHElEQVRYhe2W203DQBBFz0X8kxJSgkswHbiEUAmUkA5ICSkhdGA6SAmmgstH1oIYrx9rOY6QrzQ/u7Ozx5rxzMo2S+thaQBYIX60QtS6bwhJhaSzJPdYKamYRGG71YAj4BG2i8Xqsy6IYiSEgW0KRDQdto+21WXAS+NYUloeUw79Aj1IAtiGpTIljmKzQ1KeEK+yPR4kUg9nxtdDbYfJhQnkEwB8+a4/MTfAHjgBWXN/Uk0MkaQsXP4UljZNn1k7pqRdA6BVs0FIegPe+wBmhQBehzre9wC7peaEeAa+FoWwfeLScz4XgwggZQD56PJra1bVxLuvUmC7AvLw8Mm4jIRrRWbHnrSWXZHwuIlO0Vvq3/+ig7VC1Fohan0DxiuWLlerpn4AAAAASUVORK5CYII=',
			},
			steps: [
				{
					down: [
						{
							actionId: 'template',
							options: {
								// options values to use
								type: 'Camera',
								variant: `${i}HARD`,
								bus: 'Program',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	presets['header2'] = {
		category: `Camera`,
		name: 'Soft Cameras',
		type: 'text',
		text: 'Soft Camera Presets',
	}

	for (let i = 1; i <= 10; i++) {
		presets[`cam_soft_${i}`] = {
			type: 'button',
			category: 'Camera',
			name: `Camera ${i}`,
			style: {
				text: `KAM ${i}\nSOFT`,
				alignment: 'center:top',
				size: 16,
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(128, 255, 128),
				pngalignment: 'center:bottom',
				png64:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAhCAYAAABX5MJvAAAACXBIWXMAAAsSAAALEgHS3X78AAABHElEQVRYhe2W203DQBBFz0X8kxJSgkswHbiEUAmUkA5ICSkhdGA6SAmmgstH1oIYrx9rOY6QrzQ/u7Ozx5rxzMo2S+thaQBYIX60QtS6bwhJhaSzJPdYKamYRGG71YAj4BG2i8Xqsy6IYiSEgW0KRDQdto+21WXAS+NYUloeUw79Aj1IAtiGpTIljmKzQ1KeEK+yPR4kUg9nxtdDbYfJhQnkEwB8+a4/MTfAHjgBWXN/Uk0MkaQsXP4UljZNn1k7pqRdA6BVs0FIegPe+wBmhQBehzre9wC7peaEeAa+FoWwfeLScz4XgwggZQD56PJra1bVxLuvUmC7AvLw8Mm4jIRrRWbHnrSWXZHwuIlO0Vvq3/+ig7VC1Fohan0DxiuWLlerpn4AAAAASUVORK5CYII=',
			},
			steps: [
				{
					down: [
						{
							actionId: 'template',
							options: {
								// options values to use
								type: 'Camera',
								variant: `${i}SOFT`,
								bus: 'Program',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	presets['external'] = {
		category: `External`,
		name: 'External',
		type: 'text',
		text: 'External Camera Presets',
	}

	for (let i = 1; i <= 10; i++) {
		presets[`ext_${i}`] = {
			type: 'button',
			category: 'External',
			name: `External ${i}`,
			style: {
				text: `EXT ${i}`,
				alignment: 'center:center',
				size: 16,
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(155, 0, 0),
				pngalignment: 'center:bottom',
				png64:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA8ElEQVRYhe2W0Q2DMAxEz52EvbIBzJUF6EIdBHT9IQJRE7BJFZCI5B9IfI/4QiwkUXO8qqo/ALcHEJEgIuEUAUlXAGgBcIrWnaeA+CmIUuJuCLH+iEQku4CkWPJ5TPgGMCrPx+mdbTg90AMYMG/9AKBfzWmKeABzzdcCCUIT73HQExbDaUIRQNzZnSyE1e0/EDviuxBbiYKSZAkRlTVxQzxF0LSq3wXXLMElTHiJY2jY6v/9iAx1zvqjCACARhFex6EvT2E6hiQ/ALrMlG6aY0rqKUO9hmQDwt2SmRuS5UgNKcnoznEGoMSofhc8ANUBvhM/1Z0Gbf5iAAAAAElFTkSuQmCC',
			},
			steps: [
				{
					down: [
						{
							actionId: 'template',
							options: {
								// options values to use
								type: 'Live',
								variant: `${i}`,
								bus: 'Preview',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	self.setPresetDefinitions(presets)
}
