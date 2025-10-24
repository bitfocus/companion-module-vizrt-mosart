import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresetDefinitions } from './presets.js'
import { MosartAPI } from './api.js'

export class MosartInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	mosartAPI!: MosartAPI
	pollInterval: NodeJS.Timeout | undefined
	isBackup: boolean
	private lastConnectionString?: string

	constructor(internal: unknown) {
		super(internal)
		this.pollInterval = undefined
		this.isBackup = false
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
}

runEntrypoint(MosartInstance, UpgradeScripts)
