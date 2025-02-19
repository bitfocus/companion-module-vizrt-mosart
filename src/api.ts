import { InstanceStatus } from '@companion-module/base'
import got, { OptionsOfTextResponseBody } from 'got'
import { ModuleInstance } from './main.js'

export class MosartAPI {
	instance: ModuleInstance
	host: string
	port: number
	status: boolean
	timelineStatus: boolean
	rehearsalStatus: boolean

	constructor(instance: ModuleInstance) {
		this.instance = instance
		this.host = '' // Default empty value
		this.port = 0 // Default port value
		this.status = false
		this.timelineStatus = false
		this.rehearsalStatus = false
	}

	async configure(): Promise<void> {
		if (!this.instance.config) {
			throw new Error('Config not initialized')
		}
		this.host = this.instance.config.host
		this.port = this.instance.config.port
	}

	async destroy(): Promise<void> {
		// Reset all statuses
		this.status = false
		this.timelineStatus = false
		this.rehearsalStatus = false

		// Update instance status before destroying
		this.instance.updateStatus(InstanceStatus.Disconnected, 'MosartAPI destroyed')
		console.log('MosartAPI destroyed')
	}

	getRehearsalModeStatus(): boolean {
		return this.rehearsalStatus
	}

	getTimelineStatus(): boolean {
		return this.timelineStatus
	}

	setModuleStatus(): void {
		if (!this.host) {
			console.log('IP not specified')
			this.instance.updateStatus(InstanceStatus.BadConfig, 'IP not specified')
			return
		}

		if (!this.status) {
			console.log('Could not connect to Mosart')
			this.instance.updateStatus(InstanceStatus.Disconnected, 'Could not connect to Mosart')
			return
		}

		this.instance.updateStatus(InstanceStatus.Ok)
	}

	private async sendRequest(path: string, parameters: Record<string, any> = {}): Promise<any> {
		const { port, host, apiKey } = this.instance.config

		const options: OptionsOfTextResponseBody = {
			method: 'GET',
			timeout: { request: 1000 },
			retry: { limit: 0 },
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': apiKey,
			},
			searchParams: parameters,
		}

		const version = parameters.version || 'v1'

		const url = `http://${host}:${port}/api/${version}/${path}`

		try {
			const response = await got(url, options)

			if (response.statusCode >= 400) {
				throw new Error('Network response was not ok')
			}

			return response.body
		} catch (err) {
			console.error('There was a problem with the got operation:', err)
			throw err
		}
	}

	async reloadRundown(): Promise<void> {
		await this.sendRequest('command/reload')
	}

	async startContinue(params: { option?: string; rate?: number; effect?: number; delay?: number }): Promise<void> {
		await this.sendRequest('command/start-continue', params)
	}

	async skipNext(): Promise<void> {
		await this.sendRequest('command/skip-next')
	}

	async unskipNext(): Promise<void> {
		await this.sendRequest('command/un-skip-next')
	}

	async skipNextSubitem(): Promise<void> {
		await this.sendRequest('command/skip-next-sub-item')
	}

	async unskipNextSubitem(): Promise<void> {
		await this.sendRequest('command/un-skip-next-sub-item')
	}

	async startFromTop(): Promise<void> {
		await this.sendRequest('command/start-from-top')
	}

	async setAsNext(params: { storyId: string }): Promise<void> {
		await this.sendRequest('command/set-as-next', params)
	}

	async rehearsalMode(params: { state?: boolean }): Promise<void> {
		await this.sendRequest('command/rehearsal-mode', params)
	}

	async takeTemplate(params: { type: string; variant: string; bus?: string }): Promise<void> {
		await this.sendRequest('command/template', params)
	}

	async directTakeTemplate(params: { number: number }): Promise<void> {
		await this.sendRequest('command/directtake', params)
	}

	async controlCommand(command: string, options: Record<string, any>): Promise<void> {
		await this.sendRequest(`command/controlcommand/${command}`, options)
	}

	async openRundown(params: { id: string }): Promise<void> {
		await this.sendRequest('command/open-rundown', params)
	}

	async getApiBuildInfo(): Promise<any> {
		const path = 'build'
		return await this.sendRequest(path)
	}

	async getApiStatus(): Promise<any> {
		const path = 'status'
		return await this.sendRequest(path)
	}

	async statusPoll(): Promise<void> {
		if (!this.port || !this.host) {
			this.setModuleStatus()
			return
		}

		try {
			const response = await this.getApiStatus()
			const responseJson = JSON.parse(response)
			this.status = responseJson.state === 'Active'
			this.rehearsalStatus = responseJson.rehearsalMode
			this.timelineStatus = responseJson.timeline === 'Running'
			this.instance?.checkFeedbacks('MosartStatus', 'RehearsalStatus', 'TimelineStatus')
			this.setModuleStatus()
		} catch (err) {
			console.error('Error in statusPoll:', err)
			this.status = false
			this.rehearsalStatus = false
			this.timelineStatus = false
			this.instance?.checkFeedbacks('MosartStatus', 'RehearsalStatus', 'TimelineStatus')

			this.setModuleStatus()
			return
		}
	}
}
