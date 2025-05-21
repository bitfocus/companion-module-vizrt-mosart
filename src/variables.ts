import type { MosartInstance } from './main.js'

export function UpdateVariableDefinitions(self: MosartInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'serverDescription', name: 'Server Description' },
		{ variableId: 'connectionString', name: 'Connection String' },
	])
}
