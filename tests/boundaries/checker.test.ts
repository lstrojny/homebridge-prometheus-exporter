import { describe, expect, test } from '@jest/globals'
import z from 'zod'
import { checkBoundary } from '../../src/boundaries'

const TestBoundary = z.object({
    member: z.literal('something'),
    anotherMember: z.optional(z.literal('something else')),
    yetAnotherMember: z.optional(
        z.array(
            z.object({
                member: z.literal('member'),
            }),
        ),
    ),
})

describe('Test boundary checker', () => {
    test('Returns checked data after successful check', () => {
        const result = checkBoundary(TestBoundary, { member: 'something' })

        expect(result).toEqual({ member: 'something' })
    })

    test('Returns error and insightful error message on failing check for simple string', () => {
        expect(() => checkBoundary(z.string(), 123)).toThrow(
            '[invalid_type] Expected string, received number (data is "123")',
        )
    })

    test('Returns error and insightful error message on failing check for nested object', () => {
        expect(() =>
            checkBoundary(TestBoundary, {
                member: 'something else',
                anotherMember: 'unexpected',
                yetAnotherMember: [{ foo: 123 }],
            }),
        ).toThrow(
            [
                '[invalid_literal] Invalid literal value, expected "something" at path "member" (data at resolved path "member" is ""something else"") | ',
                '[invalid_literal] Invalid literal value, expected "something else" at path "anotherMember" (data at resolved path "anotherMember" is ""unexpected"") | ',
                '[invalid_literal] Invalid literal value, expected "member" at path "yetAnotherMember.[0].member" (data at resolved path "yetAnotherMember.[0]" is "{"foo":123}")',
            ].join(''),
        )
    })
})
