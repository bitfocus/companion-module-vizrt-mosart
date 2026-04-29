import { combineRgb } from '@companion-module/base'
import type { MosartInstance } from './main.js'

export function UpdateFeedbacks(self: MosartInstance): void {
	self.setFeedbackDefinitions({
		MosartStatus: {
			name: 'Mosart Status',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(64, 253, 143),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.mosartAPI.status
			},
		},
		RehearsalStatus: {
			name: 'Rehearsal Status',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(208, 179, 75),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.mosartAPI.getRehearsalModeStatus()
			},
		},
		TimelineStatus: {
			name: 'Timeline Status',
			type: 'boolean',
			defaultStyle: {
				text: 'F12\n(Running)',
				bgcolor: combineRgb(64, 253, 143),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.mosartAPI.getTimelineStatus()
			},
		},
		AutoTakeStatus: {
			name: 'Auto Take',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.mosartAPI.autoTake
			},
		},
		CrossoverClientStatus: {
			name: 'Crossover Client',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(100, 149, 237),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.mosartAPI.crossoverClient
			},
		},
		ServerDescription: {
			name: 'Server Description',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(180, 180, 180),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'description',
					type: 'textinput',
					label: 'Server Description',
					default: '',
				},
			],
			callback: (feedback) => {
				return self.mosartAPI.serverDescription === feedback.options['description']
			},
		},
	})
}
