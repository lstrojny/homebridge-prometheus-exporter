import Fastify, {
    type FastifyError as FastifyErrorMutable,
    type FastifyReply as FastifyReplyMutable,
    type FastifyRequest as FastifyRequestMutable,
    type HookHandlerDoneFunction,
} from 'fastify'
import { readFileSync } from 'fs'
import { constants as HttpConstants } from 'http2'
import { isAuthenticated } from '../../security'
import type { DeepReadonly } from '../../std'
import type { HttpAdapter, HttpResponse, HttpServer } from './api'
import fastifyAuth from '@fastify/auth'
import fastifyBasicAuth from '@fastify/basic-auth'

type FastifyRequest = DeepReadonly<FastifyRequestMutable>
type FastifyReply = DeepReadonly<FastifyReplyMutable>
type FastifyError = DeepReadonly<FastifyErrorMutable>

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

type FastifyServer = DeepReadonly<ReturnType<typeof Fastify>>
function createFastify(server: HttpServer): FastifyServer {
    const config = { logger: false }

    if (server.config.tls_cert_file && server.config.tls_key_file) {
        server.log?.debug('Running with TLS enabled')
        return Fastify({
            ...config,
            https: {
                key: readFileSync(server.config.tls_key_file),
                cert: readFileSync(server.config.tls_cert_file),
            },
        })
    }

    return Fastify({
        ...config,
        serverFactory: server.serverFactory,
    })
}

export const fastifyServe: HttpAdapter = async (server: HttpServer) => {
    const fastify = createFastify(server)

    if (server.config.basic_auth && Object.keys(server.config.basic_auth).length > 0) {
        const users = server.config.basic_auth

        const validate = async (username: string, password: string) => {
            if (!(await isAuthenticated(username, password, users))) {
                throw new Error('Unauthorized')
            }
        }

        await fastify.register(fastifyAuth)
        await fastify.register(fastifyBasicAuth, { validate, authenticate: true })

        fastify.after(() => {
            fastify.addHook('preHandler', fastify.auth([fastify.basicAuth]))
        })
    }

    fastify.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply) => {
        if (reply.statusCode >= HttpConstants.HTTP_STATUS_BAD_REQUEST) {
            server.log?.error(formatCombinedLog(request, reply))
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

    fastify.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(server.onError(error), reply)
    })

    fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(server.onNotFound(), reply)
    })

    fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
        adaptResponseToReply(server.onMetrics(), reply)
    })

    await listen(fastify, server.config.port, server.config.interface)

    return {
        shutdown() {
            void fastify.close()
        },
    }
}

async function listen(fastify: FastifyServer, port: number, host: string): Promise<void> {
    try {
        await fastify.listen({ port, host })
    } catch (e: unknown) {
        if (host === '::' && e instanceof Error && (e as Error & { code: string }).code === 'EAFNOSUPPORT') {
            await listen(fastify, port, '0.0.0.0')
        }
    }
}
