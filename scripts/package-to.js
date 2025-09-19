#!/usr/bin/env node
// Simple script that runs the standard companion-module-build and moves output to a custom location

import { fs } from 'zx'
import path from 'path'
import 'zx/globals'

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

	// Check if build was successful
	if (!fs.existsSync('pkg') || !fs.existsSync('pkg.tgz')) {
		console.error('Build failed - pkg/ or pkg.tgz not found')
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
	console.log(`Moving pkg.tgz to ${targetTgz}`)
	if (fs.existsSync(targetTgz)) {
		await fs.remove(targetTgz)
	}
	await fs.move('pkg.tgz', targetTgz)

	console.log('')
	console.log('✅ Package completed successfully!')
	console.log(`📁 Directory: ${targetDir}/`)
	console.log(`📦 Archive: ${targetTgz}`)
} catch (error) {
	console.error('❌ Package failed:', error.message)
	process.exit(1)
}
