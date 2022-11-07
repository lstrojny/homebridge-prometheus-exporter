import { API, IndependentPlatformPlugin, Logger, PlatformConfig } from 'homebridge'

import { aggregate } from './metrics'
import { discover } from './adapters/discovery/hap_node_js_client'
import { serve } from './adapters/http/fastify'
import { HttpServerController } from './adapters/http/api'
import { PrometheusServer } from './prometheus'

export class PrometheusExporterPlatform implements IndependentPlatformPlugin {
    private readonly httpServer: PrometheusServer
    private httpServerController: HttpServerController | undefined = undefined

    constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
        this.log.debug('Initializing platform %s', this.config.platform)

        this.configure()

        this.api.on('shutdown', () => {
            this.log.debug('Shutting down %s', this.config.platform)
            if (this.httpServerController) {
                this.httpServerController.shutdown()
            }
        })

        this.log.debug('Starting probe HTTP server on port %d', this.config.probe_port)

        this.httpServer = new PrometheusServer(this.config.probe_port, this.log, this.config.debug)
        serve(this.httpServer)
            .then((httpServerController) => {
                this.log.debug('HTTP server started on port %d', this.config.probe_port)
                this.httpServerController = httpServerController
            })
            .catch((e) => {
                this.log.error('Failed to start probe HTTP server on port %d: %o', this.config.probe_port, e)
            })

        this.api.on('didFinishLaunching', () => {
            this.log.debug('Finished launching %s', this.config.platform)
            this.startHapDiscovery()
        })
    }

    private configure(): void {
        if (this.config.pin !== 'string' || !this.config.pin.match(/^\d{3}-\d{2}-\d{3}$/)) {
            this.log.error('"pin" must be defined in config and match format 000-00-000')
        }

        this.config.debug = this.config.debug ?? false
        this.config.probe_port = this.config.probe_port ?? 36123
        this.config.refresh_interval = this.config.refresh_interval || 60
        this.config.request_timeout = this.config.request_timeout || 10
        this.config.discovery_timeout = this.config.discovery_timeout || 20

        this.log.debug('Configuration materialized: %o', this.config)
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
