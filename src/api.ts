import { InstanceStatus } from '@companion-module/base'
import got, { OptionsOfTextResponseBody } from 'got'
import { MosartInstance } from './main.js'

export interface OverlayField {
	name: string
	value: string
	default: string | null
	fieldType: string
	keyList: any | null
	inputMask: string | null
	servers: any | null
}

export interface OverlayGraphic {
	id: string
	type: string
	variant: string
	slug: string
	storyId: string
	status: number
	graphicType: string
	handlerName: string
	description: string
	hasContent: boolean
	in: number
	duration: number
	plannedDuration: number
	actualDuration: number
	fields: OverlayField[]
	hasTemplate: any | null
	emptyTemplate: any | null
	templatePlaceHolders: any | null
}

export interface OverlayDataByStory {
	[storyId: string]: OverlayGraphic[]
}

export class MosartAPI {
	instance: MosartInstance
	host: string
	port: number
	private connected: boolean
	status: boolean
	serverDescription: string
	state: string
	timeline: string
	autoTake: boolean
	rehearsalMode: boolean
	crossoverClient: boolean

	constructor(instance: MosartInstance) {
		this.instance = instance
		this.host = ''
		this.port = 0
		this.connected = false
		this.status = false
		this.serverDescription = ''
		this.state = ''
		this.timeline = ''
		this.autoTake = false
		this.rehearsalMode = false
		this.crossoverClient = false
	}

	async configure(): Promise<void> {
		if (!this.instance.config) {
			throw new Error('Config not initialized')
		}

		console.log('Configuring primary server')
		this.host = this.instance.config.host
		this.port = this.instance.config.port

		try {
			await this.connect()
		} catch (error) {
			console.error('Error connecting to Mosart:', error)
			throw error
		}
	}

	async destroy(): Promise<void> {
		// Reset all statuses
		this.status = false
		this.state = ''
		this.timeline = ''
		this.autoTake = false
		this.rehearsalMode = false
		this.crossoverClient = false

		// Update instance status before destroying
		this.instance.updateStatus(InstanceStatus.Disconnected, 'MosartAPI destroyed')
		console.log('MosartAPI destroyed')
	}

	getRehearsalModeStatus(): boolean {
		return this.rehearsalMode
	}

	getTimelineStatus(): boolean {
		return this.timeline === 'Running'
	}

	setModuleStatus(): void {
		if (!this.host) {
			console.log('IP not specified')
			this.instance.updateStatus(InstanceStatus.BadConfig, 'IP not specified')
			return
		}

		console.log('status', this.status)

		if (!this.status) {
			console.log('Could not connect to Mosart')
			this.instance.updateStatus(InstanceStatus.ConnectionFailure, 'Could not connect to Mosart')
			return
		} else {
			this.instance.updateStatus(InstanceStatus.Ok, 'Connected to Mosart')
		}
	}

	private async sendRequest(path: string, parameters: Record<string, any> = {}): Promise<any> {
		const { port, host, apiKey } = this.instance.config

		// Extract version from parameters if provided, otherwise default to v1
		const version = parameters.version || 'v1'

		// Remove version from parameters so it's not sent as a query param
		const { version: _version, ...queryParams } = parameters

		const options: OptionsOfTextResponseBody = {
			method: 'GET',
			timeout: { request: 1000 },
			retry: { limit: 0 },
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': apiKey,
			},
			searchParams: queryParams,
		}

		let url = ''

		if (this.instance.config.useWebApi) {
			url = `http://${host}:${port}/mosart/api/${version}/${path}`
		} else {
			url = `http://${host}:${port}/api/${version}/${path}`
		}
		try {
			// We don't want to log status polling
			if (!path.includes('status') && !path.includes('build')) {
				this.instance.log('debug', `API Request: ${options.method} ${url} ${JSON.stringify(options)}`)
			}
			const response = await got(url, options)
			console.log(`API Response: ${response.statusCode}`)
			return response
		} catch (err: any) {
			console.error(`API Request Failed: ${options.method} ${url}`)
			console.error('Error details:', err.message)
			if (err.response) {
				console.error('Response status:', err.response.statusCode)
				console.error('Response body:', err.response.body)
			}
			this.setConnected(false)
			return null
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

	async setRehearsalMode(params: { state?: boolean }): Promise<void> {
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

	async getOverlayList(): Promise<OverlayGraphic[] | null> {
		try {
			const path = 'overlay/list'
			const response = await this.sendRequest(path)

			if (response === null || !response.body) {
				console.error('Failed to fetch overlay list')
				return null
			}

			const overlayList: OverlayGraphic[] = JSON.parse(response.body)
			return overlayList
		} catch (error) {
			console.error('Error fetching overlay list:', error)
			return null
		}
	}

	async takeOverlay(params: { id?: string; name?: string }): Promise<void> {
		const path = 'overlay/take'
		console.log('takeOverlay', path, params)
		await this.sendRequest(path, params)
	}

	async takeOutOverlay(params: { id?: string; name?: string }): Promise<void> {
		const path = 'overlay/take-out'
		console.log('takeOutOverlay', path, params)
		await this.sendRequest(path, params)
	}

	isConnected(): boolean {
		return this.connected
	}

	setConnected(state: boolean): void {
		const wasConnected = this.connected
		this.connected = state
		this.instance.checkFeedbacks('MosartStatus')
		this.setModuleStatus()

		// If we just connected (transition from false to true), fetch overlay list
		if (!wasConnected && state && this.instance.config.enableOverlayList) {
			void this.instance.fetchAndUpdateOverlayList()
		}
	}

	async poll(): Promise<void> {
		const response = await this.getApiStatus()
		console.log('response', response)
		if (response === null) {
			this.status = false
			this.state = ''
			this.timeline = ''
			this.autoTake = false
			this.rehearsalMode = false
			this.crossoverClient = false
			this.instance.setVariableValues({
				state: '',
				timeline: '',
				autoTake: '',
				rehearsalMode: '',
				crossoverClient: '',
				serverDescription: '',
			})
			this.setConnected(false)
			return
		}
		const responseBody = response.body
		if (!responseBody) {
			this.status = false
			this.state = ''
			this.timeline = ''
			this.autoTake = false
			this.rehearsalMode = false
			this.crossoverClient = false
			this.instance.setVariableValues({
				state: '',
				timeline: '',
				autoTake: '',
				rehearsalMode: '',
				crossoverClient: '',
				serverDescription: '',
			})
			this.setConnected(false)
			return
		}
		const responseJson = JSON.parse(responseBody)
		this.status = true //responseJson.state === 'Active'
		this.state = responseJson.state ?? ''
		this.timeline = responseJson.timeline ?? ''
		this.autoTake = responseJson.autoTake ?? false
		this.rehearsalMode = responseJson.rehearsalMode ?? false
		this.crossoverClient = responseJson.crossoverClient ?? false
		this.instance.setVariableValues({
			state: this.state,
			timeline: this.timeline,
			autoTake: this.autoTake.toString(),
			rehearsalMode: this.rehearsalMode.toString(),
			crossoverClient: this.crossoverClient.toString(),
			serverDescription: responseJson.serverDescription ?? '',
		})
		this.setConnected(true)
	}

	async connect(): Promise<boolean> {
		try {
			await this.poll()
			return true
		} catch (error) {
			console.log(`Connection to Mosart failed`, error)
			throw error
		}
	}
}
