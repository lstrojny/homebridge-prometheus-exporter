import { Logger } from 'homebridge'

export type HttpResponse = {
    statusCode: number
    body: string
    headers: Record<string, string>
}

export type HttpServerConfig = {
    port: number
    requestInterceptor: () => HttpResponse | undefined
    metricsController: () => HttpResponse
    notFoundController: () => HttpResponse
    errorController: (error: unknown) => HttpResponse
    logger: Logger
}

export type HttpServerController = {
    shutdown(): void
}

export type HttpServer = (config: HttpServerConfig) => Promise<HttpServerController>
