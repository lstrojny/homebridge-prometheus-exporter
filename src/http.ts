import { HttpResponse } from './adapters/http/api'
import { Metric } from './metrics'
import { Logger } from 'homebridge'

export interface HttpServer {
    port: number
    debug: boolean
    log: Logger
    onRequest(): HttpResponse | undefined
    onMetrics(): HttpResponse
    onNotFound(): HttpResponse
    onError(error: unknown): HttpResponse
    updateMetrics(metrics: Metric[]): void
}
