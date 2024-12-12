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
	onair_poll_interval: NodeJS.Timeout | undefined

	constructor(instance: ModuleInstance) {
		this.instance = instance
		this.host = instance.config.host
		this.port = instance.config.port
		this.status = false
		this.timelineStatus = false
		this.rehearsalStatus = false
		this.onair_poll_interval = undefined
	}

	configure(): void {
		this.host = this.instance.config.host
		this.port = this.instance.config.port

		if (this.onair_poll_interval !== undefined) {
			clearInterval(this.onair_poll_interval)
		}
		this.init_onair_poll()
	}

	destroy(): void {
		if (this.onair_poll_interval !== undefined) {
			clearInterval(this.onair_poll_interval)
		}
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

		const url = `http://${host}:${port}${path}`

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
		await this.sendRequest('/api/v1/command/reload')
	}

	async startContinue(params: { option?: string; rate?: number; effect?: number; delay?: number }): Promise<void> {
		console.log('startContinue', params)
		await this.sendRequest('/api/v1/command/start-continue', params)
	}

	async startFromTop(): Promise<void> {
		await this.sendRequest('/api/v1/command/start-from-top')
	}

	async rehearsalMode(params: { state?: boolean }): Promise<void> {
		await this.sendRequest('/api/v1/command/rehearsal-mode', params)
	}

	async takeTemplate(params: { type: string; variant: string; bus?: string }): Promise<void> {
		await this.sendRequest('/api/v1/command/template', params)
	}

	async directTakeTemplate(params: { number: number }): Promise<void> {
		await this.sendRequest('/api/v1/command/directtake', params)
	}

	async getBuildInfo(): Promise<any> {
		return await this.sendRequest('/build')
	}

	async getApiBuildInfo(): Promise<any> {
		const path = '/api/v1/build'
		return await this.sendRequest(path)
	}

	async getStatus(): Promise<any> {
		return await this.sendRequest('/status')
	}

	async getApiStatus(): Promise<any> {
		const path = '/api/v1/status'
		return await this.sendRequest(path)
	}

	async statusPoll(): Promise<void> {
		if (!this.port || !this.host) {
			this.setModuleStatus()
			return
		}

		try {
			const response = await this.getStatus()
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

	init_onair_poll(): void {
		console.log('init_onair_poll')
		if (this.onair_poll_interval !== undefined) {
			clearInterval(this.onair_poll_interval)
		}

		this.onair_poll_interval = setInterval(() => {
			void this.statusPoll().catch((err) => {
				console.error('Error in onair_poll_interval:', err)
			})
		}, 1000)

		void this.statusPoll().catch((err) => {
			console.error('Error during initial status fetch:', err)
		})
	}
}
