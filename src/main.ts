import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { DEFAULT_POLL_INTERVAL_MS, GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresetDefinitions } from './presets.js'
import { MosartAPI, OverlayDataByStory } from './api.js'
import { shouldLog, type MessageLevel } from './logging.js'

const MAX_POLL_BACKOFF_MS = 30_000

function nextPollDelay(pollIntervalMs: number, consecutiveFailures: number): number {
	if (consecutiveFailures <= 0) return pollIntervalMs
	const exponent = Math.min(consecutiveFailures, 10)
	const maximumDelay = Math.max(pollIntervalMs, MAX_POLL_BACKOFF_MS)
	return Math.min(pollIntervalMs * 2 ** exponent, maximumDelay)
}

export class MosartInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	mosartAPI!: MosartAPI
	pollInterval: NodeJS.Timeout | undefined
	isBackup: boolean
	private lastConnectionString?: string
	private lastPollInterval?: number
	private pollingActive = false
	private pollingGeneration = 0
	private consecutiveFailures = 0
	overlayData: OverlayDataByStory
	currentStoryId: string
	storyList: string[]
	lastTakenOverlayId: string

	constructor(internal: unknown) {
		super(internal)
		this.pollInterval = undefined
		this.isBackup = false
		this.overlayData = {}
		this.currentStoryId = ''
		this.storyList = []
		this.lastTakenOverlayId = ''
	}

	/**
	 * Every log message in this module goes through here so the configured
	 * Log Level can suppress it before it reaches the Companion log.
	 */
	logMsg(level: MessageLevel, message: string): void {
		if (!shouldLog(this.config?.logLevel, level)) return
		this.log(level, message)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		if (!config.host?.trim()) {
			this.updateStatus(InstanceStatus.BadConfig, 'Target IP or Hostname is not set')
		} else {
			this.updateStatus(InstanceStatus.Connecting)
		}

		// Create MosartAPI instance first
		this.mosartAPI = new MosartAPI(this)
		this.logMsg('info', 'MosartAPI initialized')

		try {
			await this.configUpdated(config)

			this.logMsg('info', 'Config updated and connected')

			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableDefinitions()
			this.updatePresetDefinitions()

			this.logMsg('info', 'Done setting up actions, feedbacks, variables, and presets')

			this.logMsg('info', 'Starting polling')
			await this.startPolling()
		} catch (error) {
			this.logMsg('error', `Error updating config: ${error instanceof Error ? error.message : String(error)}`)
			await this.startPolling()

			return
		}
	}

	private async startPolling(): Promise<void> {
		this.stopPolling()

		if (!this.config.host?.trim()) {
			this.updateStatus(InstanceStatus.BadConfig, 'Target IP or Hostname is not set')
			this.logMsg('warn', 'Polling disabled: Target IP or Hostname is not set')
			return
		}

		const interval = this.config.pollInterval ?? DEFAULT_POLL_INTERVAL_MS
		this.lastPollInterval = interval
		this.consecutiveFailures = 0
		this.pollingActive = true
		const generation = this.pollingGeneration

		// Wait one interval before the first scheduled poll; configure() already
		// performs an immediate attempt when the host is set.
		this.scheduleNextPoll(interval, generation)
	}

	private scheduleNextPoll(delayMs: number, generation: number): void {
		if (!this.pollingActive || generation !== this.pollingGeneration) return

		this.pollInterval = setTimeout(() => {
			void this.runPoll(generation)
		}, delayMs)
	}

	private async runPoll(generation: number): Promise<void> {
		if (!this.pollingActive || generation !== this.pollingGeneration) return

		if (!this.config.host?.trim()) {
			this.stopPolling()
			this.updateStatus(InstanceStatus.BadConfig, 'Target IP or Hostname is not set')
			this.logMsg('warn', 'Polling disabled: Target IP or Hostname is not set')
			return
		}

		try {
			if (this.mosartAPI) {
				await this.mosartAPI.poll()
			}
		} catch (error) {
			this.mosartAPI?.setConnected(false)
			this.logMsg('debug', `Poll failed with an error: ${error instanceof Error ? error.message : String(error)}`)
		}

		if (!this.pollingActive || generation !== this.pollingGeneration) return

		const interval = this.config.pollInterval ?? DEFAULT_POLL_INTERVAL_MS
		let delay = interval
		if (this.mosartAPI?.isConnected()) {
			this.consecutiveFailures = 0
		} else {
			this.consecutiveFailures++
			delay = nextPollDelay(interval, this.consecutiveFailures)
			this.logMsg('debug', `Poll failed; retrying in ${delay}ms (attempt ${this.consecutiveFailures})`)
		}

		this.scheduleNextPoll(delay, generation)
	}

	async destroy(): Promise<void> {
		this.logMsg('debug', 'destroy')
		this.stopPolling()
		if (this.mosartAPI) {
			await this.mosartAPI.destroy()
		}
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		const newConnectionString = `${config.host ?? ''}:${config.port ?? ''}`
		const newPollInterval = config.pollInterval ?? DEFAULT_POLL_INTERVAL_MS

		if (this.lastConnectionString !== newConnectionString) {
			// Host or port changed, reset connection state
			if (this.mosartAPI) {
				await this.mosartAPI.destroy() // or a specific disconnect/reset method
			}
			this.mosartAPI = new MosartAPI(this)
			this.lastConnectionString = newConnectionString

			// Stop and restart polling interval
			this.stopPolling()
			await this.startPolling()
		} else if (this.lastPollInterval !== newPollInterval) {
			// Poll interval changed, restart polling without resetting the connection
			this.stopPolling()
			await this.startPolling()
		}

		try {
			await this.mosartAPI?.configure()
			//this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			this.logMsg('error', `Error configuring API: ${err instanceof Error ? err.message : String(err)}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
		}

		// Update presets when config changes (especially enableOverlayList)
		this.updatePresetDefinitions()

		return
	}

	private stopPolling(): void {
		this.pollingActive = false
		this.pollingGeneration++
		this.consecutiveFailures = 0
		if (this.pollInterval !== undefined) {
			clearTimeout(this.pollInterval)
			this.pollInterval = undefined
		}
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updatePresetDefinitions(): void {
		UpdatePresetDefinitions(this)
	}

	async fetchAndUpdateOverlayList(): Promise<void> {
		if (!this.config.enableOverlayList) {
			return
		}

		this.logMsg('debug', 'Fetching overlay list...')
		const overlayList = await this.mosartAPI.getOverlayList()

		if (overlayList === null) {
			this.logMsg('warn', 'Failed to fetch overlay list')
			return
		}

		// Group overlays by storyId
		const groupedData: OverlayDataByStory = {}
		const storyIds = new Set<string>()

		for (const overlay of overlayList) {
			if (!groupedData[overlay.storyId]) {
				groupedData[overlay.storyId] = []
			}
			groupedData[overlay.storyId].push(overlay)
			storyIds.add(overlay.storyId)
		}

		this.overlayData = groupedData
		this.storyList = Array.from(storyIds)

		// Set current story to first story if not set
		if (!this.currentStoryId && this.storyList.length > 0) {
			this.currentStoryId = this.storyList[0]
		}

		this.logMsg(
			'info',
			`Overlay list updated: ${overlayList.length} graphics across ${Object.keys(groupedData).length} stories`,
		)

		// Update variable definitions to include new overlay variables
		this.updateVariableDefinitions()

		// Update variables with overlay data
		this.updateOverlayVariables()
		this.updateCurrentStoryVariables()
	}

	updateOverlayVariables(): void {
		if (!this.config.enableOverlayList) {
			return
		}

		const variables: { [key: string]: string } = {}

		for (const [storyId, overlays] of Object.entries(this.overlayData)) {
			// Create a sanitized variable name from storyId
			const sanitizedStoryId = storyId.replace(/[^a-zA-Z0-9_]/g, '_')

			// Store story index (1-based)
			const storyIndex = this.storyList.indexOf(storyId) + 1
			variables[`overlay_${sanitizedStoryId}_story_index`] = storyIndex.toString()

			// Store count of overlays for this story
			variables[`overlay_${sanitizedStoryId}_count`] = overlays.length.toString()

			// Store each overlay's information
			overlays.forEach((overlay, index) => {
				const prefix = `overlay_${sanitizedStoryId}_${index}`

				// Split slug into parts
				const slugParts = overlay.slug.split('/')
				if (slugParts.length > 1) {
					variables[`${prefix}_overlayType`] = slugParts[0].trim()
					variables[`${prefix}_overlayName`] = slugParts[1].trim()
				} else {
					// No / found, try splitting on first _
					const underscoreIndex = overlay.slug.indexOf('_')
					if (underscoreIndex > 0) {
						variables[`${prefix}_overlayType`] = overlay.slug.substring(0, underscoreIndex)
						variables[`${prefix}_overlayName`] = overlay.slug.substring(underscoreIndex + 1)
					} else {
						variables[`${prefix}_overlayType`] = ''
						variables[`${prefix}_overlayName`] = overlay.slug
					}
				}

				variables[`${prefix}_id`] = overlay.id
				variables[`${prefix}_type`] = overlay.type
				variables[`${prefix}_variant`] = overlay.variant
				variables[`${prefix}_slug`] = overlay.slug
				variables[`${prefix}_handler`] = overlay.handlerName
				variables[`${prefix}_description`] = overlay.description
				variables[`${prefix}_in`] = overlay.in.toString()
				variables[`${prefix}_duration`] = overlay.duration.toString()

				// Store graphics_id field if it exists
				const graphicsIdField = overlay.fields.find((f) => f.name === 'graphics_id')
				if (graphicsIdField) {
					variables[`${prefix}_graphics_id`] = graphicsIdField.value
				}
			})
		}

		this.setVariableValues(variables)
	}

	updateCurrentStoryVariables(): void {
		if (!this.config.enableOverlayList) {
			return
		}

		const variables: { [key: string]: string } = {}

		// Story navigation variables
		variables['current_story_id'] = this.currentStoryId
		variables['story_count'] = this.storyList.length.toString()

		const currentIndex = this.storyList.indexOf(this.currentStoryId)
		variables['current_story_index'] = (currentIndex + 1).toString()

		// Current story overlay variables
		const currentStoryOverlays = this.overlayData[this.currentStoryId] || []
		variables['current_story_overlay_count'] = currentStoryOverlays.length.toString()

		// Variables for each overlay in current story (up to 20)
		for (let i = 0; i < 20; i++) {
			const overlay = currentStoryOverlays[i]
			if (overlay) {
				// Split slug into parts
				const slugParts = overlay.slug.split('/')
				variables[`current_overlay_${i}_id`] = overlay.id
				variables[`current_overlay_${i}_description`] = overlay.description
				variables[`current_overlay_${i}_variant`] = overlay.variant
				variables[`current_overlay_${i}_handler`] = overlay.handlerName
				variables[`current_overlay_${i}_slug`] = overlay.slug
				if (slugParts.length > 1) {
					variables[`current_overlay_${i}_overlayType`] = slugParts[0].trim()
					variables[`current_overlay_${i}_overlayName`] = slugParts[1].trim()
				} else {
					// No / found, try splitting on first _
					const underscoreIndex = overlay.slug.indexOf('_')
					if (underscoreIndex > 0) {
						variables[`current_overlay_${i}_overlayType`] = overlay.slug.substring(0, underscoreIndex)
						variables[`current_overlay_${i}_overlayName`] = overlay.slug.substring(underscoreIndex + 1)
					} else {
						variables[`current_overlay_${i}_overlayType`] = ''
						variables[`current_overlay_${i}_overlayName`] = overlay.slug
					}
				}
			} else {
				variables[`current_overlay_${i}_id`] = ''
				variables[`current_overlay_${i}_description`] = ''
				variables[`current_overlay_${i}_variant`] = ''
				variables[`current_overlay_${i}_handler`] = ''
				variables[`current_overlay_${i}_slug`] = ''
				variables[`current_overlay_${i}_overlayType`] = ''
				variables[`current_overlay_${i}_overlayName`] = ''
			}
		}

		this.setVariableValues(variables)
	}

	selectStory(storyId: string): void {
		if (this.storyList.includes(storyId)) {
			this.currentStoryId = storyId
			this.updateCurrentStoryVariables()
			this.logMsg('debug', `Selected story: ${storyId}`)
		}
	}

	nextStory(): void {
		if (this.storyList.length === 0) return

		const currentIndex = this.storyList.indexOf(this.currentStoryId)
		const nextIndex = (currentIndex + 1) % this.storyList.length
		this.currentStoryId = this.storyList[nextIndex]
		this.updateCurrentStoryVariables()
		this.logMsg('debug', `Next story: ${this.currentStoryId}`)
	}

	previousStory(): void {
		if (this.storyList.length === 0) return

		const currentIndex = this.storyList.indexOf(this.currentStoryId)
		const prevIndex = (currentIndex - 1 + this.storyList.length) % this.storyList.length
		this.currentStoryId = this.storyList[prevIndex]
		this.updateCurrentStoryVariables()
		this.logMsg('debug', `Previous story: ${this.currentStoryId}`)
	}
}

runEntrypoint(MosartInstance, UpgradeScripts)
