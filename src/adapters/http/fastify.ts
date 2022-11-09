import Fastify, { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import { HttpAdapter, HttpResponse } from './api'
import { HttpServer } from '../../http'

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

export const serve: HttpAdapter = async (server: HttpServer) => {
    const fastify = Fastify({
        logger: server.debug,
        serverFactory: server.serverFactory,
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

    await fastify.listen({ port: server.port, host: '::' })

    return {
        shutdown() {
            void fastify.close()
        },
    }
}
