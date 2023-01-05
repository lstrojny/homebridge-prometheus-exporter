import type z from 'zod'
import type { Immutable, Mutable } from '../std'

type Path = Immutable<(string | number)[]>

type ResolvedPath = Immutable<{ resolvedValue: string; resolvedPath: Path }>

function resolvePath(data: unknown, path: Path): ResolvedPath {
    const resolvedPath: Mutable<Path> = []
    for (const element of path) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (data[element] != null) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                data = data[element]
                resolvedPath.push(element)
            } else {
                break
            }
        } catch (e) {
            break
        }
    }

    return { resolvedValue: JSON.stringify(data), resolvedPath }
}

function formatPath(path: Path): string {
    return path.map((element) => (typeof element === 'number' ? `[${element}]` : element)).join('.')
}

export function checkBoundary<Output, T extends z.ZodType<Output>>(type: T, data: unknown): z.infer<T> {
    const result = type.safeParse(data)
    if (result.success) {
        return result.data
    }

    const message =
        'Error checking type. Details: ' +
        result.error.issues
            .map((issue: Immutable<z.ZodIssue>) => ({ ...issue, ...resolvePath(data, issue.path) }))
            .map(
                (issue: Immutable<z.ZodIssue> & ResolvedPath) =>
                    `[${issue.code}] ${issue.message}${
                        issue.path.length > 0 ? ` at path "${formatPath(issue.path)}"` : ''
                    } (data${
                        issue.resolvedPath.length > 0 ? ` at resolved path "${formatPath(issue.resolvedPath)}"` : ''
                    } is "${issue.resolvedValue}")`,
            )
            .join(' | ')

    throw new Error(message)
}
