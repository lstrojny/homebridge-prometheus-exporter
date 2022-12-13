import { describe, test } from '@jest/globals'
import request from 'supertest'
import { PrometheusServer } from '../../../src/prometheus'
import { type HttpServer, fastifyServe } from '../../../src/adapters/http'
import { type Server, createServer } from 'http'
import { Metric } from '../../../src/metrics'

class TestablePrometheusServer extends PrometheusServer {
    public serverFactory: HttpServer['serverFactory']
}

function createTestServer(): { http: Server; prometheus: HttpServer } {
    return createTestServerWithBasicAuth({})
}

function createTestServerWithBasicAuth(basicAuth: Readonly<Record<string, string>>): {
    http: Server
    prometheus: HttpServer
} {
    const http = createServer()
    const prometheus = new TestablePrometheusServer({
        port: 0,
        interface: 'localhost',
        debug: false,
        prefix: 'homebridge',
        basic_auth: basicAuth,
    })
    prometheus.serverFactory = (handler) => http.on('request', handler)
    fastifyServe(prometheus).catch((err: Readonly<Error>) => {
        if (!('code' in err) || (err as unknown as { code: unknown }).code !== 'ERR_SERVER_ALREADY_LISTEN') {
            console.debug(err)
        }
    })

    return { http, prometheus }
}

const secretAsBcrypt = '$2b$12$B8C9hsi2idheYOdSM9au0.6DbD6z44iI5dZo.72AYLsAEiNdnqNPG'

describe('Fastify HTTP adapter', () => {
    test('Serves 503 everywhere while metrics are not available', () => {
        return request(createTestServer().http)
            .get('/any-url')
            .expect(503)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect('Retry-After', '15')
            .expect('Metrics discovery pending')
    })

    test('Serves 404 on / when metrics are available', () => {
        const testServer = createTestServer()
        testServer.prometheus.onMetricsDiscovery([])

        return request(testServer.http)
            .get('/')
            .expect(404)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect('Not found. Try /metrics')
    })

    test('Serves metrics', () => {
        const testServer = createTestServer()
        const timestamp = new Date('2020-01-01 00:00:00 UTC')
        testServer.prometheus.onMetricsDiscovery([
            new Metric('metric', 0.1, timestamp, { name: 'metric' }),
            new Metric('total_something', 100, timestamp, { name: 'counter' }),
        ])

        return request(testServer.http)
            .get('/metrics')
            .expect(200)
            .expect('Content-Type', 'text/plain; charset=utf-8; version=0.0.4')
            .expect(
                [
                    '# TYPE homebridge_metric gauge',
                    'homebridge_metric{name="metric"} 0.1 1577836800000',
                    '# TYPE homebridge_something_total counter',
                    'homebridge_something_total{name="counter"} 100 1577836800000',
                ].join('\n'),
            )
    })

    test('Basic auth denied without user', () => {
        const testServer = createTestServerWithBasicAuth({ joanna: secretAsBcrypt })
        testServer.prometheus.onMetricsDiscovery([])

        return request(testServer.http)
            .get('/metrics')
            .expect(401)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect('Missing or bad formatted authorization header')
    })

    test('Basic auth denied with incorrect user', () => {
        const testServer = createTestServerWithBasicAuth({ joanna: secretAsBcrypt })
        testServer.prometheus.onMetricsDiscovery([])

        return request(testServer.http)
            .get('/metrics')
            .auth('john', 'secret')
            .expect(401)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect('Unauthorized')
    })

    test('Basic auth grants access', () => {
        const testServer = createTestServerWithBasicAuth({ joanna: secretAsBcrypt })
        const timestamp = new Date('2020-01-01 00:00:00 UTC')
        testServer.prometheus.onMetricsDiscovery([
            new Metric('metric', 0.1, timestamp, { name: 'metric' }),
            new Metric('total_something', 100, timestamp, { name: 'counter' }),
        ])

        return request(testServer.http)
            .get('/metrics')
            .auth('joanna', 'secret')
            .expect(200)
            .expect('Content-Type', 'text/plain; charset=utf-8; version=0.0.4')
            .expect(
                [
                    '# TYPE homebridge_metric gauge',
                    'homebridge_metric{name="metric"} 0.1 1577836800000',
                    '# TYPE homebridge_something_total counter',
                    'homebridge_something_total{name="counter"} 100 1577836800000',
                ].join('\n'),
            )
    })
})
