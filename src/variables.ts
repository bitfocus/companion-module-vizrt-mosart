import { OverlayGraphic } from './api.js'
import type { MosartInstance } from './main.js'

export function UpdateVariableDefinitions(self: MosartInstance): void {
	const baseVariables = [
		{ variableId: 'state', name: 'State' },
		{ variableId: 'timeline', name: 'Timeline' },
		{ variableId: 'autoTake', name: 'Auto Take' },
		{ variableId: 'rehearsalMode', name: 'Rehearsal Mode' },
		{ variableId: 'crossoverClient', name: 'Crossover Client' },
		{ variableId: 'serverDescription', name: 'Server Description' },
		{ variableId: 'connectionString', name: 'Connection String' },
	]

	// Add overlay-related variables if feature is enabled
	if (self.config.enableOverlayList) {
		// Story navigation variables
		baseVariables.push(
			{ variableId: 'current_story_id', name: 'Current Story ID' },
			{ variableId: 'current_story_index', name: 'Current Story Index' },
			{ variableId: 'story_count', name: 'Total Story Count' },
			{ variableId: 'current_story_overlay_count', name: 'Current Story Overlay Count' },
			{ variableId: 'last_taken_overlay_id', name: 'Last Taken Overlay ID' },
		)

		// Current story overlay variables (up to 20)
		for (let i = 0; i < 20; i++) {
			baseVariables.push(
				{ variableId: `current_overlay_${i}_id`, name: `Current Story Overlay ${i} ID` },
				{ variableId: `current_overlay_${i}_description`, name: `Current Story Overlay ${i} Description` },
				{ variableId: `current_overlay_${i}_variant`, name: `Current Story Overlay ${i} Variant` },
				{ variableId: `current_overlay_${i}_handler`, name: `Current Story Overlay ${i} Handler` },
				{ variableId: `current_overlay_${i}_slug`, name: `Current Story Overlay ${i} Slug` },
				{ variableId: `current_overlay_${i}_overlayType`, name: `Current Story Overlay ${i} Overlay Type` },
				{ variableId: `current_overlay_${i}_overlayName`, name: `Current Story Overlay ${i} Overlay Name` },
			)
		}
		// Add dynamic variables for each story's overlays
		for (const [storyId, overlays] of Object.entries(self.overlayData)) {
			const sanitizedStoryId = storyId.replace(/[^a-zA-Z0-9_]/g, '_')

			baseVariables.push(
				{
					variableId: `overlay_${sanitizedStoryId}_story_index`,
					name: `Story Index for ${storyId}`,
				},
				{
					variableId: `overlay_${sanitizedStoryId}_count`,
					name: `Overlay Count for Story ${storyId}`,
				},
			)

			overlays.forEach((_overlay: OverlayGraphic, index: number) => {
				const prefix = `overlay_${sanitizedStoryId}_${index}`
				baseVariables.push(
					{ variableId: `${prefix}_id`, name: `${storyId} [${index}] ID` },
					{ variableId: `${prefix}_type`, name: `${storyId} [${index}] Type` },
					{ variableId: `${prefix}_variant`, name: `${storyId} [${index}] Variant` },
					{ variableId: `${prefix}_slug`, name: `${storyId} [${index}] Slug` },
					{ variableId: `${prefix}_handler`, name: `${storyId} [${index}] Handler` },
					{ variableId: `${prefix}_description`, name: `${storyId} [${index}] Description` },
					{ variableId: `${prefix}_in`, name: `${storyId} [${index}] In` },
					{ variableId: `${prefix}_duration`, name: `${storyId} [${index}] Duration` },
					{ variableId: `${prefix}_graphics_id`, name: `${storyId} [${index}] Graphics ID` },
					{ variableId: `${prefix}_overlayType`, name: `${storyId} [${index}] Overlay Type` },
					{ variableId: `${prefix}_overlayName`, name: `${storyId} [${index}] Overlay Name` },
				)
			})
		}
	}

	self.setVariableDefinitions(baseVariables)
}
