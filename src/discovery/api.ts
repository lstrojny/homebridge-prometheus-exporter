import type { Device } from '../boundaries'
import { Logger } from 'homebridge'

type Pin = string

export type HapConfig = {
    pin: Pin
    refreshInterval: number
    discoveryTimeout: number
    requestTimeout: number
    logger: Logger
    debug: boolean
}
export type HapDiscover = (config: HapConfig) => Promise<Device[]>
