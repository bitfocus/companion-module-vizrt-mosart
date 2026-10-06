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

export interface AudioLevel {
	faderName: string | null
	level: number
}

export const AUDIO_TOGGLE_LABELS: Record<string, string> = {
	holdAudioTransition: 'Hold Audio Transition',
	holdVideoTransition: 'Hold Video Transition',
	keepSoundLevels: 'Keep Sound Levels',
	fadeManual: 'Fade Manual',
	useLevel2Preview: 'Use Level 2 Preview',
	useLevel2OnAir: 'Use Level 2 On Air',
}

export type AudioToggles = Record<string, boolean>

export type TimelinePosition = 'currentStory' | 'nextStory' | 'currentItem' | 'nextItem'

export const TIMELINE_POSITION_LABELS: Record<TimelinePosition, string> = {
	currentStory: 'Current Story',
	nextStory: 'Next Story',
	currentItem: 'Current Item',
	nextItem: 'Next Item',
}

/** Variable ids must be alphanumeric/underscore; fader names contain spaces, "+" and "-". */
export function faderVariableId(faderName: string): string {
	return `fader_${faderName.replace(/[^a-zA-Z0-9_]/g, '_')}`
}

/**
 * Maps each channel to a unique variable id. Names that sanitize to the same
 * id (e.g. "A+B" and "A-B") get a numeric suffix; `channels` must be sorted so
 * the suffixes stay stable between polls.
 */
export function buildFaderVariableIds(channels: string[]): Map<string, string> {
	const ids = new Map<string, string>()
	const used = new Set<string>()
	for (const name of channels) {
		const base = faderVariableId(name)
		let id = base
		for (let n = 2; used.has(id); n++) id = `${base}_${n}`
		used.add(id)
		ids.set(name, id)
	}
	return ids
}

/** The pilot/graphics id lives in the `graphics_id` field rather than on the item itself. */
export function graphicsIdOf(graphic: OverlayGraphic): string {
	return graphic.fields?.find((field) => field.name === 'graphics_id')?.value ?? ''
}

/**
 * The swagger does not document the audio-toggles response body; the server
 * returns a flat object, e.g. `{ "holdAudioTransition": false, ... }`.
 */
export function parseAudioToggles(body: unknown): AudioToggles {
	const result: AudioToggles = {}
	if (body && typeof body === 'object' && !Array.isArray(body)) {
		for (const [name, value] of Object.entries(body)) result[name] = value === true
	}
	return result
}

export interface NamedOverlayAction {
	name: string
	value?: string | null
}

export interface NamedOverlayContentItem {
	elementName: string
	value?: string | null
}

export interface NamedOverlayItem {
	slug: string
	templatetype?: string | null
	in?: string | null
	dur?: string | null
	mosid?: string | null
	use_graphics_id?: string | null
	graphics_id?: string | null
	graphics_out_on?: string | null
	handler_name?: string | null
	description?: string | null
	owner?: string | null
	provider?: string | null
	element_uri?: string | null
	thumbnail_url?: string | null
	actions?: { action?: NamedOverlayAction[] | null }
	contentItems?: NamedOverlayContentItem[] | null
	contentXml?: string | null
}

export type ImportOverlaysMode = 'skip' | 'replace'

