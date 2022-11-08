import type { Device } from '../../boundaries/hap'
import { Logger } from 'homebridge'

type Pin = string

export interface HapConfig {
    pin: Pin
    refreshInterval: number
    discoveryTimeout: number
    requestTimeout: number
    logger: Logger
    debug: boolean
}
export type HapDiscover = (config: HapConfig) => Promise<Device[]>
