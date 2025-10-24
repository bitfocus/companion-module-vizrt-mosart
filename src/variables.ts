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

	self.setVariableDefinitions(baseVariables)
}
