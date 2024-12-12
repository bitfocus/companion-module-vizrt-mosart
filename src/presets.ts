import type { ModuleInstance } from './main.js'
import { combineRgb } from '@companion-module/base'

export function UpdatePresetDefinitions(self: ModuleInstance): void {
	self.setPresetDefinitions({
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
		}, // Closing brace for the object
	})
}
