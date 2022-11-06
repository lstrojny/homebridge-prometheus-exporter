import { describe, expect, test } from '@jest/globals'
import { DeviceBoundary } from '../src/boundaries'
import { Metric, aggregate } from '../src/metrics'
import dysonData from './fixtures/dyson.json'
import emptyData from './fixtures/empty.json'
import tpLinkData from './fixtures/tp-link.json'
import harmonyData from './fixtures/harmony.json'

describe('Metrics aggregator', () => {
    test('Aggregates homebridge-dyson fan metrics', () => {
        const dyson = DeviceBoundary.check(dysonData)

        const expectedLabels = {
            bridge: 'Dyson bridge',
            device_id: 'AA:AA:AA:AA:AA:AA',
            instance: 'http://192.168.0.1:38333',
            firmware_revision: '21.04.03',
            hardware_revision: 'TP02',
            manufacturer: 'Dyson',
            model: 'Dyson Pure Cool Link Tower',
            name: 'Office',
            serial_number: 'NN2-EU-KKA0717A',
        }

        expect(aggregate([dyson])).toEqual([
            new Metric('air_purifier_active', 0, 'uint8', expectedLabels),
            new Metric('air_purifier_current_air_purifier_state', 0, 'uint8', expectedLabels),
            new Metric('air_purifier_target_air_purifier_state', 0, 'uint8', expectedLabels),
            new Metric('air_purifier_filter_life_level_percentage', 85, 'float', expectedLabels),
            new Metric('air_purifier_rotation_speed_percentage', 100, 'float', expectedLabels),
            new Metric('air_purifier_current_temperature_celsius', 22.8, 'float', expectedLabels),
            new Metric('air_purifier_swing_mode', 0, 'uint8', expectedLabels),
            new Metric('air_purifier_filter_change_indication', 0, 'uint8', expectedLabels),
            new Metric('air_purifier_current_relative_humidity_percentage', 52, 'float', expectedLabels),
            new Metric('air_purifier_air_quality', 2, 'uint8', expectedLabels),
        ])
    })

    test('Aggregates empty accessory metrics to empty metrics', () => {
        const empty = DeviceBoundary.check(emptyData)

        expect(aggregate([empty])).toEqual([])
    })

    test('Aggregates TP-Link plugs metrics', () => {
        const tpLink = DeviceBoundary.check(tpLinkData)

        const expectedLabelsAccessory1 = {
            bridge: 'TP-Link bridge',
            device_id: 'AA:AA:AA:AA:AA:AA',
            instance: 'http://192.168.0.1:38333',
            firmware_revision: '1.5.6 Build 191125 Rel.083657',
            hardware_revision: '2.0',
            manufacturer: 'TP-Link',
            model: 'HS110(EU)',
            name: 'Drucker',
            serial_number: 'AA:AA:AA:AA:AA:AA 8006106A8B451F91FA0498A6615963E019CCD80A',
        }

        const expectedLabelsAccessory2 = {
            bridge: 'TP-Link bridge',
            device_id: 'AA:AA:AA:AA:AA:AA',
            instance: 'http://192.168.0.1:38333',
            firmware_revision: '1.5.6 Build 191125 Rel.083657',
            hardware_revision: '2.0',
            manufacturer: 'TP-Link',
            model: 'HS110(EU)',
            name: 'Espressomaschine',
            serial_number: 'AA:AA:AA:AA:AA:AA 800614AA26608873C919E4592765404019F64D07',
        }

        expect(aggregate([tpLink])).toEqual([
            new Metric('outlet_amperes_a', 0.03, 'float', expectedLabelsAccessory1),
            new Metric('outlet_total_consumption_kwh', 0.051, 'float', expectedLabelsAccessory1),
            new Metric('outlet_apparent_power_va', 53248.8, 'float', expectedLabelsAccessory1),
            new Metric('outlet_volts_v', 230.8, 'float', expectedLabelsAccessory1),
            new Metric('outlet_consumption_w', 0, 'float', expectedLabelsAccessory1),
            new Metric('outlet_amperes_a', 0.03, 'float', expectedLabelsAccessory2),
            new Metric('outlet_total_consumption_kwh', 13.025, 'float', expectedLabelsAccessory2),
            new Metric('outlet_apparent_power_va', 53365.6, 'float', expectedLabelsAccessory2),
            new Metric('outlet_volts_v', 231, 'float', expectedLabelsAccessory2),
            new Metric('outlet_consumption_w', 0, 'float', expectedLabelsAccessory2),
        ])
    })

    test('Aggregates homebridge-harmony remote metrics', () => {
        const harmony = DeviceBoundary.check(harmonyData)

        const expectedLabels1 = {
            bridge: 'Harmony bridge',
            device_id: 'AA:AA:AA:AA:AA:AA',
            instance: 'http://192.168.0.1:38333',
            configured_name: 'Fernbedienung',
            firmware_revision: '1.6.2',
            manufacturer: 'Logitech',
            model: 'Fernbedienung Wohnzimmer',
            name: 'Fernbedienung Wohnzimmer',
            serial_number: '0e88f449-2720-4000-8c4b-06775986e8ac',
        }

        const expectedLabels2 = {
            bridge: 'Harmony bridge',
            device_id: 'AA:AA:AA:AA:AA:AA',
            instance: 'http://192.168.0.1:38333',
            configured_name: 'CD',
            firmware_revision: '1.6.2',
            manufacturer: 'Logitech',
            model: 'Fernbedienung Wohnzimmer',
            name: 'CD',
            serial_number: '0e88f449-2720-4000-8c4b-06775986e8ac',
        }

        const expectedLabels3 = {
            bridge: 'Harmony bridge',
            device_id: 'AA:AA:AA:AA:AA:AA',
            instance: 'http://192.168.0.1:38333',
            configured_name: 'AirPlay',
            firmware_revision: '1.6.2',
            manufacturer: 'Logitech',
            model: 'Fernbedienung Wohnzimmer',
            name: 'AirPlay',
            serial_number: '0e88f449-2720-4000-8c4b-06775986e8ac',
        }

        const expectedLabels4 = {
            bridge: 'Harmony bridge',
            device_id: 'AA:AA:AA:AA:AA:AA',
            instance: 'http://192.168.0.1:38333',
            firmware_revision: '1.6.2',
            manufacturer: 'Logitech',
            model: 'Fernbedienung Wohnzimmer',
            name: 'Fernbedienung Wohnzimmer',
            serial_number: '0e88f449-2720-4000-8c4b-06775986e8ac',
        }

        expect(aggregate([harmony])).toEqual([
            new Metric('television_sleep_discovery_mode', 1, 'uint8', expectedLabels1),
            new Metric('television_active', 0, 'uint8', expectedLabels1),
            new Metric('television_active_identifier', 0, 'uint32', expectedLabels1),

            new Metric('input_source_type', 10, 'uint8', expectedLabels2),
            new Metric('input_source_is_configured', 1, 'uint8', expectedLabels2),
            new Metric('input_source_current_visibility_state', 0, 'uint8', expectedLabels2),
            new Metric('input_source_target_visibility_state', 0, 'uint8', expectedLabels2),

            new Metric('input_source_type', 10, 'uint8', expectedLabels3),
            new Metric('input_source_is_configured', 1, 'uint8', expectedLabels3),
            new Metric('input_source_current_visibility_state', 0, 'uint8', expectedLabels3),
            new Metric('input_source_target_visibility_state', 0, 'uint8', expectedLabels3),

            new Metric('speaker_active', 1, 'uint8', expectedLabels4),
            new Metric('speaker_volume_control_type', 3, 'uint8', expectedLabels4),
            new Metric('speaker_volume_percentage', 50, 'uint8', expectedLabels4),
        ])
    })
})
