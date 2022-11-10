import type { HttpResponse } from './adapters/http/api'
import type { Metric } from './metrics'
import type { Logger } from 'homebridge'
import type { RequestListener, Server } from 'http'

export interface HttpServer {
    port: number
    debug: boolean
    log?: Logger
    serverFactory?: (requestListener: RequestListener) => Server
    onRequest(): HttpResponse | undefined
    onMetrics(): HttpResponse
    onNotFound(): HttpResponse
    onError(error: unknown): HttpResponse
    updateMetrics(metrics: Metric[]): void
}
