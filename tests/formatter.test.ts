import { describe, expect, test } from '@jest/globals'
import { formatName } from '../src/metrics'

describe('Metrics formatter', () => {
    test('Converts to snake case', () => {
        expect(formatName('Service', 'Metric')).toEqual('service_metric')
    })
    test('Handles camel case', () => {
        expect(formatName('YetAnotherService', 'Some Metric')).toEqual('yet_another_service_some_metric')
    })

    test('Strips duplicate prefixes', () => {
        expect(formatName('Some Service', 'Some Service Metric')).toEqual('some_service_metric')
        expect(formatName('Some Service', 'SomeServiceMetric')).toEqual('some_service_metric')
        expect(formatName('SomeService', 'SomeServiceMetric')).toEqual('some_service_metric')
        expect(formatName('SomeService', 'Some Service Metric')).toEqual('some_service_metric')
    })
})
