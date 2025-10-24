import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	apiKey: string
	pollInterval?: number
	useWebApi: boolean
	connectionString?: string
	enableOverlayList?: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'connectionInfo',
			width: 12,
			label: 'Mosart Connection Info',
			value: `This module uses the Mosart REST API to control various aspects of Mosart. Enter the IP address or hostname of the Mosart server in the "Target IP or Hostname" field. \n If you choose to use the Web API, the default port is 55142. If you choose to use the REST API, the default port is 55167.`,
		},
		{
			type: 'checkbox',
			id: 'useWebApi',
			label: 'Use Web API',
			width: 12,
			default: true,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP or Hostname',
			width: 8,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 55142,
		},
		{
			type: 'textinput',
			id: 'apiKey',
			label: 'API Key',
			width: 8,
			regex: Regex.SOMETHING,
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
