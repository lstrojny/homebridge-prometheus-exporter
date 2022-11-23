import type { Config, Device } from '../../boundaries'
import type { Logger } from 'homebridge'

export interface HapDiscoveryConfig {
    config: Pick<Config, 'debug' | 'pin' | 'refresh_interval' | 'discovery_timeout' | 'request_timeout'>
    log?: Logger
}

export type HapDiscover = (config: HapDiscoveryConfig) => Promise<Device[]>
