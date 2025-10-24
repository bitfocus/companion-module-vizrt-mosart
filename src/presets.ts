import type { MosartInstance } from './main.js'
import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'

export function UpdatePresetDefinitions(self: MosartInstance): void {
	const presets: CompanionPresetDefinitions = {
		start_continue: {
			type: 'button',
			category: 'Rundown',
			name: `Start/Continue the rundown`,
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
								option: 'Default',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		toggle_rehearsal_mode: {
			type: 'button',
			category: 'Rundown',
			name: 'Toggle Rehearsal Mode',
			style: {
				text: 'Rehearsal',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'rehearsal_mode',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'RehearsalStatus',
					options: {},
					style: {
						bgcolor: combineRgb(208, 179, 75),
						color: combineRgb(0, 0, 0),
					},
				},
			],
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
		text: 'External Source Presets',
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

	presets['status'] = {
		category: `Status`,
		name: 'Status',
		type: 'text',
		text: 'Status',
	}

	presets['status_connected'] = {
		type: 'button',
		category: 'Status',
		name: 'Connected',
		style: {
			text: 'Mosart Status',
			size: 18,
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'MosartStatus',
				options: {},
				style: {
					bgcolor: 4259215,
					color: 0,
				},
				isInverted: false,
			},
		],
	}

	presets['story_header'] = {
		category: 'Story Navigation',
		name: 'Story Navigation',
		type: 'text',
		text: 'Story Navigation',
	}

	presets['current_story'] = {
		type: 'button',
		category: 'Story Navigation',
		name: 'Current Story',
		style: {
			text: `$(mosart:current_story_id)`,
			alignment: 'center:center',
			size: 10,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['previous_story'] = {
		type: 'button',
		category: 'Story Navigation',
		name: 'Previous Story',
		style: {
			text: `Previous\nStory`,
			alignment: 'center:center',
			size: 10,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 100, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'previous_story',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['next_story'] = {
		type: 'button',
		category: 'Story Navigation',
		name: 'Next Story',
		style: {
			text: `Next\nStory`,
			alignment: 'center:center',
			size: 10,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 100, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'next_story',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// Add overlays header - only if feature enabled
	if (self.config.enableOverlayList) {
		presets['overlays_header'] = {
			category: 'Overlays',
			name: 'Overlays',
			type: 'text',
			text: 'Current Story Overlays',
		}

		// Create presets for up to 20 overlays in the current story
		for (let i = 0; i < 20; i++) {
			presets[`overlay_${i}`] = {
				type: 'button',
				category: 'Overlays',
				name: `Overlay ${i}`,
				style: {
					text: `$(mosart:current_overlay_${i}_overlayName)`,
					alignment: 'center:center',
					size: 8,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(30, 41, 59),
				},
				steps: [
					{
						down: [
							{
								actionId: 'take_overlay',
								options: {
									id: `$(mosart:current_overlay_${i}_id) - add id from variable for overlay ${i}`,
									name: '',
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [],
			}
		}

		// Add Take Out Last button
		presets['take_out_last'] = {
			type: 'button',
			category: 'Overlays',
			name: 'Take Out Last',
			style: {
				text: 'Take Out\\nLast',
				alignment: 'center:center',
				size: 14,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(200, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'take_out_last_overlay',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	// Add refresh overlay list button if feature enabled
	if (self.config.enableOverlayList) {
		presets['refresh_overlay_list'] = {
			type: 'button',
			category: 'Story Navigation',
			name: 'Refresh Overlay List',
			style: {
				text: '🔄\nRefresh',
				alignment: 'center:center',
				size: 14,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(50, 50, 50),
			},
			steps: [
				{
					down: [
						{
							actionId: 'refresh_overlay_list',
							options: {},
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
