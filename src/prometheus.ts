import type { Metric } from './metrics'
import type { Logger } from 'homebridge'
import type { HttpConfig, HttpResponse, HttpServer } from './adapters/http'

export class MetricsRenderer {
    constructor(private readonly prefix: string) {}

    render(metric: Metric): string {
        const name = this.metricName(metric.name)
        return [
            `# TYPE ${name} ${name.endsWith('_total') ? 'counter' : 'gauge'}`,
            `${name}${this.renderLabels(metric.labels)} ${metric.value}${
                metric.timestamp !== null ? ' ' + String(metric.timestamp.getTime()) : ''
            }`,
        ].join('\n')
    }

    private renderLabels(labels: Metric['labels']): string {
        const rendered = Object.entries(labels)
            .map(([key, value]) => `${sanitizePrometheusMetricName(key)}="${escapeAttributeValue(value)}"`)
            .join(',')

        return rendered !== '' ? '{' + rendered + '}' : ''
    }

    private metricName(name: string): string {
        name = name.replace(/^(.*_)?(total)_(.*)$/, '$1$3_$2')

        return sanitizePrometheusMetricName(stringReverse(stringReverse(this.prefix).replace(/^_+/, '')) + '_' + name)
    }
}

function stringReverse(str: string): string {
    return str.split('').reverse().join('')
}

const retryAfterWhileDiscovery = 15
const textContentType = 'text/plain; charset=utf-8'
const prometheusSpecVersion = '0.0.4'
const metricsContentType = `${textContentType}; version=${prometheusSpecVersion}`

function headers(contentType: string, headers: Record<string, string> = {}): Record<string, string> {
    return { ...headers, 'Content-Type': contentType }
}

export class PrometheusServer implements HttpServer {
    private metricsInitialized = false
    private metricsResponse = ''

    constructor(
        public readonly config: HttpConfig,
        public readonly log: Logger | undefined = undefined,
        private readonly renderer: MetricsRenderer = new MetricsRenderer(config.prefix),
    ) {}

    onRequest(): HttpResponse | undefined {
        if (!this.metricsInitialized) {
            return {
                statusCode: 503,
                headers: headers(textContentType, { 'Retry-After': String(retryAfterWhileDiscovery) }),
                body: 'Metrics discovery pending',
            }
        }
    }

    onMetrics(): HttpResponse {
        return {
            statusCode: 200,
            headers: headers(metricsContentType),
            body: this.metricsResponse,
        }
    }

    onNotFound(): HttpResponse {
        return {
            statusCode: 404,
            headers: headers(textContentType),
            body: 'Not found. Try /metrics',
        }
    }

    onError(error: Error): HttpResponse {
        this.log?.error('HTTP request error: %o', error)
        return {
            headers: headers(textContentType),
            body: error.message,
        }
    }

    updateMetrics(metrics: Metric[]): void {
        this.metricsResponse = metrics.map((metric) => this.renderer.render(metric)).join('\n')
        this.metricsInitialized = true
    }
}

// From https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-exporter-prometheus/src/PrometheusSerializer.ts

function escapeString(str: string) {
    return str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
}

/**
 * String Attribute values are converted directly to Prometheus attribute values.
 * Non-string values are represented as JSON-encoded strings.
 *
 * `undefined` is converted to an empty string.
 */
function escapeAttributeValue(str: string) {
    if (typeof str !== 'string') {
        str = JSON.stringify(str)
    }
    return escapeString(str).replace(/"/g, '\\"')
}

const invalidCharacterRegex = /[^a-z0-9_]/gi

/**
 * Ensures metric names are valid Prometheus metric names by removing
 * characters allowed by OpenTelemetry but disallowed by Prometheus.
 *
 * https://prometheus.io/docs/concepts/data_model/#metric-names-and-attributes
 *
 * 1. Names must match `[a-zA-Z_:][a-zA-Z0-9_:]*`
 *
 * 2. Colons are reserved for user defined recording rules.
 * They should not be used by exporters or direct instrumentation.
 *
 * OpenTelemetry metric names are already validated in the Meter when they are created,
 * and they match the format `[a-zA-Z][a-zA-Z0-9_.\-]*` which is very close to a valid
 * prometheus metric name, so we only need to strip characters valid in OpenTelemetry
 * but not valid in prometheus and replace them with '_'.
 *
 * @param name name to be sanitized
 */
function sanitizePrometheusMetricName(name: string): string {
    return name.replace(invalidCharacterRegex, '_') // replace all invalid characters with '_'
}
