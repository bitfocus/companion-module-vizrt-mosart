import type { CompanionStaticUpgradeScript, CompanionStaticUpgradeResult } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import { DEFAULT_LOG_LEVEL } from './logging.js'
import { PRESET_GROUP_COUNT, presetGroupDefaults, presetGroupKey, type PresetGroup } from './presetGroups.js'

/**
 * v1.1.0: Added preset customization fields and overlay list feature.
 * Ensures these config fields exist with proper defaults for users
 * upgrading from v1.0.x.
 */
const upgradeV1_1_0: CompanionStaticUpgradeScript<ModuleConfig> = (
	_context,
	props,
): CompanionStaticUpgradeResult<ModuleConfig> => {
	const config: any = props.config
	const changes: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (!config) return changes

	if (config.enableOverlayList === undefined) config.enableOverlayList = false
	if (config.presetCamHardName === undefined) config.presetCamHardName = 'HARD'
	if (config.presetCamSoftName === undefined) config.presetCamSoftName = 'SOFT'
	if (config.presetExtName === undefined) config.presetExtName = 'EXT'

	changes.updatedConfig = config

	return changes
}

/**
 * v1.2.0: Added HTTPS support. Defaults existing installations to HTTP (false)
 * to preserve backwards compatibility.
 */
const upgradeV1_2_0: CompanionStaticUpgradeScript<ModuleConfig> = (
	_context,
	props,
): CompanionStaticUpgradeResult<ModuleConfig> => {
	const config: any = props.config
	const changes: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (!config) return changes

	if (config.useHttps === undefined) config.useHttps = false

	changes.updatedConfig = config

	return changes
}

/**
 * v1.3.0: Exposed pollInterval as a configurable option. Defaults existing
 * installations to 1000ms, matching the previously hard-coded value.
 */
const upgradeV1_3_0: CompanionStaticUpgradeScript<ModuleConfig> = (
	_context,
	props,
): CompanionStaticUpgradeResult<ModuleConfig> => {
	const config: any = props.config
	const changes: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (!config) return changes

	if (config.pollInterval === undefined) config.pollInterval = 1000

	changes.updatedConfig = config

	return changes
}

/**
 * v1.4.0: Added the configurable log level. Defaults existing installations to
 * 'warn', which logs only problems instead of every poll response.
 */
const upgradeV1_4_0: CompanionStaticUpgradeScript<ModuleConfig> = (
	_context,
	props,
): CompanionStaticUpgradeResult<ModuleConfig> => {
	const config: any = props.config
	const changes: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (!config) return changes

	if (config.logLevel === undefined) config.logLevel = DEFAULT_LOG_LEVEL

	changes.updatedConfig = config

	return changes
}

/**
 * v1.5.0: Added optional state polling (timeline, audio toggles, fader levels,
 * on-air graphics), all off so existing installations make no extra requests
 * until enabled. The fixed camera/external presets became configurable preset
 * groups with an English default label ("CAM"); existing instances keep their
 * previous labels, including the hardcoded "KAM". The group fields sit behind
 * a "show" checkbox, which starts ticked for instances that had changed a label.
 */
const upgradeV1_5_0: CompanionStaticUpgradeScript<ModuleConfig> = (
	_context,
	props,
): CompanionStaticUpgradeResult<ModuleConfig> => {
	const config: any = props.config
	const changes: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (!config) return changes

	if (config.enableTimelineInfo === undefined) config.enableTimelineInfo = false
	if (config.enableAudioToggles === undefined) config.enableAudioToggles = false
	if (config.enableFaderLevels === undefined) config.enableFaderLevels = false
	if (config.enableOnAirGraphics === undefined) config.enableOnAirGraphics = false

	// The fixed camera/external presets became preset group slots 1-3. Their
	// labels used to be "KAM {n}" plus the configured hard/soft/external names.
	const oldLabel = (key: string, fallback: string): string => {
		const value = typeof config[key] === 'string' ? config[key].trim() : ''
		return value !== '' ? value : fallback
	}
	const hard = oldLabel('presetCamHardName', 'HARD')
	const soft = oldLabel('presetCamSoftName', 'SOFT')
	const ext = oldLabel('presetExtName', 'EXT')
	config[presetGroupKey(1, 'label')] ??= `KAM {n}\\n${hard}`
	config[presetGroupKey(2, 'label')] ??= `KAM {n}\\n${soft}`
	config[presetGroupKey(3, 'label')] ??= `${ext} {n}`
	// Field defaults only apply to new instances, so store them for the config form to show.
	for (let slot = 1; slot <= PRESET_GROUP_COUNT; slot++) {
		for (const [field, value] of Object.entries(presetGroupDefaults(slot))) {
			config[presetGroupKey(slot, field as keyof PresetGroup)] ??= value
		}
	}
	config.showPresetGroups ??= hard !== 'HARD' || soft !== 'SOFT' || ext !== 'EXT'
	delete config.presetCamHardName
	delete config.presetCamSoftName
	delete config.presetExtName

	changes.updatedConfig = config

	return changes
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	upgradeV1_1_0,
	upgradeV1_2_0,
	upgradeV1_3_0,
	upgradeV1_4_0,
	upgradeV1_5_0,
]
