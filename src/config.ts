import { type SomeCompanionConfigField } from '@companion-module/base'
import { DEFAULT_LOG_LEVEL, LOG_LEVEL_CHOICES, type LogLevel } from './logging.js'

export const DEFAULT_POLL_INTERVAL_MS = 1000

export interface ModuleConfig {
	host: string
	port: number
	apiKey?: string
	pollInterval?: number
	logLevel?: LogLevel
	useWebApi: boolean
	useHttps?: boolean
	connectionString?: string
	enableOverlayList?: boolean
	presetCamHardName?: string
	presetCamSoftName?: string
	presetExtName?: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'connectionInfo',
			width: 12,
			label: 'Mosart Connection Info',
			value:
				'This module uses the Mosart API to control various aspects of Mosart. Enter the IP address or hostname of the Mosart server in the "Target IP or Hostname" field.\n\n' +
				'Default ports:\n' +
				'  • Web API (HTTP): 55142\n' +
				'  • REST API (HTTP): 55167\n' +
				'  • REST API (HTTPS): 55168\n\n' +
				'Note: The Web API does not support HTTPS. If you enable HTTPS, make sure you also switch to the REST API port (55168).',
		},
		{
			type: 'checkbox',
			id: 'useWebApi',
			label: 'Use Web API (uncheck to use REST API)',
			width: 12,
			default: true,
		},
		{
			type: 'checkbox',
			id: 'useHttps',
			label: 'Use HTTPS (REST API only - default port 55168)',
			width: 12,
			default: false,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP or Hostname',
			width: 8,
			required: true,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 55142,
			tooltip: 'Web API: 55142 (HTTP). REST API: 55167 (HTTP) or 55168 (HTTPS).',
		},
		{
			type: 'textinput',
			id: 'apiKey',
			label: 'API Key',
			width: 8,
			tooltip:
				'Leave blank if the Mosart API does not require authentication. When set, the value is sent as the X-Api-Key header on every request.',
		},
		{
			type: 'number',
			id: 'pollInterval',
			label: 'Poll Interval (ms)',
			width: 4,
			min: 100,
			max: 60000,
			default: DEFAULT_POLL_INTERVAL_MS,
			tooltip:
				'How often (in milliseconds) the module polls the Mosart API for status updates while connected. After a failed poll the interval doubles (up to 30s) until the server responds again.',
		},
		{
			type: 'dropdown',
			id: 'logLevel',
			label: 'Log Level',
			width: 4,
			default: DEFAULT_LOG_LEVEL,
			choices: LOG_LEVEL_CHOICES,
			tooltip:
				'How much detail the module writes to the Companion log. Warning (default) logs only problems. Debug logs every API request and poll response and is very verbose.',
		},
		{
			type: 'static-text',
			id: 'presetCustomizationInfo',
			width: 12,
			label: 'Preset Customizations',
			value:
				'Customize the text displayed on preset buttons for cameras and external sources. Leave blank to use defaults.',
		},
		{
			type: 'textinput',
			id: 'presetCamHardName',
			label: 'Camera Hard Preset Name',
			width: 4,
			default: 'HARD',
			tooltip: 'Text to display for hard camera presets (e.g., "HARD", "H", "DIR")',
		},
		{
			type: 'textinput',
			id: 'presetCamSoftName',
			label: 'Camera Soft Preset Name',
			width: 4,
			default: 'SOFT',
			tooltip: 'Text to display for soft camera presets (e.g., "SOFT", "S", "MIX")',
		},
		{
			type: 'textinput',
			id: 'presetExtName',
			label: 'External Preset Name',
			width: 4,
			default: 'EXT',
			tooltip: 'Text to display for external source presets (e.g., "EXT", "LIVE", "FEED")',
		},
		{
			type: 'static-text',
			id: 'overlayListInfo',
			width: 12,
			label: 'Overlay List (Experimental)',
			value:
				'Enable this to fetch and track overlay graphics from the Mosart API. This will create variables for each story containing overlay information.',
		},
		{
			type: 'checkbox',
			id: 'enableOverlayList',
			label: 'Enable Overlay List (Experimental) - minimum Mosart version 5.13.0',
			width: 12,
			default: false,
		},
	]
}
