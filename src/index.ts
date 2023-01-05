import type { HomebridgeApi } from './adapters/homebridge/types'

import { PLATFORM_NAME } from './settings'
import { PrometheusExporterPlatform } from './platform'

export = (api: Pick<HomebridgeApi, 'registerPlatform'>): void => {
    api.registerPlatform(PLATFORM_NAME, PrometheusExporterPlatform)
}
