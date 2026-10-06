import { combineRgb, type CompanionPresetDefinitions, type SomeCompanionConfigField } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import type { MosartInstance } from './main.js'

export const TEMPLATE_TYPES = [
	'Camera',
	'Package',
	'VoiceOver',
	'Live',
	'Graphics',
	'DVE',
	'Jingle',
	'Telephone',
	'AdlibPix',
	'Break',
	'VideoWall',
	'Sound',
	'Accessories',
] as const

export const PRESET_GROUP_COUNT = 6
const MAX_PRESETS_PER_GROUP = 20

const ICONS = {
	camera:
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAA9UlEQVR42u3YYQ2CQBiA4YtgBCMQgQhGMIIRiGAEIxjBCEYwAg1O2O6HslMRpk7uebbvF+w23+GhFwIAAAAAAAAAAAAAULIY489HIIEEEkgggQT6aqAQwiaEcOlveTHn/t4SAx1HxLmdbYlPUHxz1vag+w+2HQTaCZSP1KSpS/qK1ROmKiLQyLfXozksOlB6EuKcyay56mbfrX3KPWVFB+qDdJt3e3O9Fuh+A28H1wVK6zQPrguU1okCCSTQJwPVmQ1aoMFbrErHIQI9+R20Sj8QFxOomhmofXJ80uSORP7xv9h+apwpB2fOpAUSSCCBBBJIoJGutiPbH8SPs5kAAAAASUVORK5CYII=',
	external:
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAA2UlEQVR42u3Z0QnCMBRA0TeKe3WD7OUCnS8QCfRDapMWRaXpOZAfpR9e4muNEQAAAAAAAAAAAAAAdJVS/roEEkgggQT6UqCImOoSaPuDpXr5spJA7TgfRRouUCPO25FGDFR6S6CIOSLyRpz62mwGbUd6iRMRt0sEepo5cyNSbrx3aCadOtBqIG+FuNe1s7vSkIEad6vunOnMpzRUoOUJuXWnyutd87Sbcue6SaCrBPIVM6Td5j0o+qlxwkB1V+z9WD26cxx3ODBzYObI1aG9v30EEkgggX4a6AEJRU07PhWGwAAAAABJRU5ErkJggg==',
} as const

type PresetIcon = 'none' | keyof typeof ICONS
type Bus = 'Program' | 'Preview'

export interface PresetGroup {
	enabled: boolean
	name: string
	category: string
	type: string
	/** `{n}` is replaced by the preset number; without it the number is appended. */
	variant: string
	/** `{n}` is replaced by the preset number; a typed `\n` becomes a line break. */
	label: string
	bus: Bus
	insert: boolean
	count: number
	icon: PresetIcon
	bgcolor: number
}

const GREY = combineRgb(50, 50, 50)

/** Slots 1-3 reproduce the original hard camera, soft camera and external presets. */
export function presetGroupDefaults(slot: number): PresetGroup {
	switch (slot) {
		case 1:
			return {
				enabled: true,
				name: 'Hard Cameras',
				category: 'Camera',
				type: 'Camera',
				variant: '{n}HARD',
				label: 'CAM {n}\\nHARD',
				bus: 'Program',
				insert: false,
				count: 10,
				icon: 'camera',
				bgcolor: combineRgb(128, 255, 128),
			}
		case 2:
			return {
				enabled: true,
				name: 'Soft Cameras',
				category: 'Camera',
				type: 'Camera',
				variant: '{n}SOFT',
				label: 'CAM {n}\\nSOFT',
				bus: 'Program',
				insert: false,
				count: 10,
				icon: 'camera',
				bgcolor: combineRgb(128, 255, 128),
			}
		case 3:
			return {
				enabled: true,
				name: 'External Sources',
				category: 'External',
				type: 'Live',
				variant: '{n}',
				label: 'EXT {n}',
				bus: 'Preview',
				insert: false,
				count: 10,
				icon: 'external',
				bgcolor: combineRgb(155, 0, 0),
			}
		default:
			return {
				enabled: false,
				name: `Preset Group ${slot}`,
				category: `Preset Group ${slot}`,
				type: 'Camera',
				variant: '{n}',
				label: '{n}',
				bus: 'Program',
				insert: false,
				count: 10,
				icon: 'none',
				bgcolor: GREY,
			}
	}
}

