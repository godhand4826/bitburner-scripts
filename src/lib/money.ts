import { NS, ScriptArg } from '@ns';

export function getBudget(ns: NS, limit = Infinity, preserved = 0): number {
    limit = Math.max(0, limit)
    preserved = Math.max(0, preserved)

    const money = ns.getServerMoneyAvailable('home')
    const budget = Math.max(0, money - preserved)

    return Math.min(limit, budget)
}

export function getScriptIncome(ns: NS, script: string, host: string, ...args: ScriptArg[]) {
    return ns.isRunning(script, host, ...args) ? ns.getScriptIncome(script, host, ...args) : 0
}
