import { API, Logger, PlatformConfig, IndependentPlatformPlugin } from 'homebridge'

import { Metric, aggregate } from './metrics'
import { discover } from './discovery/hap_node_js_client'
import { serve } from './http/fastify'
import { HttpServerController } from './http/api'

export class PrometheusExporterPlatform implements IndependentPlatformPlugin {
    private metrics: Metric[] = []
    private metricsDiscovered = false
    private http: HttpServerController | undefined = undefined

    constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
        this.log.debug('Initializing platform %s', this.config.platform)

        this.configure()

        this.api.on('shutdown', () => {
            this.log.debug('Shutting down %s', this.config.platform)
            if (this.http) {
                this.http.shutdown()
            }
        })

        this.startHttpServer()

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

    private startHttpServer(): void {
        this.log.debug('Starting probe HTTP server on port %d', this.config.probe_port)

        const contentTypeHeader = { 'Content-Type': 'text/plain; charset=UTF-8' }
        serve({
            port: this.config.probe_port,
            logger: this.log,
            requestInterceptor: () => {
                if (!this.metricsDiscovered) {
                    return {
                        statusCode: 503,
                        headers: { ...contentTypeHeader, 'Retry-After': '10' },
                        body: 'Discovery pending',
                    }
                }
            },
            probeController: () => {
                const prefix = 'homebridge_'
                const metrics = this.metrics
                    .map((metric) => [
                        `# TYPE ${prefix}${metric.name} gauge`,
                        `${prefix}${metric.name}{${Object.entries(metric.labels)
                            .map(([key, value]) => `${key}="${value}"`)
                            .join(',')}} ${metric.value}`,
                    ])
                    .flat()
                    .join('\n')

                return {
                    statusCode: 200,
                    headers: contentTypeHeader,
                    body: metrics,
                }
            },
            notFoundController: () => ({
                statusCode: 404,
                headers: contentTypeHeader,
                body: 'Not found. Try /probe',
            }),
            errorController: () => ({
                statusCode: 500,
                headers: contentTypeHeader,
                body: 'Server error',
            }),
        })
            .then((http) => {
                this.log.debug('HTTP server started on port %d', this.config.probe_port)
                this.http = http
            })
            .catch((e) => {
                this.log.error('Failed to start probe HTTP server on port %d: %o', this.config.probe_port, e)
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
                this.metrics = aggregate(devices)
                this.metricsDiscovered = true
                this.log.debug('HAP discovery completed, %d metrics discovered', this.metrics.length)
                this.startHapDiscovery()
            })
            .catch((e) => {
                this.log.error('HAP discovery error', e)
            })
    }
}