export interface ImportOverlaysResult {
	imported: number
	replaced: number
	skipped: number
	failed: number
	errors: string[] | null
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

const UNSUPPORTED_ENDPOINT_RETRY_MS = 60_000

/** Returned by a background request that failed, so the caller can tell a 404 from a timeout. */
export interface BackgroundFailure {
	failed: true
	statusCode?: number
}

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
	audioToggles: AudioToggles
	timelineInfo: Timeline | null
	faderLevels: Record<string, number>
	// Kept across disconnects so fader variables stay defined during an outage;
	// only replaced when the server reports a different set of channels.
	private faderChannels: string[] = []
	private faderVariableIds = new Map<string, string>()
	onAirGraphics: OverlayGraphic[]
	mosartVersion: string
	// Optional endpoints that returned 404 (e.g. older servers without them, or
	// a state like "no rundown loaded") are retried after a cooldown rather
	// than every poll. Maps path to the time it may be retried.
	private unsupportedEndpoints = new Map<string, number>()
	private reportedUnsupported = new Set<string>()
	private optionalPollInFlight = false
	private optionalStateCleared = true
	// Set by destroy(); an instance replaced after a host change can still have
	// requests in flight, and their results must not reach the module.
	private destroyed = false

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
		this.audioToggles = {}
		this.timelineInfo = null
		this.faderLevels = {}
		this.onAirGraphics = []
		this.mosartVersion = ''
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
		this.destroyed = true
		// Reset all statuses
		this.status = false
		this.state = ''
		this.timeline = ''
		this.autoTake = false
		this.rehearsalMode = false
		this.crossoverClient = false
		this.audioToggles = {}
		this.timelineInfo = null
		this.faderLevels = {}
		this.onAirGraphics = []

