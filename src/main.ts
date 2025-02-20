import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresetDefinitions } from './presets.js'
import { MosartAPI } from './api.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	mosartAPI!: MosartAPI
	pollInterval: NodeJS.Timeout | undefined

	constructor(internal: unknown) {
		super(internal)
		this.pollInterval = undefined
	}

	async init(config: ModuleConfig): Promise<void> {
		this.updateStatus(InstanceStatus.Connecting)

		// Create MosartAPI instance first
		this.mosartAPI = new MosartAPI(this)
		console.log('MosartAPI initialized')

		// Then update config
		await this.configUpdated(config)
		console.log('Config updated')

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresetDefinitions()

		console.log('Starting polling')
		await this.startPolling()

		this.updateStatus(InstanceStatus.Ok)
	}

	private async startPolling(): Promise<void> {
		// Clear any existing interval
		if (this.pollInterval !== undefined) {
			clearInterval(this.pollInterval)
		}

		this.pollInterval = setInterval(() => {
			if (this.mosartAPI) {
				// Only poll if API exists
				void this.mosartAPI.statusPoll().catch((err) => {
					console.error('Error in poll interval:', err)
					this.updateStatus(InstanceStatus.ConnectionFailure)
				})
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
		return
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		try {
			await this.mosartAPI?.configure()
			await this.startPolling() // Restart polling with new config
			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			console.error('Error configuring API:', err)
			this.updateStatus(InstanceStatus.ConnectionFailure)
		}
		return
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

runEntrypoint(ModuleInstance, UpgradeScripts)
