import { loadModules } from './cdn'

export function now(): number {
    return Date.now()
}

// hh:mm:ss
export function formatDate(value: number): string {
    const dateFns = loadModules().dateFns
    return dateFns.format(new Date(value), 'HH:mm:ss')
}

export function sleep(ms: number): Promise<number> {
    return new Promise((res) => setTimeout(() => res(ms), ms))
}
