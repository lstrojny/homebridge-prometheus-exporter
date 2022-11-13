import type { API, IndependentPlatformPlugin, Logger, PlatformConfig } from 'homebridge'

import { aggregate } from './metrics'
import { discover } from './adapters/discovery/hap_node_js_client'
import { serve } from './adapters/http/fastify'
import type { HttpServerController } from './adapters/http/api'
import { PrometheusServer } from './prometheus'
import { type Config, ConfigBoundary, checkBoundary } from './boundaries'

export class PrometheusExporterPlatform implements IndependentPlatformPlugin {
    private readonly httpServer: PrometheusServer
    private httpServerController: HttpServerController | undefined = undefined
    private readonly config: Config

    constructor(public readonly log: Logger, config: PlatformConfig, public readonly api: API) {
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

        this.httpServer = new PrometheusServer(this.config.port, this.log, this.config.debug, this.config.prefix)
        serve(this.httpServer)
            .then((httpServerController) => {
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
        discover({
            logger: this.log,
            refreshInterval: this.config.refresh_interval,
            discoveryTimeout: this.config.discovery_timeout,
            requestTimeout: this.config.request_timeout,
            pin: this.config.pin,
            debug: this.config.debug,
        })
            .then((devices) => {
                const metrics = aggregate(devices, new Date())
                this.httpServer.updateMetrics(metrics)
                this.log.debug('HAP discovery completed, %d metrics discovered', metrics.length)
                this.startHapDiscovery()
            })
            .catch((e) => {
                this.log.error('HAP discovery error', e)
            })
    }
}
