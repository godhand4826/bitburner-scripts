import { AutocompleteData, NS, ScriptArg } from '@ns';
import { hackDifficulty, hasAdminRights, isBackdoorInstalled, maxMoney, minHackDifficulty, moneyAvailable, numOpenPortsRequired, getOrganizationName, requiredHackingSkill, isSshPortOpen, isFtpPortOpen, isSmtpPortOpen, isHttpPortOpen, isSqlPortOpen } from './lib/hack';

export async function main(ns: NS): Promise<void> {
    const host = ns.args[0] as string
    const s = ns.getServer(host)
    const p = ns.getPlayer()

    ns.tprintf(`Organization name: ${getOrganizationName(ns, host)}`)
    ns.tprintf(`Required number of open ports for NUKE: ${numOpenPortsRequired(ns, host)}`)
    ns.tprintf(`SSH port opened: ${isSshPortOpen(ns, host)}`)
    ns.tprintf(`FTP port opened: ${isFtpPortOpen(ns, host)}`)
    ns.tprintf(`SMTP port opened: ${isSmtpPortOpen(ns, host)}`)
    ns.tprintf(`HTTP port opened: ${isHttpPortOpen(ns, host)}`)
    ns.tprintf(`SQL port opened: ${isSqlPortOpen(ns, host)}`)
    ns.tprintf(`Has root Access: ${hasAdminRights(ns, host)}`)
    ns.tprintf(`Required hacking skill for hack() and backdoor: ${requiredHackingSkill(ns, host)}`)
    ns.tprintf(`Backdoor installed: ${isBackdoorInstalled(ns, host)}`)
    ns.tprintf(`Chance to hack: %s`, `${ns.formatPercent(ns.hackAnalyzeChance(host))}`)
    ns.tprintf(`Hack time: ${ns.tFormat(ns.getHackTime(host))}`)
    ns.tprintf(`Grow time: ${ns.tFormat(ns.getGrowTime(host))}`)
    ns.tprintf(`Weaken time: ${ns.tFormat(ns.getWeakenTime(host))}`)
    ns.tprintf(`Hack security: ${ns.hackAnalyzeSecurity(1, host)}`)
    ns.tprintf(`Grow security: ${ns.growthAnalyzeSecurity(1, host)}`)
    ns.tprintf(`Weaken security: ${-ns.weakenAnalyze(1, 1)}`)
    ns.tprintf(`Server min security level: ${minHackDifficulty(ns, host)}`)
    ns.tprintf(`Server security level: ${hackDifficulty(ns, host)}`)
    ns.tprintf(`Hack percent: %s`, `${ns.formatPercent(ns.formulas.hacking.hackPercent(s, p))}`)
    ns.tprintf(`Grow percent: %s`, `${ns.formatPercent(ns.formulas.hacking.growPercent(s, 1, p))}`)
    ns.tprintf(`Money available on server: ${ns.formatNumber(moneyAvailable(ns, host))}`)
    ns.tprintf(`Max money available on server: ${ns.formatNumber(maxMoney(ns, host))}`)
    ns.tprintf(`Used Ram: ${ns.formatRam(ns.getServerUsedRam(host))}`)
    ns.tprintf(`Max Ram: ${ns.formatRam(ns.getServerMaxRam(host))}`)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return data.servers;
}