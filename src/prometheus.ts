import type { Logger } from 'homebridge'
import type { HttpConfig, HttpResponse, HttpServer } from './adapters/http'
import type { Metric } from './metrics'
import { strTrimRight } from './std'

export class MetricsRenderer {
    private readonly prefix: string

    public constructor(prefix: string) {
        this.prefix = strTrimRight(prefix, '_')
    }

    public render(metric: Metric): string {
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
            .map(
                ([label, val]: Readonly<[string, string]>) =>
                    `${sanitizePrometheusMetricName(label)}="${escapeAttributeValue(val)}"`,
            )
            .join(',')

        return rendered !== '' ? '{' + rendered + '}' : ''
    }

    private metricName(name: string): string {
        name = name.replace(/^(.*_)?(total)_(.*)$/, '$1$3_$2')

        return sanitizePrometheusMetricName(`${this.prefix}_${name}`)
    }
}

const retryAfterWhileDiscovery = 15
const textContentType = 'text/plain; charset=utf-8'
const prometheusSpecVersion = '0.0.4'
const metricsContentType = `${textContentType}; version=${prometheusSpecVersion}`

function withHeaders(contentType: string, headers: Readonly<Record<string, string>> = {}): Record<string, string> {
    return { ...headers, 'Content-Type': contentType }
}

export class PrometheusServer implements HttpServer {
    private metricsDiscovered = false
    private metricsResponse = ''

    public constructor(
        public readonly config: HttpConfig,
        public readonly log: Readonly<Logger> | null = null,
        private readonly renderer: Readonly<MetricsRenderer> = new MetricsRenderer(config.prefix),
    ) {}

    public onRequest(): HttpResponse | null {
        if (this.metricsDiscovered) {
            return null
        }

        return {
            statusCode: 503,
            headers: withHeaders(textContentType, { 'Retry-After': String(retryAfterWhileDiscovery) }),
            body: 'Metrics discovery pending',
        }
    }

    public onMetrics(): HttpResponse {
        return {
            statusCode: 200,
            headers: withHeaders(metricsContentType),
            body: this.metricsResponse,
        }
    }

    public onNotFound(): HttpResponse {
        return {
            statusCode: 404,
            headers: withHeaders(textContentType),
            body: 'Not found. Try /metrics',
        }
    }

    public onError(error: Readonly<Error>): HttpResponse {
        this.log?.error('HTTP request error: %o', error)
        return {
            headers: withHeaders(textContentType),
            body: error.message,
        }
    }

    public onMetricsDiscovery(metrics: ReadonlyArray<Metric>): void {
        this.metricsResponse = metrics.map((metric) => this.renderer.render(metric)).join('\n')
        this.metricsDiscovered = true
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
function escapeAttributeValue(str: Metric['labels'][keyof Metric['labels']]) {
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
