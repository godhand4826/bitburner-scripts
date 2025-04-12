import { NS } from '@ns';

export function availableRam(ns: NS, host = 'home', limit = Infinity, preserved = 0) {
    limit = Math.max(0, limit)
    preserved = Math.max(0, preserved)

    const ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
    const budget = Math.max(0, ram - preserved)

    return Math.min(limit, budget)
}

export function maxThreads(ns: NS, host: string, scriptRam: number, limitRam = Infinity, preservedRam = 0) {
    return Math.floor(availableRam(ns, host, limitRam, preservedRam) / scriptRam)
}