import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	apiKey: string
	pollInterval?: number
	useWebApi: boolean
	connectionString?: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'connectionInfo',
			width: 12,
			label: 'Mosart Connection Info',
			value: `This module uses the Mosart REST API to control various aspects of Mosart. Enter the IP address or hostname of the Mosart server in the "Target IP or Hostname" field.`,
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
			default: 8000,
		},
		{
			type: 'textinput',
			id: 'apiKey',
			label: 'API Key',
			width: 8,
			regex: Regex.SOMETHING,
		},
	]
}
