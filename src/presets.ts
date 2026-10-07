import type { MosartInstance } from './main.js'
import { combineRgb, CompanionPresetDefinitions } from '@companion-module/base'
import { AddPresetGroupPresets } from './presetGroups.js'
import { AddStatePresets, requirementHeader } from './statePresets.js'

const OVERLAY_LIST_OPTION = 'Enable Overlay List'

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

	presets['server_active'] = {
		type: 'button',
		category: 'Rundown',
		name: 'Set Server Active',
		style: {
			text: 'Server\nIdle',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: 'server_active', options: {} }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'ServerState',
				options: { state: 'Active' },
				style: {
					text: 'Server\nActive',
					bgcolor: combineRgb(64, 253, 143),
					color: combineRgb(0, 0, 0),
				},
			},
		],
	}

	AddPresetGroupPresets(self, presets)

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

	presets['status_autotake'] = {
		type: 'button',
		category: 'Status',
		name: 'Auto Take',
		style: {
			text: 'Auto Take',
			size: 14,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(50, 50, 50),
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'AutoTakeStatus',
				options: {},
				style: {
					bgcolor: combineRgb(255, 165, 0),
					color: combineRgb(0, 0, 0),
				},
			},
		],
	}

	presets['status_crossover'] = {
		type: 'button',
		category: 'Status',
		name: 'Crossover Client',
		style: {
			text: 'Crossover\nClient',
			size: 14,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(50, 50, 50),
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'CrossoverClientStatus',
				options: {},
				style: {
					bgcolor: combineRgb(100, 149, 237),
					color: combineRgb(0, 0, 0),
				},
			},
		],
	}

	presets['status_server_description'] = {
		type: 'button',
		category: 'Status',
		name: 'Server Description',
		style: {
			text: `$(${self.label}:serverDescription)`,
			size: 14,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(50, 50, 50),
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'ServerDescription',
				options: {
					description: '',
				},
				style: {
					bgcolor: combineRgb(180, 180, 180),
					color: combineRgb(0, 0, 0),
				},
			},
		],
	}

	const overlayList = !!self.config.enableOverlayList
	presets['story_header'] = requirementHeader('Story Navigation', OVERLAY_LIST_OPTION, overlayList)

	presets['current_story'] = {
		type: 'button',
		category: 'Story Navigation',
		name: 'Current Story',
		style: {
			text: `$(${self.label}:current_story_id)`,
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

	presets['overlays_header'] = requirementHeader('Overlays', OVERLAY_LIST_OPTION, overlayList)
	// Create presets for up to 20 overlays in the current story
	for (let i = 0; i < 20; i++) {
		presets[`overlay_${i}`] = {
			type: 'button',
			category: 'Overlays',
			name: `Overlay ${i}`,
			style: {
				text: `$(${self.label}:current_overlay_${i}_overlayType)\n$(${self.label}:current_overlay_${i}_overlayName)`,
				alignment: 'center:center',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [{ actionId: 'trigger_current_overlay', options: { overlayIndex: i } }],
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

	presets['refresh_overlay_list'] = {
		type: 'button',
		category: 'Story Navigation',
		name: 'Refresh Overlay List',
		style: {
			text: 'Refresh\nList',
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

	AddStatePresets(self, presets)

	self.setPresetDefinitions(presets)
}
