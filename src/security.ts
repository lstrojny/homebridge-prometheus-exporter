import { compare } from 'bcrypt'

export function isAuthenticated(
    username: string,
    plainPassword: string,
    map: Record<string, string>,
): Promise<boolean> {
    return compare(plainPassword, map[username] || '')
}
