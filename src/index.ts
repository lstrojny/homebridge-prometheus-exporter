import type { API } from 'homebridge'

import { PLATFORM_NAME } from './settings'
import { PrometheusExporterPlatform } from './platform'

export = (api: Readonly<Pick<API, 'registerPlatform'>>): void => {
    api.registerPlatform(PLATFORM_NAME, PrometheusExporterPlatform)
}
