import { z } from 'zod'

export const ConfigBoundary = z.object({
    pin: z.string().regex(new RegExp('^\\d{3}-\\d{2}-\\d{3}$')).describe('Homebridge PIN for service authentication'),
    debug: z.boolean().default(false),
    prefix: z.string().default('homebridge'),
    port: z.number().int().describe('TCP port for the prometheus probe server to listen to').default(36123),
    refresh_interval: z.number().int().describe('Discover new services every <interval> seconds').default(60),
    request_timeout: z
        .number()
        .int()
        .describe('Request timeout when interacting with homebridge instances')
        .default(10),
    discovery_timeout: z
        .number()
        .int()
        .describe('Discovery timeout after which the current discovery is considered failed')
        .default(20),
})
