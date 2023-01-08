import { describe, expect, test } from '@jest/globals'
import { MetricsRenderer } from '../src/prometheus'
import { Metric } from '../src/metrics'

describe('Render prometheus metrics', () => {
    const renderer = new MetricsRenderer('prefix')

    test('Renders simple metric', () => {
        expect(renderer.render([new Metric('metric', 0.000001)])).toEqual(
            `# TYPE prefix_metric gauge
prefix_metric 0.000001`,
        )
    })

    test('Renders simple metric with timestamp', () => {
        expect(renderer.render([new Metric('metric', 0.000001, new Date('2000-01-01 00:00:00 UTC'))])).toEqual(
            `# TYPE prefix_metric gauge
prefix_metric 0.000001 946684800000`,
        )
    })

    test('Renders simple metric with labels', () => {
        expect(
            renderer.render([
                new Metric('metric', 0.000001, new Date('2000-01-01 00:00:00 UTC'), { label: 'Some Label' }),
            ]),
        ).toEqual(
            `# TYPE prefix_metric gauge
prefix_metric{label="Some Label"} 0.000001 946684800000`,
        )
    })

    test('Renders total as counter', () => {
        for (const metricName of ['some_total_metric', 'some_metric_total', 'total_some_metric']) {
            expect(
                renderer.render([
                    new Metric(metricName, 42, new Date('2000-01-01 00:00:00 UTC'), { label: 'Some Label' }),
                ]),
            ).toEqual(
                `# TYPE prefix_some_metric_total counter
prefix_some_metric_total{label="Some Label"} 42 946684800000`,
            )
        }
    })

    test('Renders multiple metrics correctly', () => {
        expect(
            renderer.render([
                new Metric('some_gauge', 10, new Date('2000-01-01 00:00:00 UTC')),
                new Metric('another_gauge', 30, new Date('2000-01-01 00:00:00 UTC')),
                new Metric('some_gauge', 20, new Date('2000-01-01 00:00:00 UTC')),
            ]),
        ).toEqual(
            `# TYPE prefix_some_gauge gauge
prefix_some_gauge 10 946684800000
prefix_some_gauge 20 946684800000

# TYPE prefix_another_gauge gauge
prefix_another_gauge 30 946684800000`,
        )
    })

    test('Sanitizes metric names', () => {
        expect(renderer.render([new Metric('mätric name', 0)])).toEqual(
            `# TYPE prefix_m_tric_name gauge
prefix_m_tric_name 0`,
        )
    })

    test('Sanitizes label names', () => {
        expect(renderer.render([new Metric('metric', 0, null, { 'yet another label': 'foo' })])).toEqual(
            `# TYPE prefix_metric gauge
prefix_metric{yet_another_label="foo"} 0`,
        )
    })

    test('Escapes newlines in attribute value', () => {
        expect(renderer.render([new Metric('metric', 0, null, { label: 'foo\nbar' })])).toEqual(
            `# TYPE prefix_metric gauge
prefix_metric{label="foo\\nbar"} 0`,
        )
    })

    test('Escapes quotes in attribute value', () => {
        expect(renderer.render([new Metric('metric', 0, null, { label: 'foo"bar' })])).toEqual(
            `# TYPE prefix_metric gauge
prefix_metric{label="foo\\"bar"} 0`,
        )
    })
})
