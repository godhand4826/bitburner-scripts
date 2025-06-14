import { loadModules } from './cdn'

export const Second = 1000;
export const Minute = 60 * Second;
export const Hour = 60 * Minute;

export function now(): number {
    return Date.now()
}

export function since(value: number): number {
    return now() - value
}

export const milliFormat = 'HH:mm:ss.SSS'

export function formatTime(value: number, format = 'HH:mm:ss'): string {
    const dateFns = loadModules().dateFns
    return dateFns.format(new Date(value), format)
}

export function sleep(ms: number): Promise<number> {
    return new Promise((res) => setTimeout(() => res(ms), ms))
}

export function forever(): Promise<never> {
    return new Promise(() => { /* never resolve */ })
}

export function till(awakeAt: number): Promise<number> {
    return sleep(awakeAt - now())
}