import fs from 'fs'

let src = fs.readFileSync('src/presetGroups.ts', 'utf8')
for (const [key, file] of [
	['camera', 'assets/cam-01.png'],
	['external', 'assets/ext-01.png'],
]) {
	const url = `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`
	src = src.replace(new RegExp(`${key}:\\s*\\n\\t\\t'[^']+'`), `${key}:\n\t\t'${url}'`)
}
fs.writeFileSync('src/presetGroups.ts', src)
console.log('Updated preset icons in presetGroups.ts')
