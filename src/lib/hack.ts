import { BasicHGWOptions, NS, RunOptions } from '@ns';
import { maxThreads } from './ram';
import { deploy } from './deploy';

export const hackScript = 'hack.js'
export const growScript = 'grow.js'
export const weakenScript = 'weaken.js'
export const hackRam = 1.6 + 0.1
export const growRam = 1.6 + 0.15
export const weakenRam = 1.6 + 0.15
export const batchHackRam = hackRam + weakenRam + growRam + weakenRam
export const batchGrowRam = growRam + weakenRam
export const paddingTime = 5

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
    deployHack(ns, host, { threads }, { host: target, additionalMsec: (weakenTime - 1 * paddingTime) - hackTime })
    deployWeaken(ns, host, { threads }, { host: target, additionalMsec: (weakenTime + 0 * paddingTime) - weakenTime })
    deployGrow(ns, host, { threads }, { host: target, additionalMsec: (weakenTime + 1 * paddingTime) - growTime })
    deployWeaken(ns, host, { threads }, { host: target, additionalMsec: (weakenTime + 2 * paddingTime) - weakenTime })
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
    deployGrow(ns, host, { threads }, { host: target, additionalMsec: (weakenTime - 1 * paddingTime) - growTime },)
    deployGrow(ns, host, { threads }, { host: target, additionalMsec: (weakenTime + 0 * paddingTime) - weakenTime },)
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

export interface RemoteHGWOptions extends BasicHGWOptions {
    host: string
}

export function deployHack(ns: NS, host: string, threadOrOptions: number | RunOptions, opts: RemoteHGWOptions) {
    deploy(ns, hackScript, host, threadOrOptions, JSON.stringify(opts))
}

export function deployGrow(ns: NS, host: string, threadOrOptions: number | RunOptions, opts: RemoteHGWOptions) {
    deploy(ns, growScript, host, threadOrOptions, JSON.stringify(opts))
}

export function deployWeaken(ns: NS, host: string, threadOrOptions: number | RunOptions, opts: RemoteHGWOptions) {
    deploy(ns, weakenScript, host, threadOrOptions, JSON.stringify(opts))
}