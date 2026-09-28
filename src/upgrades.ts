import type { CompanionStaticUpgradeScript, CompanionStaticUpgradeResult } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import { DEFAULT_LOG_LEVEL } from './logging.js'

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
 * v1.5.0: Added optional polling of fader levels and on-air graphics. Both
 * default to off for existing installations, so they make no extra requests
 * until enabled.
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

	if (config.enableFaderLevels === undefined) config.enableFaderLevels = false
	if (config.enableOnAirGraphics === undefined) config.enableOnAirGraphics = false

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
