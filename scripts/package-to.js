#!/usr/bin/env node
// Simple script that runs the standard companion-module-build and moves output to a custom location

import { fs } from 'zx'
import { readFileSync } from 'fs'
import 'zx/globals'

function builtArchiveName() {
	const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
	const { id } = JSON.parse(readFileSync('companion/manifest.json', 'utf8'))
	return `${id}-${version}.tgz`
}

if (process.platform === 'win32') {
	usePowerShell() // to enable powershell
}

// Parse command line arguments
const targetDir = argv._[0] || argv.target || argv.t

if (!targetDir) {
	console.error('Usage: node scripts/package-to.js <target-directory>')
	console.error('')
	console.error('Examples:')
	console.error('  yarn package:to my-build')
	console.error('  yarn package:to release')
	process.exit(1)
}

console.log(`Packaging to: ${targetDir}`)

try {
	// Run the standard build process
	console.log('Running standard companion-module-build...')
	await $`yarn build`
	await $`companion-module-build`

	const builtTgz = builtArchiveName()

	// Check if build was successful (companion-module-build writes pkg/ and {manifest-id}-{version}.tgz)
	if (!fs.existsSync('pkg')) {
		console.error('Build failed - pkg/ not found')
		process.exit(1)
	}
	if (!fs.existsSync(builtTgz)) {
		console.error(`Build failed - ${builtTgz} not found`)
		process.exit(1)
	}

	console.log('Build completed successfully')

	// Clean target directory if it exists
	if (fs.existsSync(targetDir)) {
		console.log(`Cleaning existing ${targetDir}/`)
		await fs.remove(targetDir)
	}

	// Move the pkg directory
	console.log(`Moving pkg/ to ${targetDir}/`)
	await fs.move('pkg', targetDir)

	// Move the tgz file
	const targetTgz = `${targetDir}.tgz`
	console.log(`Moving ${builtTgz} to ${targetTgz}`)
	if (fs.existsSync(targetTgz)) {
		await fs.remove(targetTgz)
	}
	await fs.move(builtTgz, targetTgz)

	console.log('')
	console.log('✅ Package completed successfully!')
	console.log(`📁 Directory: ${targetDir}/`)
	console.log(`📦 Archive: ${targetTgz}`)
} catch (error) {
	console.error('❌ Package failed:', error.message)
	process.exit(1)
}
