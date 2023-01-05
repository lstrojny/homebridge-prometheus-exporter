import type { IndependentPlatformPlugin } from 'homebridge'
import type { HomebridgeApi, HomebridgeLogger, HomebridgePlatformConfig } from './adapters/homebridge/types'

import { aggregate } from './metrics'
import { hapNodeJsClientDiscover as discover } from './adapters/discovery'
import { type HttpServerController, fastifyServe as serve } from './adapters/http'
import { PrometheusServer } from './prometheus'
import { type Config, ConfigBoundary, checkBoundary } from './boundaries'

export class PrometheusExporterPlatform implements IndependentPlatformPlugin {
    private readonly httpServer: PrometheusServer
    private httpServerController: HttpServerController | null = null
    private readonly config: Config

    public constructor(
        public readonly log: HomebridgeLogger,
        config: HomebridgePlatformConfig,
        public readonly api: Pick<HomebridgeApi, 'on'>,
    ) {
        this.log.debug('Initializing platform %s', config.platform)

        this.config = checkBoundary(ConfigBoundary, config)

        this.log.debug('Configuration parsed', this.config)

        this.api.on('shutdown', () => {
            this.log.debug('Shutting down %s', config.platform)
            if (this.httpServerController) {
                this.httpServerController.shutdown()
            }
        })

        this.log.debug('Starting Prometheus HTTP server on port %d', this.config.port)

        this.httpServer = new PrometheusServer(this.config, this.log)
        serve(this.httpServer)
            .then((httpServerController: HttpServerController) => {
                this.log.debug('HTTP server started on port %d', this.config.port)
                this.httpServerController = httpServerController
            })
            .catch((e) => {
                this.log.error('Failed to start Prometheus HTTP server on port %d: %o', this.config.port, e)
            })

        this.api.on('didFinishLaunching', () => {
            this.log.debug('Finished launching %s', this.config.platform)
            this.startHapDiscovery()
        })
    }

    private startHapDiscovery(): void {
        this.log.debug('Starting HAP discovery')
        discover({ log: this.log, config: this.config })
            .then((devices) => {
                const metrics = aggregate(devices, new Date())
                this.httpServer.onMetricsDiscovery(metrics)
                this.log.debug('HAP discovery completed, %d metrics discovered', metrics.length)
                this.startHapDiscovery()
            })
            .catch((e) => {
                this.log.error('HAP discovery error', e)
            })
    }
}
