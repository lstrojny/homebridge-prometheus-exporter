import type { Logger } from 'homebridge'
import type { RequestListener, Server } from 'http'
import type { Config } from '../../boundaries'
import type { Metric } from '../../metrics'

export type HttpResponse = Readonly<{
    statusCode?: number
    body?: string
    headers?: Readonly<Record<string, string>>
}>

export type HttpServerController = Readonly<{
    shutdown(): void
}>

export type HttpAdapter = (config: HttpServer) => Promise<HttpServerController>

export type HttpConfig = Readonly<
    Pick<Config, 'debug' | 'port' | 'interface' | 'prefix' | 'basic_auth' | 'tls_cert_file' | 'tls_key_file'>
>

export type HttpServer = Readonly<{
    log: Readonly<Logger> | null
    config: HttpConfig
    serverFactory?: (requestListener: RequestListener) => Server
    onRequest(): HttpResponse | null
    onMetrics(): HttpResponse
    onNotFound(): HttpResponse
    onError(error: Readonly<Error>): HttpResponse
    onMetricsDiscovery(metrics: ReadonlyArray<Metric>): void
}>