		// Update instance status before destroying
		this.instance.updateStatus(InstanceStatus.Disconnected, 'MosartAPI destroyed')
		this.instance.logMsg('info', 'MosartAPI destroyed')
	}

	getRehearsalModeStatus(): boolean {
		return this.rehearsalMode
	}

	getAudioToggleStatus(toggle: string): boolean {
		return this.audioToggles[toggle] ?? false
	}

	getKnownFaderChannels(): string[] {
		return this.faderChannels
	}

	getFaderVariableIds(): ReadonlyMap<string, string> {
		return this.faderVariableIds
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
		method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
		body?: unknown,
		background = false,
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
		const isPollRequest = background || path.includes('status') || path.includes('build')

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
			// Only the status poll and user actions decide the connection state; a
			// slow or failing background request must not take the module offline.
			if (background) return { failed: true, statusCode: err.response?.statusCode } satisfies BackgroundFailure
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

	async setServerActive(): Promise<void> {
		await this.sendRequest('command/server-active')
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
		await this.sendRequest(`assets/template/${encodeURIComponent(mosartItemId)}/take`, params, 'POST')
	}

	// Devices

	async setDeviceStandby(type: DeviceApiType, standby: boolean): Promise<void> {
		await this.sendRequest(`devices/${type}`, {}, 'PATCH', { standby })
	}

	async setDeviceStandbyById(type: DeviceApiTypeWithId, id: string, standby: boolean): Promise<void> {
		await this.sendRequest(`devices/${type}/${encodeURIComponent(id)}`, {}, 'PATCH', { standby })
	}

	async setDeviceStandbyByIds(
		type: DeviceApiTypeWithIds,
		controllerId: number,
		deviceId: number,
		standby: boolean,
	): Promise<void> {
		await this.sendRequest(`devices/${type}/${controllerId}/${deviceId}`, {}, 'PATCH', { standby })
	}

	async getAudioToggles(): Promise<AudioToggles | null> {
		const response = await this.sendRequest('devices/audio-toggles')
		if (!response?.body) return null
		return parseAudioToggles(JSON.parse(response.body))
	}

	/**
	 * Fetches an optional state endpoint during a poll. `apply` receives the
	 * parsed body, or null when the server returned no content or the request
	 * failed. An endpoint that returns 404 is skipped for a cooldown, or until
	 * the next reconnect; any other failure is retried on the next poll.
	 */
	private async pollOptional(
		path: string,
		query: Record<string, any>,
		apply: (data: unknown) => void,
		notFoundMeansEmpty = false,
	): Promise<void> {
		const retryAt = this.unsupportedEndpoints.get(path)
		if (retryAt !== undefined && Date.now() < retryAt) return
		const response = await this.sendRequest(path, query, 'GET', undefined, true)
		// The connection may have dropped (and the state been cleared) or this
		// instance been replaced while the request was in flight.
		if (this.destroyed || !this.connected) return
		if (response === null) return // host not configured
		if ((response as BackgroundFailure).failed) {
			if ((response as BackgroundFailure).statusCode === 404 && !notFoundMeansEmpty) {
				this.unsupportedEndpoints.set(path, Date.now() + UNSUPPORTED_ENDPOINT_RETRY_MS)
				const firstTime = !this.reportedUnsupported.has(path)
				this.reportedUnsupported.add(path)
				this.instance.logMsg(
					firstTime ? 'info' : 'debug',
					`${path} returned 404; retrying in ${UNSUPPORTED_ENDPOINT_RETRY_MS / 1000}s`,
				)
			}
			apply(null)
			return
		}
		this.unsupportedEndpoints.delete(path)
		try {
			apply(response.body ? JSON.parse(response.body) : null)
		} catch (error) {
			this.instance.logMsg(
				'debug',
				`Could not parse ${path} response: ${error instanceof Error ? error.message : String(error)}`,
			)
			apply(null)
		}
	}

	/**
	 * Runs the optional polls without holding up the status poll, so a slow
	 * endpoint cannot stretch the poll interval. A run still in progress is not
	 * overlapped; the next status poll simply skips it.
	 */
	private startOptionalPoll(): void {
		if (this.optionalPollInFlight) return
		this.optionalPollInFlight = true
		this.pollOptionalState()
			.catch((error) => {
				this.instance.logMsg(
					'debug',
					`Optional state poll failed: ${error instanceof Error ? error.message : String(error)}`,
				)
			})
			.finally(() => {
				this.optionalPollInFlight = false
			})
	}

	private async pollOptionalState(): Promise<void> {
		const config = this.instance.config
		const polls: Promise<void>[] = []
		this.optionalStateCleared = false
		// A feature switched off in the config has its last state cleared once.
		if (config.enableAudioToggles) {
			polls.push(
				this.pollOptional('devices/audio-toggles', {}, (data) => this.setAudioToggles(parseAudioToggles(data))),
			)
		} else if (Object.keys(this.audioToggles).length > 0) {
			this.setAudioToggles({})
		}
		if (config.enableTimelineInfo) {
			polls.push(this.pollOptional('timeline', {}, (data) => this.setTimelineInfo((data as Timeline | null) ?? null)))
		} else if (this.timelineInfo !== null) {
			this.setTimelineInfo(null)
		}
		if (config.enableFaderLevels) {
			polls.push(
				this.pollOptional('faders/levels', {}, (data) =>
					this.setFaderLevels((data as Record<string, AudioLevel> | null) ?? {}),
				),
			)
		} else if (this.faderChannels.length > 0) {
			this.setFaderLevels({}, true)
		}
		if (config.enableOnAirGraphics) {
			polls.push(
				// This endpoint's 404 reflects rundown state (e.g. none loaded), not a
				// missing endpoint, so it is treated as nothing on air and not paused.
				this.pollOptional(
					'assets/graphics',
					{ onair: true },
					(data) => this.setOnAirGraphics(Array.isArray(data) ? (data as OverlayGraphic[]) : []),
					true,
				),
			)
		} else if (this.onAirGraphics.length > 0) {
			this.setOnAirGraphics([])
		}
		await Promise.all(polls)
	}

	/**
	 * Clears every optional state when the connection is lost. Failed polls
	 * repeat while the server is down, so this only does work once per outage.
	 */
	private clearOptionalState(): void {
		if (this.optionalStateCleared) return
		this.optionalStateCleared = true
		this.setAudioToggles({})
		this.setTimelineInfo(null)
		this.setFaderLevels({})
		this.setOnAirGraphics([])
	}

	private setAudioToggles(toggles: AudioToggles): void {
		if (this.destroyed) return
		this.audioToggles = toggles
		if (this.instance.config.enableAudioToggles) {
			const values: Record<string, string> = {}
			for (const key of Object.keys(AUDIO_TOGGLE_LABELS)) {
				values[`audioToggle_${key}`] = key in toggles ? toggles[key].toString() : ''
			}
			this.instance.setVariableValues(values)
		}
		this.instance.checkFeedbacks('AudioToggleStatus')
	}

	private setTimelineInfo(timeline: Timeline | null): void {
		if (this.destroyed) return
		// Mosart reports an empty story/item as "-", which is normalized to ''
		// so it neither shows in variables nor matches in feedbacks.
		const clean = (value: string | null | undefined): string => (value && value !== '-' ? value : '')
		this.timelineInfo = timeline
		const values: Record<string, string> = {}
		for (const position of Object.keys(TIMELINE_POSITION_LABELS) as TimelinePosition[]) {
			const item = timeline?.[position]
			if (item) {
				item.id = clean(item.id)
				item.slug = clean(item.slug)
			}
			values[`timeline_${position}_id`] = item?.id ?? ''
			values[`timeline_${position}_slug`] = item?.slug ?? ''
		}
		if (this.instance.config.enableTimelineInfo) this.instance.setVariableValues(values)
		this.instance.checkFeedbacks('TimelineItemMatch')
	}

	/**
	 * Stores fader levels. An empty result (outage, failed request) blanks the
	 * values but keeps the channel list, so fader variables stay defined;
	 * `forgetChannels` drops the channels too, for when the feature is disabled.
	 */
	private setFaderLevels(levels: Record<string, AudioLevel>, forgetChannels = false): void {
		if (this.destroyed) return
		this.faderLevels = {}
		for (const [name, level] of Object.entries(levels)) {
			if (typeof level?.level === 'number') this.faderLevels[level.faderName ?? name] = level.level
		}

		// Fader variables, presets and the feedback's channel dropdown are built from
		// the channel list, so they are redefined whenever the set of channels changes.
		const previousIds = this.faderVariableIds
		const channels = Object.keys(this.faderLevels).sort((a, b) => a.localeCompare(b))
		if ((channels.length > 0 || forgetChannels) && channels.join('\n') !== this.faderChannels.join('\n')) {
			this.faderChannels = channels
			this.faderVariableIds = buildFaderVariableIds(channels)
			this.instance.updateVariableDefinitions()
			this.instance.updateFeedbacks()
			this.instance.updatePresetDefinitions()
		}

		if (this.instance.config.enableFaderLevels) {
			// Dropped channels are blanked first so their last value is not left stale.
			const values: Record<string, string> = {}
			for (const id of previousIds.values()) values[id] = ''
			for (const [name, id] of this.faderVariableIds) values[id] = this.faderLevels[name]?.toFixed(2) ?? ''
			this.instance.setVariableValues(values)
		}
		this.instance.checkFeedbacks('FaderLevel')
	}

	private setOnAirGraphics(graphics: OverlayGraphic[]): void {
		if (this.destroyed) return
		this.onAirGraphics = graphics
		if (this.instance.config.enableOnAirGraphics) {
			this.instance.setVariableValues({
				onair_graphics_count: graphics.length.toString(),
				onair_graphics_slugs: graphics.map((graphic) => graphic.slug).join(', '),
			})
		}
		this.instance.checkFeedbacks('GraphicOnAir')
	}

	private async fetchBuildInfo(): Promise<void> {
		const response = await this.sendRequest('build', {}, 'GET', undefined, true)
		if (this.destroyed || !this.connected) return
		let build: Build | null = null
		try {
			build = response?.body ? (JSON.parse(response.body) as Build) : null
		} catch {
			build = null
		}
		this.mosartVersion = build?.version ?? ''
		this.instance.setVariableValues({ mosartVersion: this.mosartVersion })
	}

	// Faders

	async getFaderChannels(): Promise<string[] | null> {
		const response = await this.sendRequest('faders/channels')
		if (!response?.body) return null
		return JSON.parse(response.body) as string[]
	}

	async getFaderLevels(): Promise<Record<string, AudioLevel> | null> {
		const response = await this.sendRequest('faders/levels')
		if (!response?.body) return null
		return JSON.parse(response.body) as Record<string, AudioLevel>
	}

	async getFaderLevel(faderName: string): Promise<AudioLevel | null> {
		const response = await this.sendRequest(`faders/levels/${encodeURIComponent(faderName)}`)
		if (!response?.body) return null
		return JSON.parse(response.body) as AudioLevel
	}

	async setFaderLevel(faderName: string, level: number): Promise<void> {
		await this.sendRequest(`faders/levels/${encodeURIComponent(faderName)}`, {}, 'PUT', level)
	}

	// Media

	async searchMedia(name: string): Promise<SearchResultDto[] | null> {
		const response = await this.sendRequest('media/search', { name })
		if (!response?.body) return null
		return JSON.parse(response.body) as SearchResultDto[]
	}

	async getMediaServer(name: string): Promise<Record<string, any> | null> {
		const response = await this.sendRequest(`media/servers/${encodeURIComponent(name)}`)
		if (!response?.body) return null
		return JSON.parse(response.body) as Record<string, any>
	}

	async createMediaServer(server: Record<string, any>): Promise<void> {
		await this.sendRequest('media/servers', {}, 'PUT', server)
	}

	async updateMediaServer(name: string, settings: Record<string, any>): Promise<void> {
		await this.sendRequest(`media/servers/${encodeURIComponent(name)}`, {}, 'PATCH', settings)
	}

	async deleteMediaServer(name: string): Promise<void> {
		await this.sendRequest(`media/servers/${encodeURIComponent(name)}`, {}, 'DELETE')
	}

	// Named overlays
	// Single items are addressed by a `slug` query parameter rather than a path
	// segment, so slugs containing "/" or "%" survive proxies unchanged.

	async getNamedOverlays(): Promise<NamedOverlayItem[] | null> {
		const response = await this.sendRequest('namedoverlays')
		if (!response?.body) return null
		return JSON.parse(response.body) as NamedOverlayItem[]
	}

	async getNamedOverlay(slug: string): Promise<NamedOverlayItem | null> {
		const response = await this.sendRequest('namedoverlays/item', { slug })
		if (!response?.body) return null
		return JSON.parse(response.body) as NamedOverlayItem
	}

	async createNamedOverlay(item: NamedOverlayItem): Promise<void> {
		await this.sendRequest('namedoverlays', {}, 'POST', item)
	}

	async updateNamedOverlay(slug: string, item: NamedOverlayItem): Promise<void> {
		await this.sendRequest('namedoverlays/item', { slug }, 'PUT', item)
	}

	async deleteNamedOverlay(slug: string): Promise<void> {
		await this.sendRequest('namedoverlays/item', { slug }, 'DELETE')
	}

	async importNamedOverlays(
		items: NamedOverlayItem[],
		mode?: ImportOverlaysMode,
	): Promise<ImportOverlaysResult | null> {
		const response = await this.sendRequest('namedoverlays/import', {}, 'POST', { items, mode })
		if (!response?.body) return null
		return JSON.parse(response.body) as ImportOverlaysResult
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

		if (!wasConnected && state) {
			this.unsupportedEndpoints.clear()
			this.reportedUnsupported.clear()
			void this.fetchBuildInfo()
		} else if (wasConnected && !state) {
			this.mosartVersion = ''
			this.instance.setVariableValues({ mosartVersion: '' })
		}

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
		if (this.destroyed) return
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
			this.instance.checkFeedbacks('RehearsalStatus', 'TimelineStatus', 'TimelineState', 'ServerState')
			this.clearOptionalState()
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
			this.instance.checkFeedbacks('RehearsalStatus', 'TimelineStatus', 'TimelineState', 'ServerState')
			this.clearOptionalState()
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
		this.instance.checkFeedbacks(
			'AutoTakeStatus',
			'CrossoverClientStatus',
			'ServerDescription',
			'RehearsalStatus',
			'TimelineStatus',
			'TimelineState',
			'ServerState',
		)
		this.setConnected(true)
		this.startOptionalPoll()
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
