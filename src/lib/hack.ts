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

export function computePotential(ns: NS, host: string): number {
    // simulate a hack on the target server as if it has max money and min difficulty
    const p = ns.getPlayer()
    const s = ns.getServer(host)
    s.moneyAvailable = s.moneyMax
    s.hackDifficulty = s.minDifficulty

    const chance = ns.formulas.hacking.hackChance(s, p)
    const money = maxMoney(ns, host)
    const percent = ns.formulas.hacking.hackPercent(s, p)
    const time = ns.formulas.hacking.weakenTime(s, p) + 2 * paddingTime
    return chance * percent * money / time
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
    deployGrow(ns, host, { threads }, { host: target, additionalMsec: (weakenTime - 1 * paddingTime) - growTime })
    deployWeaken(ns, host, { threads }, { host: target, additionalMsec: (weakenTime + 0 * paddingTime) - weakenTime })
    await ns.sleep(2 * paddingTime)

    return true
}

export function isBackdoorInstalled(ns: NS, host: string): boolean {
    return ns.getServer(host).backdoorInstalled ?? false
}

export function isHackable(ns: NS, host: string) {
    return requiredHackingSkill(ns, host) <= ns.getHackingLevel()
}

export function requiredHackingSkill(ns: NS, host: string) {
    return ns.getServer(host).requiredHackingSkill ?? 0
}

export function hackDifficulty(ns: NS, host: string): number {
    return ns.getServer(host).hackDifficulty ?? 0
}

export function minHackDifficulty(ns: NS, host: string): number {
    return ns.getServer(host).minDifficulty ?? 0
}

export function numOpenPortsRequired(ns: NS, host: string): number {
    return ns.getServer(host).numOpenPortsRequired ?? Infinity
}

export function moneyAvailable(ns: NS, host: string): number {
    return ns.getServer(host).moneyAvailable ?? 0
}

export function maxMoney(ns: NS, host: string): number {
    return ns.getServer(host).moneyMax ?? 0
}

export function hasAdminRights(ns: NS, host: string): boolean {
    return ns.getServer(host).hasAdminRights
}

export function isSshPortOpen(ns: NS, host: string): boolean {
    return ns.getServer(host).sshPortOpen
}

export function isFtpPortOpen(ns: NS, host: string): boolean {
    return ns.getServer(host).ftpPortOpen
}

export function isSmtpPortOpen(ns: NS, host: string): boolean {
    return ns.getServer(host).smtpPortOpen
}

export function isHttpPortOpen(ns: NS, host: string): boolean {
    return ns.getServer(host).httpPortOpen
}

export function isSqlPortOpen(ns: NS, host: string): boolean {
    return ns.getServer(host).sqlPortOpen
}

export function getOrganizationName(ns: NS, host: string): string {
    return ns.getServer(host).organizationName
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