import type { HttpServer } from '../../http'

export interface HttpResponse {
    statusCode?: number
    body?: string
    headers?: Record<string, string>
}

export interface HttpServerController {
    shutdown(): void
}

export type HttpAdapter = (config: HttpServer) => Promise<HttpServerController>
