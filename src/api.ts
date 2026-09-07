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

export interface SearchResultDto {
	name: string | null
	description: string | null
	previewPath: string | null
	thumbnailPath: string | null
}

export interface Build {
	version: string | null
	timestamp: string | null
	hubVersion: number
}

export type IdleState = 'Unknown' | 'Idle' | 'Active'
export type TimelineState = 'Stopped' | 'Running' | 'Paused'

export interface ServerStatus {
	state: IdleState
	timeline: TimelineState
	autoTake: boolean
	rehearsalMode: boolean
	crossoverClient: boolean
	serverDescription: string | null
}

export interface TimelineItemProperties {
	id: string | null
	slug: string | null
}

export interface Timeline {
	status: TimelineState
	currentStory: TimelineItemProperties
	nextStory: TimelineItemProperties
	currentItem: TimelineItemProperties
	nextItem: TimelineItemProperties
}

export type TransitionType = 'Mix' | 'Wipe' | 'Effect'

export interface Transition {
	type: TransitionType
	rateOrIndex: number
}

export interface StoryItem {
	subItems: OverlayGraphic[] | null
	transition: Transition
	bodyText: string | null
	id: string | null
	type: string | null
	variant: string | null
	slug: string | null
	storyId: string | null
	objId: string | null
	mosId: string | null
	itemId: string | null
	rundownId: string | null
	status: number
	graphicType: string | null
	handlerName: string | null
	description: string | null
	hasContent: boolean | null
	in: number
	duration: number
	plannedDuration: number
	actualDuration: number
	fields: OverlayField[] | null
	hasTemplate: boolean | null
	emptyTemplate: boolean | null
	templatePlaceHolders: number | null
	owner: string | null
	insert: string | null
}

export interface Story {
	id: string | null
	insertId: string | null
	storyDuration: number
	storyPlannedDuration: number
	storyBackTime: number
	pageNumber: string | null
	slug: string | null
	accessories: OverlayGraphic[] | null
	items: StoryItem[] | null
}

export interface Rundown {
	id: string | null
	name: string | null
	stories: Story[] | null
}

export interface UpdateFieldsRequest {
	newsroomTag: string
	crosspoint: string
}

export type DeviceApiType =
	| 'audio'
	| 'audio-player'
	| 'fullscreen-graphics'
	| 'generic-rest'
	| 'gpi'
	| 'graphics'
	| 'lights'
	| 'loudness'
	| 'robotic-camera'
	| 'router'
	| 'subtitling'
	| 'switcher'
	| 'video'
	| 'video-wall'
	| 'virtual-set'
	| 'weather'

export type DeviceApiTypeWithId = 'fullscreen-graphics' | 'generic-rest' | 'graphics' | 'robotic-camera'
export type DeviceApiTypeWithIds = 'robotic-camera'
export type BusType = 'Program' | 'Preview'

export class MosartAPI {
	instance: MosartInstance
	host: string
	port: number
	private connected: boolean
	private lastLoggedConnected: boolean | undefined
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
		this.lastLoggedConnected = undefined
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

		this.host = (this.instance.config.host ?? '').trim()
		this.port = this.instance.config.port

		if (!this.host) {
			this.setConnected(false)
			this.instance.logMsg('warn', 'Target IP or Hostname is not set; connection disabled')
			return
		}

		this.instance.logMsg('info', 'Configuring primary server')

		try {
			await this.connect()
		} catch (error) {
			this.instance.logMsg(
				'error',
				`Error connecting to Mosart: ${error instanceof Error ? error.message : String(error)}`,
			)
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
		this.instance.logMsg('info', 'MosartAPI destroyed')
	}

	getRehearsalModeStatus(): boolean {
		return this.rehearsalMode
	}

	getTimelineStatus(): boolean {
		return this.timeline === 'Running'
	}

	/**
	 * Runs on every poll, so anything above debug level is only emitted when
	 * `stateChanged` is set - otherwise a server that is down would produce one
	 * message per poll interval.
	 */
	setModuleStatus(stateChanged = false): void {
		if (!this.host) {
			if (stateChanged) this.instance.logMsg('warn', 'Target IP or Hostname is not set')
			this.instance.updateStatus(InstanceStatus.BadConfig, 'Target IP or Hostname is not set')
			return
		}

		this.instance.logMsg('debug', `Status: ${this.status}`)

		if (!this.status) {
			if (stateChanged) this.instance.logMsg('warn', 'Could not connect to Mosart')
			this.instance.updateStatus(InstanceStatus.ConnectionFailure, 'Could not connect to Mosart')
			return
		} else {
			if (stateChanged) this.instance.logMsg('info', 'Connected to Mosart')
			this.instance.updateStatus(InstanceStatus.Ok, 'Connected to Mosart')
		}
	}

