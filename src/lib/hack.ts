import { AutocompleteData, BasicHGWOptions, NS, ScriptArg } from '@ns';
import { Flags } from './flag';
import { maxThreads } from './ram';
import { isMyMachine } from './server';
import { formatTime, milliFormat, now } from './time';

export const hackScript = 'hack.js'
export const growScript = 'grow.js'
export const weakenScript = 'weaken.js'
export const hackingScripts = [hackScript, growScript, weakenScript]
export const hackRam = 1.6 + 0.1
export const growRam = 1.6 + 0.15
export const weakenRam = 1.6 + 0.15
export const batchHackRam = hackRam + weakenRam + growRam + weakenRam
export const batchGrowRam = growRam + weakenRam
export const paddingTime = 20

export function computeEarningsVelocity(ns: NS, host: string) {
    const money = ns.getServerMoneyAvailable(host) * ns.hackAnalyze(host)
    const ev = money * ns.hackAnalyzeChance(host)
    const time = getHWGWTime(ns, host)
    const speed = ev / time
    return speed
}

export function getHWGWTime(ns: NS, host: string) {
    return ns.getWeakenTime(host) + 2 * paddingTime
}

export function getGWTime(ns: NS, host: string) {
    return ns.getWeakenTime(host)
}

// exec a batch of weaken, hack, weaken, grow
export async function execHWGW(ns: NS, host: string, target: string, limitRam = Infinity, preservedRam = 0): Promise<boolean> {
    const threads = maxThreads(ns, host, batchHackRam, limitRam, preservedRam)

    if (!ns.hasRootAccess(host) || threads == 0) {
        return false
    }

    const hackTime = ns.getHackTime(target)
    const growTime = ns.getGrowTime(target)
    const weakenTime = ns.getWeakenTime(target)

    //                   |== hack ========|-|-|-|
    // |== weaken ==========================|-|-|
    //                 |== grow ==============|-|
    //     |== weaken  =========================|
    //                           |== hack ========|
    // |-|-|-|-|== weaken ==========================|
    //                         |== grow ==============|
    //             |== weaken ==========================|
    const execAt = now()
    ns.exec(hackScript, host, { threads },
        formatTime(execAt + weakenTime - 1 * paddingTime, milliFormat),
        ...toFlags({ host: target, additionalMsec: Math.max(0, (weakenTime - 1 * paddingTime) - hackTime) }))
    ns.exec(weakenScript, host, { threads },
        formatTime(execAt + weakenTime + 0 * paddingTime, milliFormat),
        ...toFlags({ host: target, additionalMsec: Math.max(0, (weakenTime + 0 * paddingTime) - weakenTime) }))
    ns.exec(growScript, host, { threads },
        formatTime(execAt + weakenTime + 1 * paddingTime, milliFormat),
        ...toFlags({ host: target, additionalMsec: Math.max(0, (weakenTime + 1 * paddingTime) - growTime) }))
    ns.exec(weakenScript, host, { threads },
        formatTime(execAt + weakenTime + 2 * paddingTime, milliFormat),
        ...toFlags({ host: target, additionalMsec: Math.max(0, (weakenTime + 2 * paddingTime) - weakenTime) }))
    await ns.sleep(4 * paddingTime)

    return true
}

export async function execGW(ns: NS, host: string, target: string, limitRam = Infinity, preservedRam = 0): Promise<boolean> {
    const threads = maxThreads(ns, host, batchGrowRam, limitRam, preservedRam)

    if (!ns.hasRootAccess(host) || threads == 0) {
        return false
    }

    const growTime = ns.getGrowTime(target)
    const weakenTime = ns.getWeakenTime(target)

    //                 |== grow ==============|-|
    //     |== weaken  =========================|
    //                   |== grow ================|
    // |-|-|-|-|== weaken ==========================|
    const execAt = now()
    ns.exec(growScript, host, { threads },
        formatTime(execAt + weakenTime - 1 * paddingTime, milliFormat),
        ...toFlags({ host: target, additionalMsec: Math.max(0, (weakenTime - 1 * paddingTime) - growTime) }))
    ns.exec(weakenScript, host, { threads },
        formatTime(execAt + weakenTime + 0 * paddingTime, milliFormat),
        ...toFlags({ host: target, additionalMsec: Math.max(0, (weakenTime + 0 * paddingTime) - weakenTime) }))
    await ns.sleep(2 * paddingTime)

    return true
}


export function isHackable(ns: NS, host: string) {
    return requiredHackingSkill(ns, host) <= ns.getHackingLevel()
}

export function requiredHackingSkill(ns: NS, host: string) {
    return ns.getServer(host).requiredHackingSkill ?? Infinity
}

export function hasMoney(ns: NS, host: string) {
    return ns.getServerMoneyAvailable(host) > 0
}

interface RemoteHGWOptions extends BasicHGWOptions {
    host: string
}

export const schema: Flags = [
    ['host', ''],
    ['threads', Infinity],
    ['stock', false],
    ['additionalMsec', 0],
]

export function toFlags(opt: RemoteHGWOptions): ScriptArg[] {
    return [
        '--host', opt.host,
        ...(opt.threads !== undefined ? ['--threads', opt.threads] : []),
        ...(opt.stock !== undefined ? ['--stock'] : []),
        ...(opt.additionalMsec !== undefined ? ['--additionalMsec', opt.additionalMsec] : []),
    ]
}

export function parseFlags(ns: NS): RemoteHGWOptions {
    const flags = ns.flags(schema)

    const host = flags.host as string
    const threads = Math.min(flags.threads as number, ns.self().threads)
    const stock = flags.stock as boolean
    const additionalMsec = flags.additionalMsec as number

    return {
        host,
        threads,
        stock,
        additionalMsec
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    data.flags(schema)

    return data.servers.filter(host => !isMyMachine(host))
}