import type { CompanionStaticUpgradeScript, CompanionStaticUpgradeResult } from '@companion-module/base'
import type { ModuleConfig } from './config.js'

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

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [upgradeV1_1_0]