	private async sendRequest(
		path: string,
		queryParams: Record<string, any> = {},
		method: 'GET' | 'POST' | 'PATCH' = 'GET',
		body?: Record<string, any>,
	): Promise<any> {
		const { port, apiKey } = this.instance.config
		const host = (this.instance.config.host ?? '').trim()

		if (!host) {
			this.setConnected(false)
			return null
		}

		const version = queryParams.version || 'v1'
		const { version: _version, ...params } = queryParams

		const useHttps = this.instance.config.useHttps === true

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}
		// The Mosart API does not require an API key for every deployment, so
		// only send the header when the user has actually configured one.
		if (apiKey && apiKey.length > 0) {
			headers['X-Api-Key'] = apiKey
		}

		const options: OptionsOfTextResponseBody = {
			method,
			timeout: { request: 1000 },
			retry: { limit: 0 },
			headers,
			searchParams: Object.keys(params).length > 0 ? params : undefined,
			// Vizrt Mosart ships with a self-signed TLS certificate on its HTTPS
			// endpoints, so the default certificate validation must be disabled
			// for HTTPS to work out-of-the-box.
			...(useHttps ? { https: { rejectUnauthorized: false } } : {}),
			...(body !== undefined ? { json: body, responseType: undefined } : {}),
		}

		const protocol = useHttps ? 'https' : 'http'
		const baseUrl = this.instance.config.useWebApi
			? `${protocol}://${host}:${port}/mosart/api/${version}`
			: `${protocol}://${host}:${port}/api/${version}`

		const url = `${baseUrl}/${path}`

		// The status and build endpoints are hit on every poll, so they are left
		// out of the request/response logging to keep the debug level readable.
		const isPollRequest = path.includes('status') || path.includes('build')

