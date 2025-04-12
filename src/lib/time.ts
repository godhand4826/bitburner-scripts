export function now(): number {
    return Date.now()
}

// hh:mm:ss
export function formatDate(value: number): string {
    return new Date(value).toTimeString().split(' ')[0]
}

export function sleep(ms: number): Promise<number> {
    return new Promise((res) => setTimeout(() => res(ms), ms))
}