export const presetGroupKey = (slot: number, field: keyof PresetGroup): `presetGroup${number}_${string}` =>
	`presetGroup${slot}_${field}`

/** Reads a slot from the config. Unset or blank fields fall back to the slot's defaults. */
export function readPresetGroup(config: ModuleConfig, slot: number): PresetGroup {
	const defaults = presetGroupDefaults(slot)
	const raw = (field: keyof PresetGroup): unknown => config[presetGroupKey(slot, field)]
	const text = (field: 'name' | 'category' | 'variant' | 'label'): string => {
		const value = raw(field)
		return typeof value === 'string' && value.trim() !== '' ? value.trim() : defaults[field]
	}
	const pick = <K extends keyof PresetGroup>(field: K, valid: (value: unknown) => boolean): PresetGroup[K] => {
		const value = raw(field)
		return valid(value) ? (value as PresetGroup[K]) : defaults[field]
	}
	const count = Number(raw('count'))
	return {
		enabled: pick('enabled', (v) => typeof v === 'boolean'),
		name: text('name'),
		category: text('category'),
		type: pick('type', (v) => (TEMPLATE_TYPES as readonly unknown[]).includes(v)),
		variant: text('variant'),
		label: text('label'),
		bus: pick('bus', (v) => v === 'Program' || v === 'Preview'),
		insert: pick('insert', (v) => typeof v === 'boolean'),
		count: Number.isFinite(count) && count >= 1 ? Math.min(Math.floor(count), MAX_PRESETS_PER_GROUP) : defaults.count,
		icon: pick('icon', (v) => v === 'none' || (typeof v === 'string' && v in ICONS)),
		bgcolor: pick('bgcolor', (v) => typeof v === 'number'),
	}
}

export function fillPattern(pattern: string, n: number, appendIfMissing: boolean): string {
	if (pattern.includes('{n}')) return pattern.split('{n}').join(String(n))
	return appendIfMissing ? `${pattern}${n}` : pattern
}

/** Black or white text, whichever reads better on the background. */
function textColorFor(bgcolor: number): number {
	const r = (bgcolor >> 16) & 0xff
	const g = (bgcolor >> 8) & 0xff
	const b = bgcolor & 0xff
	return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? combineRgb(0, 0, 0) : combineRgb(255, 255, 255)
}

