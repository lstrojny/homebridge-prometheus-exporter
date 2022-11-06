import { Logger } from 'homebridge'

export type HttpResponse = {
    statusCode: number
    body: string
    headers: Record<string, string>
}

export type HttpServerConfig = {
    port: number
    requestInterceptor: () => HttpResponse | undefined
    probeController: () => HttpResponse
    notFoundController: () => HttpResponse
    errorController: () => HttpResponse
    logger: Logger
}

export type HttpServerController = {
    shutdown(): void
}

export type HttpServer = (config: HttpServerConfig) => Promise<HttpServerController>
