import { NS } from '@ns'
import { getBudget } from './money'

export function purchaseServer(ns: NS, ram = 2): string {
    const len = ns.getPurchasedServers().length
    const id = len + 1
    const prefix = 'home'
    const suffix = id.toString().padStart(2, '0')
    const host = `${prefix}-${suffix}`

    const hostname = ns.purchaseServer(host, ram)
    if (hostname != '') {
        ns.toast(`You have purchase ${hostname}`)
    }
    return hostname
}

export function getPurchasedServerCost(ns: NS, n = 1): number {
    return ns.getPurchasedServerCost(1 << n)
}

export function autoPurchasedServer(ns: NS, budgetLimit = Infinity, preservedMoney = 0) {
    let host = ''
    while (
        getPurchasedServerCost(ns) <= getBudget(ns, budgetLimit, preservedMoney) &&
        (host = purchaseServer(ns)) != ''
    ) {
        ns.toast(`You have purchased ${host} with RAM ${ns.formatRam(ns.getServerMaxRam(host))}`)
    }
}

export function upgradePurchasedServer(ns: NS, host: string, n = 1): boolean {
    return ns.upgradePurchasedServer(host, ns.getServerMaxRam(host) * (1 << n))
}

export function autoUpgradePurchasedServer(ns: NS, budgetLimit = Infinity, preservedMoney = 0) {
    for (const host of ns.getPurchasedServers()) {
        while (
            getPurchasedServerUpgradeCost(ns, host) <= getBudget(ns, budgetLimit, preservedMoney) &&
            ns.getServerMaxRam(host) << 1 <= 2 << 20 &&
            upgradePurchasedServer(ns, host)
        ) {
            ns.toast(`${host} RAM upgraded to ${ns.formatRam(ns.getServerMaxRam(host))}`)
        }
    }
}

export function getPurchasedServerUpgradeCost(ns: NS, host: string, n = 1): number {
    return ns.getPurchasedServerUpgradeCost(host, ns.getServerMaxRam(host) * (1 << n))
}

export function isPurchasedServersFullyUpgraded(ns: NS): boolean {
    return ns.getPurchasedServers().length == ns.getPurchasedServerLimit() &&
        ns.getPurchasedServers().every(s => ns.getServerMaxRam(s) == ns.getPurchasedServerMaxRam())
}

export function isMyMachine(host: string): boolean {
    return isHomeServer(host) || isPurchasedServer(host) || isHacknetServer(host)
}

export function isHomeServer(host: string): boolean {
    return host == 'home'
}

export function isPurchasedServer(host: string): boolean {
    return host.startsWith('home-')
}

export function isHacknetServer(host: string): boolean {
    return host.startsWith('hacknet-server-')
}