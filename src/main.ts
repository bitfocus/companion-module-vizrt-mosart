import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresetDefinitions } from './presets.js'
import { MosartAPI, OverlayDataByStory } from './api.js'

export class MosartInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	mosartAPI!: MosartAPI
	pollInterval: NodeJS.Timeout | undefined
	isBackup: boolean
	private lastConnectionString?: string
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

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		// Create MosartAPI instance first
		this.mosartAPI = new MosartAPI(this)
		console.log('MosartAPI initialized')

		try {
			await this.configUpdated(config)

			console.log('Config updated and connected')

			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableDefinitions()
			this.updatePresetDefinitions()

			console.log('Done setting up actions, feedbacks, variables, and presets')

			console.log('Starting polling')
			await this.startPolling()
		} catch (error) {
			console.error('Error updating config:', error)
			//this.updateStatus(InstanceStatus.ConnectionFailure)
			await this.startPolling()

			return
		}
	}

	private async startPolling(): Promise<void> {
		// Clear any existing interval
		if (this.pollInterval !== undefined) {
			clearInterval(this.pollInterval)
		}

		this.pollInterval = setInterval(() => {
			if (this.mosartAPI) {
				if (this.mosartAPI.isConnected()) {
					this.updateStatus(InstanceStatus.Ok)
				} else {
					this.updateStatus(InstanceStatus.Connecting)
				}
				void this.mosartAPI.poll()
			}
		}, this.config.pollInterval ?? 1000)
	}

	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		if (this.pollInterval !== undefined) {
			clearInterval(this.pollInterval)
			this.pollInterval = undefined
		}
		if (this.mosartAPI) {
			await this.mosartAPI.destroy()
		}
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		const newConnectionString = config.connectionString // adjust property name as needed

		if (this.lastConnectionString !== newConnectionString) {
			// Connection string changed, reset connection state
			if (this.mosartAPI) {
				await this.mosartAPI.destroy() // or a specific disconnect/reset method
			}
			this.mosartAPI = new MosartAPI(this)
			this.lastConnectionString = newConnectionString

			// Stop and restart polling interval
			this.stopPolling()
			await this.startPolling()
		}

		try {
			await this.mosartAPI?.configure()
			//this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			console.error('Error configuring API:', err)
			this.updateStatus(InstanceStatus.ConnectionFailure)
		}

		// Update presets when config changes (especially enableOverlayList)
		this.updatePresetDefinitions()

		return
	}

	private stopPolling(): void {
		if (this.pollInterval !== undefined) {
			clearInterval(this.pollInterval)
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

		this.log('debug', 'Fetching overlay list...')
		const overlayList = await this.mosartAPI.getOverlayList()

		if (overlayList === null) {
			this.log('warn', 'Failed to fetch overlay list')
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

		this.log(
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
			this.log('debug', `Selected story: ${storyId}`)
		}
	}

	nextStory(): void {
		if (this.storyList.length === 0) return

		const currentIndex = this.storyList.indexOf(this.currentStoryId)
		const nextIndex = (currentIndex + 1) % this.storyList.length
		this.currentStoryId = this.storyList[nextIndex]
		this.updateCurrentStoryVariables()
		this.log('debug', `Next story: ${this.currentStoryId}`)
	}

	previousStory(): void {
		if (this.storyList.length === 0) return

		const currentIndex = this.storyList.indexOf(this.currentStoryId)
		const prevIndex = (currentIndex - 1 + this.storyList.length) % this.storyList.length
		this.currentStoryId = this.storyList[prevIndex]
		this.updateCurrentStoryVariables()
		this.log('debug', `Previous story: ${this.currentStoryId}`)
	}
}

runEntrypoint(MosartInstance, UpgradeScripts)
