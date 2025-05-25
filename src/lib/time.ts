import { loadModules } from './cdn'

export function now(): number {
    return Date.now()
}

export function formatDate(value: number, format = 'HH:mm:ss'): string {
    const dateFns = loadModules().dateFns
    return dateFns.format(new Date(value), format)
}

export function sleep(ms: number): Promise<number> {
    return new Promise((res) => setTimeout(() => res(ms), ms))
}

export function forever(): Promise<never> {
    return new Promise(() => { /* never resolve */ })
}