export function GetPresetGroupConfigFields(): SomeCompanionConfigField[] {
	const fields: SomeCompanionConfigField[] = [
		{
			type: 'checkbox',
			id: 'showPresetGroups',
			label: 'Show preset groups (build template presets from a type, variant and bus)',
			width: 12,
			default: false,
		},
		{
			type: 'static-text',
			id: 'presetGroupsInfo',
			width: 12,
			label: 'Preset Groups',
			value:
				'Each enabled group adds a numbered set of "Take template" presets. In the variant and label, {n} is replaced by the number; type \\n in the label for a line break. Blank fields use the defaults. Changes apply to presets placed afterwards, not to buttons already on your pages.',
			isVisibleExpression: '$(options:showPresetGroups)',
		},
	]

	for (let slot = 1; slot <= PRESET_GROUP_COUNT; slot++) {
		const d = presetGroupDefaults(slot)
		const key = (field: keyof PresetGroup): string => presetGroupKey(slot, field)
		const visible = `$(options:showPresetGroups) && $(options:${key('enabled')})`
		fields.push(
			{
				type: 'checkbox',
				id: key('enabled'),
				label: `Group ${slot}${slot <= 3 ? ` (default: ${d.name})` : ''}`,
				width: 12,
				default: d.enabled,
				isVisibleExpression: '$(options:showPresetGroups)',
			},
			{
				type: 'textinput',
				id: key('name'),
				label: 'Name',
				width: 4,
				default: d.name,
				tooltip: 'Shown as the header above the group and in the preset names',
				isVisibleExpression: visible,
			},
			{
				type: 'textinput',
				id: key('category'),
				label: 'Category',
				width: 4,
				default: d.category,
				tooltip: 'Preset category to put the group in; groups can share a category',
				isVisibleExpression: visible,
			},
			{
				type: 'number',
				id: key('count'),
				label: 'Number of presets',
				width: 4,
				default: d.count,
				min: 1,
				max: MAX_PRESETS_PER_GROUP,
				isVisibleExpression: visible,
			},
			{
				type: 'dropdown',
				id: key('type'),
				label: 'Template type',
				width: 4,
				default: d.type,
				choices: TEMPLATE_TYPES.map((type) => ({ id: type, label: type })),
				isVisibleExpression: visible,
			},
			{
				type: 'textinput',
				id: key('variant'),
				label: 'Variant',
				width: 4,
				default: d.variant,
				tooltip: 'Template variant, e.g. {n}HARD gives 1HARD, 2HARD... Without {n} the number is added at the end',
				isVisibleExpression: visible,
			},
			{
				type: 'dropdown',
				id: key('bus'),
				label: 'Bus',
				width: 2,
				default: d.bus,
				choices: [
					{ id: 'Program', label: 'Program' },
					{ id: 'Preview', label: 'Preview' },
				],
				isVisibleExpression: visible,
			},
			{
				type: 'checkbox',
				id: key('insert'),
				label: 'Insert',
				width: 2,
				default: d.insert,
				tooltip: 'Insert the template into preview instead of replacing it',
				isVisibleExpression: `${visible} && $(options:${key('bus')}) == 'Preview'`,
			},
			{
				type: 'textinput',
				id: key('label'),
				label: 'Button label',
				width: 6,
				default: d.label,
				tooltip: 'Text on each button, e.g. CAM {n}\\nHARD. Type \\n for a line break',
				isVisibleExpression: visible,
			},
			{
				type: 'dropdown',
				id: key('icon'),
				label: 'Icon',
				width: 3,
				default: d.icon,
				choices: [
					{ id: 'none', label: 'None' },
					{ id: 'camera', label: 'Camera' },
					{ id: 'external', label: 'External' },
				],
				isVisibleExpression: visible,
			},
			{
				type: 'colorpicker',
				id: key('bgcolor'),
				label: 'Background',
				width: 3,
				default: d.bgcolor,
				isVisibleExpression: visible,
			},
		)
	}

	return fields
}

export function AddPresetGroupPresets(self: MosartInstance, presets: CompanionPresetDefinitions): void {
	for (let slot = 1; slot <= PRESET_GROUP_COUNT; slot++) {
		const group = readPresetGroup(self.config, slot)
		if (!group.enabled) continue

		presets[`group${slot}_header`] = {
			type: 'text',
			category: group.category,
			name: group.name,
			text: `${group.name}: ${group.type} templates on ${group.bus}`,
		}

		const icon = group.icon === 'none' ? undefined : ICONS[group.icon]
		for (let n = 1; n <= group.count; n++) {
			presets[`group${slot}_${n}`] = {
				type: 'button',
				category: group.category,
				name: `${group.name} ${n}`,
				style: {
					text: fillPattern(group.label, n, false).split('\\n').join('\n'),
					alignment: group.icon === 'camera' ? 'center:top' : 'center:center',
					size: 16,
					color: textColorFor(group.bgcolor),
					bgcolor: group.bgcolor,
					...(icon ? { pngalignment: 'center:bottom' as const, png64: icon } : {}),
				},
				steps: [
					{
						down: [
							{
								actionId: 'template',
								options: {
									type: group.type,
									variant: fillPattern(group.variant, n, true),
									bus: group.bus,
									insert: group.bus === 'Preview' && group.insert,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [],
			}
		}
	}
}
