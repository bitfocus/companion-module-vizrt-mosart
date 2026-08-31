import type { DropdownChoice, LogLevel as CompanionLogLevel } from '@companion-module/base'

/** Verbosity threshold chosen in the module config. 'off' silences everything. */
export type LogLevel = 'off' | CompanionLogLevel

/** Severity of an individual message. 'off' is a threshold only, never a message severity. */
export type MessageLevel = CompanionLogLevel

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
	off: 0,
	error: 1,
	warn: 2,
	info: 3,
	debug: 4,
}

export const DEFAULT_LOG_LEVEL: LogLevel = 'warn'

export const LOG_LEVEL_CHOICES: DropdownChoice[] = [
	{ id: 'off', label: 'Off - no logging' },
	{ id: 'error', label: 'Error - failures only' },
	{ id: 'warn', label: 'Warning - failures and warnings (default)' },
	{ id: 'info', label: 'Info - adds lifecycle and state changes' },
	{ id: 'debug', label: 'Debug - adds every API request and poll response' },
]

export function shouldLog(configured: LogLevel | undefined, message: MessageLevel): boolean {
	const threshold = LOG_LEVEL_RANK[configured ?? DEFAULT_LOG_LEVEL] ?? LOG_LEVEL_RANK[DEFAULT_LOG_LEVEL]
	return LOG_LEVEL_RANK[message] <= threshold
}
