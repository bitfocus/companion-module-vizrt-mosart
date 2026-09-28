import { combineRgb } from '@companion-module/base'
import type { MosartInstance } from './main.js'
import { AUDIO_TOGGLE_LABELS, graphicsIdOf, TIMELINE_POSITION_LABELS, type TimelinePosition } from './api.js'

const matches = (actual: string | null | undefined, expected: unknown): boolean => {
	const wanted = typeof expected === 'string' ? expected.trim().toLowerCase() : ''
	return wanted !== '' && (actual ?? '').trim().toLowerCase() === wanted
}

export function UpdateFeedbacks(self: MosartInstance): void {
	const faderChoices = self.mosartAPI.getKnownFaderChannels().map((name) => ({ id: name, label: name }))

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
		TimelineState: {
			name: 'Timeline State',
			description: 'Running, Paused or Stopped',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'Running', label: 'Running' },
						{ id: 'Paused', label: 'Paused' },
						{ id: 'Stopped', label: 'Stopped' },
					],
					default: 'Paused',
				},
			],
			callback: (feedback) => {
				return self.mosartAPI.timeline === feedback.options['state']
			},
		},
		ServerState: {
			name: 'Server State',
			description: 'Whether the Mosart server is Active or Idle',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(64, 253, 143),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'Active', label: 'Active' },
						{ id: 'Idle', label: 'Idle' },
						{ id: 'Unknown', label: 'Unknown' },
					],
					default: 'Active',
				},
			],
			callback: (feedback) => {
				return self.mosartAPI.state === feedback.options['state']
			},
		},
		TimelineItemMatch: {
			name: 'Timeline Story/Item Match',
			description: 'True when the current or next story/item has the given slug or id (case-insensitive)',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'position',
					type: 'dropdown',
					label: 'Position',
					choices: Object.entries(TIMELINE_POSITION_LABELS).map(([id, label]) => ({ id, label })),
					default: 'currentStory',
				},
				{
					id: 'field',
					type: 'dropdown',
					label: 'Match on',
					choices: [
						{ id: 'slug', label: 'Slug' },
						{ id: 'id', label: 'ID' },
					],
					default: 'slug',
				},
				{
					id: 'value',
					type: 'textinput',
					label: 'Value',
					default: '',
				},
			],
			callback: (feedback) => {
				const item = self.mosartAPI.timelineInfo?.[feedback.options['position'] as TimelinePosition]
				const actual = feedback.options['field'] === 'id' ? item?.id : item?.slug
				return matches(actual, feedback.options['value'])
			},
		},
		FaderLevel: {
			name: 'Fader Level',
			description: 'Compares a fader level (0-1) to a threshold. Requires "Poll fader levels" in the module config.',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(64, 253, 143),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'fader',
					type: 'dropdown',
					label: 'Fader',
					choices: faderChoices,
					default: faderChoices[0]?.id ?? '',
					allowCustom: true,
					tooltip: 'Channels are listed once fader polling has fetched them; you can also type a name',
				},
				{
					id: 'comparison',
					type: 'dropdown',
					label: 'Comparison',
					choices: [
						{ id: 'gt', label: '>' },
						{ id: 'gte', label: '>=' },
						{ id: 'lt', label: '<' },
						{ id: 'lte', label: '<=' },
						{ id: 'eq', label: '=' },
					],
					default: 'gt',
				},
				{
					id: 'threshold',
					type: 'number',
					label: 'Level (0-1)',
					default: 0,
					min: 0,
					max: 1,
					step: 0.01,
				},
			],
			callback: (feedback) => {
				const level = self.mosartAPI.faderLevels[feedback.options['fader'] as string]
				if (level === undefined) return false
				const threshold = Number(feedback.options['threshold'] ?? 0)
				switch (feedback.options['comparison']) {
					case 'gte':
						return level >= threshold
					case 'lt':
						return level < threshold
					case 'lte':
						return level <= threshold
					case 'eq':
						return Math.abs(level - threshold) < 0.005
					default:
						return level > threshold
				}
			},
		},
		GraphicOnAir: {
			name: 'Graphic On Air',
			description:
				'True when an on-air overlay graphic matches (case-insensitive). Requires "Poll on-air graphics" in the module config.',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'field',
					type: 'dropdown',
					label: 'Match on',
					choices: [
						{ id: 'slug', label: 'Slug' },
						{ id: 'id', label: 'Mosart item ID' },
						{ id: 'graphicsId', label: 'Graphics ID' },
						{ id: 'any', label: 'Any graphic on air' },
					],
					default: 'slug',
				},
				{
					id: 'value',
					type: 'textinput',
					label: 'Value',
					default: '',
					isVisible: (options) => options['field'] !== 'any',
				},
			],
			callback: (feedback) => {
				const graphics = self.mosartAPI.onAirGraphics
				switch (feedback.options['field']) {
					case 'any':
						return graphics.length > 0
					case 'id':
						return graphics.some((graphic) => matches(graphic.id, feedback.options['value']))
					case 'graphicsId':
						return graphics.some((graphic) => matches(graphicsIdOf(graphic), feedback.options['value']))
					default:
						return graphics.some((graphic) => matches(graphic.slug, feedback.options['value']))
				}
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
		AudioToggleStatus: {
			name: 'Audio Toggle State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'toggle',
					type: 'dropdown',
					label: 'Audio Toggle',
					choices: Object.entries(AUDIO_TOGGLE_LABELS).map(([id, label]) => ({ id, label })),
					default: 'holdAudioTransition',
				},
			],
			callback: (feedback) => {
				return self.mosartAPI.getAudioToggleStatus(feedback.options['toggle'] as string)
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
