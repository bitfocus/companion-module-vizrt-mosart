import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	apiKey: string
	pollInterval?: number // Time in milliseconds between polls
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
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
