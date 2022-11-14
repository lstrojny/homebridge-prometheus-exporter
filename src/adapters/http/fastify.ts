import Fastify, { type FastifyReply, type FastifyRequest, type HookHandlerDoneFunction } from 'fastify'
import type { HttpAdapter, HttpResponse, HttpServer } from './api'

function adaptResponseToReply(response: HttpResponse, reply: FastifyReply): void {
    if (response.statusCode) {
        void reply.code(response.statusCode)
    }

    if (response.headers) {
        void reply.headers(response.headers)
    }

    if (response.body) {
        void reply.send(response.body)
    }
}

function formatCombinedLog(request: FastifyRequest, reply: FastifyReply): string {
    const remoteAddress = [request.socket.remoteAddress, request.socket.remotePort].filter((v) => v != null).join(':')
    const userAgent = request.headers['user-agent'] || ''
    const contentType = request.headers['content-type'] || ''
    return `${remoteAddress} - "${request.method} ${request.url} HTTP/${request.raw.httpVersion}" ${reply.statusCode} "${request.protocol}://${request.hostname}" "${userAgent}" "${contentType}"`
}

export const fastifyServe: HttpAdapter = async (server: HttpServer) => {
    const fastify = Fastify({
        logger: false,
        serverFactory: server.serverFactory,
    })

    fastify.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply) => {
        if (reply.statusCode >= 400) {
            server.log?.warn(formatCombinedLog(request, reply))
        } else if (server.config.debug) {
            server.log?.debug(formatCombinedLog(request, reply))
        }
    })

    fastify.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) => {
        const response = server.onRequest()

        if (response) {
            adaptResponseToReply(response, reply)
        }

        next()
    })

    fastify.setErrorHandler(async (error, request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(server.onError(error), reply)
    })

    fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(server.onNotFound(), reply)
    })

    fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(server.onMetrics(), reply)
    })

    await fastify.listen({ port: server.config.port, host: '::' })

    return {
        shutdown() {
            void fastify.close()
        },
    }
}
