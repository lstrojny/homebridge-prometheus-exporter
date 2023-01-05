import { compare } from 'bcrypt'
import type { Immutable } from './std'

export function isAuthenticated(
    username: string,
    plainPassword: string,
    map: Immutable<Record<string, string>>,
): Promise<boolean> {
    return compare(plainPassword, map[username] || '')
}
