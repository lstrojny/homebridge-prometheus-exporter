import Fastify, { FastifyBaseLogger, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import { HttpResponse, HttpServer } from './api'
import { Logger } from 'homebridge'
import { Bindings, ChildLoggerOptions } from 'fastify/types/logger'
import { LogFn } from 'pino'

/*class PinoLoggerBridge implements FastifyBaseLogger {

    constructor(private readonly logger: Logger) {
    }

    child(bindings: Bindings, options: ChildLoggerOptions | undefined): FastifyBaseLogger {
        return this
    }

    debug(m: string|unknown, ...args: unknown[]) {
        this.logger.debug(typeof m === 'string' ? m : JSON.stringify(m), ...args)
    }

    error: LogFn;
    fatal: pino.LogFn;
    info: pino.LogFn;
    level: pino.LevelWithSilent | string;
    silent: pino.LogFn;
    trace: pino.LogFn;
    warn: pino.LogFn;
}*/

function adaptResponseToReply(response: HttpResponse, reply: FastifyReply): void {
    if (response.statusCode) {
        reply.code(response.statusCode)
    }
    if (response.body) {
        reply.send(response.body)
    }

    if (response.headers) {
        reply.headers(response.headers)
    }
}

export const serve: HttpServer = async ({
    port,
    requestInterceptor,
    probeController,
    notFoundController,
    errorController,
}) => {
    const fastify = Fastify({
        // logger
    })

    fastify.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) => {
        const response = requestInterceptor()

        if (response) {
            adaptResponseToReply(response, reply)
        }

        next()
    })

    fastify.setErrorHandler(async (error, request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(errorController(), reply)
    })

    fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(notFoundController(), reply)
    })

    fastify.get('/probe', async (request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(probeController(), reply)
    })

    await fastify.listen({ port, host: '::' })

    return {
        shutdown() {
            fastify.close()
        },
    }
}
