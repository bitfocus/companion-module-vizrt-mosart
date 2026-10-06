import {
	combineRgb,
	type CompanionButtonPresetDefinition,
	type CompanionPresetDefinitions,
	type CompanionPresetFeedback,
	type CompanionTextPresetDefinition,
} from '@companion-module/base'
import type { MosartInstance } from './main.js'
import { AUDIO_TOGGLE_LABELS } from './api.js'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const GREY = combineRgb(50, 50, 50)
const GREEN = combineRgb(64, 253, 143)
const ORANGE = combineRgb(255, 165, 0)
const RED = combineRgb(255, 0, 0)

// Audio toggles that have a matching action in the 'audio' control command.
// The rest have no known command, so their presets are status indicators only.
const AUDIO_TOGGLE_ACTIONS: Record<string, string> = {
	fadeManual: 'FADE_MANUAL',
	useLevel2Preview: 'SET_LEVEL_2_PREVIEW',
	useLevel2OnAir: 'SET_LEVEL_2_ONAIR',
}

/**
 * Header for a category whose presets depend on an optional poll. Presets are
 * rebuilt when the config changes, so the warning disappears once enabled.
 */
function requirementHeader(category: string, option: string, enabled: boolean): CompanionTextPresetDefinition {
	return {
		type: 'text',
		category,
		name: enabled ? category : `${category} (polling is off)`,
		text: enabled
			? `Uses "${option}" from the connection config.`
			: `⚠ Requires "${option}" in the connection config. It is currently off, so these buttons will not update.`,
	}
}

/** A display-only button: shows text and changes colour with one or more feedbacks. */
function indicator(
	category: string,
	name: string,
	text: string,
	feedbacks: CompanionPresetFeedback[],
	size: number | 'auto' = 14,
): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category,
		name,
		style: { text, size, color: WHITE, bgcolor: GREY },
		steps: [],
		feedbacks,
	}
}

export function AddStatePresets(self: MosartInstance, presets: CompanionPresetDefinitions): void {
	const v = (variableId: string): string => `$(${self.label}:${variableId})`
	const config = self.config

	// Status: driven by the status poll, so always available.
	presets['status_timeline_state'] = indicator('Status', 'Timeline State', `Timeline\n${v('timeline')}`, [
		{ feedbackId: 'TimelineState', options: { state: 'Running' }, style: { bgcolor: GREEN, color: BLACK } },
		{ feedbackId: 'TimelineState', options: { state: 'Paused' }, style: { bgcolor: ORANGE, color: BLACK } },
	])
	presets['status_server_state'] = indicator('Status', 'Server State', `Server\n${v('state')}`, [
		{ feedbackId: 'ServerState', options: { state: 'Active' }, style: { bgcolor: GREEN, color: BLACK } },
		{ feedbackId: 'ServerState', options: { state: 'Idle' }, style: { bgcolor: ORANGE, color: BLACK } },
	])
	presets['status_mosart_version'] = indicator('Status', 'Mosart Version', `Mosart\n${v('mosartVersion')}`, [], 'auto')

	// Timeline stories and items
	presets['timeline_header'] = requirementHeader('Timeline', 'Poll timeline stories/items', !!config.enableTimelineInfo)
	for (const [position, label] of [
		['currentStory', 'Current Story'],
		['nextStory', 'Next Story'],
		['currentItem', 'Current Item'],
		['nextItem', 'Next Item'],
	]) {
		presets[`timeline_${position}`] = indicator(
			'Timeline',
			label,
			`${label.toUpperCase()}\n${v(`timeline_${position}_slug`)}`,
			[],
			'auto',
		)
	}
	for (const [position, label] of [
		['currentStory', 'On Air'],
		['nextStory', 'Next'],
	]) {
		presets[`timeline_match_${position}`] = indicator(
			'Timeline',
			`Story ${label} (set the slug in the feedback)`,
			`Story\n${label}`,
			[
				{
					feedbackId: 'TimelineItemMatch',
					options: { position, field: 'slug', value: '' },
					style: {
						bgcolor: position === 'currentStory' ? RED : ORANGE,
						color: position === 'currentStory' ? WHITE : BLACK,
					},
				},
			],
		)
	}

	// Audio toggles
	presets['audio_header'] = requirementHeader('Audio', 'Poll audio toggles', !!config.enableAudioToggles)
	for (const [key, label] of Object.entries(AUDIO_TOGGLE_LABELS)) {
		const action = AUDIO_TOGGLE_ACTIONS[key]
		presets[`audio_toggle_${key}`] = {
			type: 'button',
			category: 'Audio',
			name: label,
			style: { text: label, size: '14', color: WHITE, bgcolor: BLACK },
			steps: [
				{
					down: action ? [{ actionId: 'audio', options: { Action: action, Faderate: 0 } }] : [],
					up: [],
				},
			],
			feedbacks: [
				{ feedbackId: 'AudioToggleStatus', options: { toggle: key }, style: { bgcolor: ORANGE, color: BLACK } },
			],
		}
	}

	// Faders: one indicator per channel, built from the channel list the poll has seen.
	presets['fader_header'] = requirementHeader('Faders', 'Poll fader levels', !!config.enableFaderLevels)
	const faderIds = (config.enableFaderLevels && self.mosartAPI?.getFaderVariableIds()) || new Map<string, string>()
	if (config.enableFaderLevels && faderIds.size === 0) {
		presets['fader_waiting'] = {
			type: 'text',
			category: 'Faders',
			name: 'No channels yet',
			text: 'Fader channel presets appear here after the first successful fader poll.',
		}
	}
	for (const [name, variableId] of faderIds) {
		presets[`fader_${variableId}`] = indicator('Faders', `Fader ${name}`, `${name}\n${v(variableId)}`, [
			{
				feedbackId: 'FaderLevel',
				options: { fader: name, comparison: 'gt', threshold: 0 },
				style: { bgcolor: GREEN, color: BLACK },
			},
		])
	}

	// On-air graphics
	presets['onair_header'] = requirementHeader('On-Air Graphics', 'Poll on-air graphics', !!config.enableOnAirGraphics)
	presets['onair_any'] = indicator('On-Air Graphics', 'Any Graphic On Air', `GFX\n${v('onair_graphics_count')}`, [
		{ feedbackId: 'GraphicOnAir', options: { field: 'any', value: '' }, style: { bgcolor: RED, color: WHITE } },
	])
	presets['onair_slugs'] = indicator('On-Air Graphics', 'On-Air Graphic Slugs', v('onair_graphics_slugs'), [], 'auto')
	presets['onair_match'] = indicator(
		'On-Air Graphics',
		'Graphic On Air (set the slug in the feedback)',
		'GFX\nOn Air',
		[{ feedbackId: 'GraphicOnAir', options: { field: 'slug', value: '' }, style: { bgcolor: RED, color: WHITE } }],
	)
}
