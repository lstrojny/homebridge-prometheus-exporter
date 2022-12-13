import type { RequestListener, Server } from 'http'
import type { Config } from '../../boundaries'
import type { Metric } from '../../metrics'
import type { Immutable, ImmutableError } from '../../std'
import type { HomebridgeLogger } from '../homebridge/types'

export type HttpResponse = Immutable<{
    statusCode?: number
    body?: string
    headers?: Immutable<Record<string, string>>
}>

export type HttpServerController = Immutable<{
    shutdown(): void
}>

export type HttpAdapter = (config: HttpServer) => Promise<HttpServerController>

export type HttpConfig = Pick<
    Config,
    'debug' | 'port' | 'interface' | 'prefix' | 'basic_auth' | 'tls_cert_file' | 'tls_key_file'
>

export type HttpServer = Immutable<{
    log: HomebridgeLogger | null
    config: HttpConfig
    serverFactory?: (requestListener: RequestListener) => Server
    onRequest(): HttpResponse | null
    onMetrics(): HttpResponse
    onNotFound(): HttpResponse
    onError(error: ImmutableError): HttpResponse
    onMetricsDiscovery(metrics: Immutable<Metric[]>): void
}>
