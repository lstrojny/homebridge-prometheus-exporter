#!/usr/bin/env node
const hap = require('hap-nodejs')
const { format } = require('prettier')
const prettierConfig = require('../prettier.config')
const { writeFileSync } = require('fs')
const { join, basename } = require('path')

const uuidToServiceMap = {}
const serviceToUuidMap = {}
const file = join(__dirname, '../src/generated/services.ts')

console.log(`Starting code generation for ${file}`)

for (const [name, service] of Object.entries(hap.Service)) {
    if (typeof service !== 'function' || typeof service.UUID !== 'string') {
        console.log(`Skipping ${typeof service} ${name}`)
        continue
    }

    uuidToServiceMap[service.UUID] = name
    serviceToUuidMap[name] = service.UUID
}

const code = format(
    `
// Auto-generated by "${join(basename(__dirname), basename(__filename))}", don’t manually edit
export const Uuids: Record<string,string> = ${JSON.stringify(uuidToServiceMap)} as const

export const Services: Record<string,string> = ${JSON.stringify(serviceToUuidMap)} as const
`,
    { filepath: 'codegen.ts', ...prettierConfig },
)

writeFileSync(file, code)

console.log(`Finished code generation for ${file}`)