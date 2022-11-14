import type { Logger } from 'homebridge'
import type { RequestListener, Server } from 'http'
import type { Config } from '../../boundaries'
import type { Metric } from '../../metrics'

export interface HttpResponse {
    statusCode?: number
    body?: string
    headers?: Record<string, string>
}

export interface HttpServerController {
    shutdown(): void
}

export type HttpAdapter = (config: HttpServer) => Promise<HttpServerController>

export type HttpConfig = Pick<Config, 'debug' | 'port' | 'prefix'>

export interface HttpServer {
    log?: Logger
    config: HttpConfig
    serverFactory?: (requestListener: RequestListener) => Server
    onRequest(): HttpResponse | undefined
    onMetrics(): HttpResponse
    onNotFound(): HttpResponse
    onError(error: unknown): HttpResponse
    updateMetrics(metrics: Metric[]): void
}