		try {
			if (!isPollRequest) {
				this.instance.logMsg('debug', `API Request: ${method} ${url}`)
			}
			const response = await got(url, options)
			if (!isPollRequest) {
				this.instance.logMsg('debug', `API Response: ${response.statusCode}`)
			}
			return response
		} catch (err: any) {
			// A failing poll request repeats every poll interval, and the resulting
			// connection loss is already reported by setConnected, so it is demoted
			// to debug. Action-triggered requests are rare and always reported.
			this.instance.logMsg(isPollRequest ? 'debug' : 'error', `API Request Failed: ${method} ${url} - ${err.message}`)
			if (err.response) {
				this.instance.logMsg('debug', `Response status: ${err.response.statusCode}, body: ${String(err.response.body)}`)
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

	async takeTemplate(params: { type: string; variant: string; bus?: string; insert?: boolean }): Promise<void> {
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

	async getApiBuildInfo(): Promise<Build | null> {
		const response = await this.sendRequest('build')
		if (!response?.body) return null
		return JSON.parse(response.body) as Build
	}

	async getApiStatus(): Promise<any> {
		return await this.sendRequest('status')
	}

	async getRehearsalModeState(): Promise<boolean | null> {
		const response = await this.sendRequest('rehearsal-mode')
		if (!response?.body) return null
		return JSON.parse(response.body) as boolean
	}

	async getTimeline(): Promise<Timeline | null> {
		const response = await this.sendRequest('timeline')
		if (!response?.body) return null
		return JSON.parse(response.body) as Timeline
	}

	async getRundown(): Promise<Rundown | null> {
		const response = await this.sendRequest('rundown')
		if (!response?.body) return null
		return JSON.parse(response.body) as Rundown
	}

	async updateTimelineFields(target: BusType, request: UpdateFieldsRequest): Promise<void> {
		await this.sendRequest(`timeline/${target}`, {}, 'PATCH', request)
	}

	// Assets - Graphics

	async getOverlayList(onair?: boolean): Promise<OverlayGraphic[] | null> {
		try {
			const params: Record<string, any> = {}
			if (onair !== undefined) params.onair = onair
			const response = await this.sendRequest('assets/graphics', params)
			if (!response?.body) return null
			return JSON.parse(response.body) as OverlayGraphic[]
		} catch (error) {
			this.instance.logMsg(
				'error',
				`Error fetching overlay list: ${error instanceof Error ? error.message : String(error)}`,
			)
			return null
		}
	}

	async takeOverlay(params: { id?: string; name?: string }): Promise<void> {
		if (params.id) {
			await this.sendRequest(`assets/graphics/${params.id}/take`, {}, 'POST')
		} else if (params.name) {
			await this.sendRequest('assets/graphics/take', { name: params.name }, 'POST')
		}
	}

	async takeOutOverlay(params: { id?: string; name?: string }): Promise<void> {
		if (params.id) {
			await this.sendRequest(`assets/graphics/${params.id}/take-out`, {}, 'POST')
		} else if (params.name) {
			await this.sendRequest('assets/graphics/take-out', { name: params.name }, 'POST')
		}
	}

	// Assets - Template

	async takeAssetTemplateById(mosartItemId: string, target?: BusType, insert?: boolean): Promise<void> {
		const params: Record<string, any> = {}
		if (target !== undefined) params.target = target
		if (insert !== undefined) params.insert = insert
		await this.sendRequest(`assets/template/${mosartItemId}/take`, params, 'POST')
	}

	// Devices

	async setDeviceStandby(type: DeviceApiType, standby: boolean): Promise<void> {
		await this.sendRequest(`devices/${type}`, {}, 'PATCH', { standby })
	}

	async setDeviceStandbyById(type: DeviceApiTypeWithId, id: string, standby: boolean): Promise<void> {
		await this.sendRequest(`devices/${type}/${id}`, {}, 'PATCH', { standby })
	}

	async setDeviceStandbyByIds(
		type: DeviceApiTypeWithIds,
		controllerId: number,
		deviceId: number,
		standby: boolean,
	): Promise<void> {
		await this.sendRequest(`devices/${type}/${controllerId}/${deviceId}`, {}, 'PATCH', { standby })
	}

	async getAudioToggles(): Promise<any> {
		const response = await this.sendRequest('devices/audio-toggles')
		if (!response?.body) return null
		return JSON.parse(response.body)
	}

	// Media

	async searchMedia(name: string): Promise<SearchResultDto[] | null> {
		const response = await this.sendRequest('media/search', { name })
		if (!response?.body) return null
		return JSON.parse(response.body) as SearchResultDto[]
	}

	// Settings

	async getNrcsSettings(): Promise<Record<string, any> | null> {
		const response = await this.sendRequest('settings/nrcs')
		if (!response?.body) return null
		return JSON.parse(response.body) as Record<string, any>
	}

	async updateNrcsSettings(settings: Record<string, any>): Promise<void> {
		await this.sendRequest('settings/nrcs', {}, 'PATCH', settings)
	}

	isConnected(): boolean {
		return this.connected
	}

	setConnected(state: boolean): void {
		const wasConnected = this.connected
		this.connected = state
		this.instance.checkFeedbacks('MosartStatus')

		// Undefined until the first call, so the initial state is always reported.
		const stateChanged = this.lastLoggedConnected !== state
		if (stateChanged) this.lastLoggedConnected = state
		this.setModuleStatus(stateChanged)

		// If we just connected (transition from false to true), fetch overlay list
		if (!wasConnected && state && this.instance.config.enableOverlayList) {
			void this.instance.fetchAndUpdateOverlayList()
		}
	}

	async poll(): Promise<void> {
		if (!this.instance.config.host?.trim()) {
			this.host = ''
			this.status = false
			this.setConnected(false)
			return
		}

		const response = await this.getApiStatus()
		this.instance.logMsg('debug', `Poll response: ${response === null ? 'no response' : response.statusCode}`)
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
		this.serverDescription = responseJson.serverDescription ?? ''
		this.instance.setVariableValues({
			state: this.state,
			timeline: this.timeline,
			autoTake: this.autoTake.toString(),
			rehearsalMode: this.rehearsalMode.toString(),
			crossoverClient: this.crossoverClient.toString(),
			serverDescription: this.serverDescription,
		})
		this.instance.checkFeedbacks('AutoTakeStatus', 'CrossoverClientStatus', 'ServerDescription')
		this.setConnected(true)
	}

	async connect(): Promise<boolean> {
		try {
			await this.poll()
			return true
		} catch (error) {
			this.instance.logMsg(
				'error',
				`Connection to Mosart failed: ${error instanceof Error ? error.message : String(error)}`,
			)
			throw error
		}
	}
}
