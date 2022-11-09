import { HttpResponse } from './adapters/http/api'
import { Metric } from './metrics'
import { Logger } from 'homebridge'
import { RequestListener, Server } from 'http'

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
