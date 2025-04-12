import { NS } from '@ns';
import { getBudget } from './money';

export function autoPurchaseNode(ns: NS, budgetLimit = Infinity, preservedMoney = 0) {
    let index = -1
    while (
        ns.hacknet.getPurchaseNodeCost() <= getBudget(ns, budgetLimit, preservedMoney) &&
        (index = ns.hacknet.purchaseNode()) != -1
    ) {
        ns.tprint(`You have purchased hacknet-server-${index}`)
    }
}

export function autoUpgradeLevel(ns: NS, budgetLimit = Infinity, preservedMoney = 0) {
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        while (
            ns.hacknet.getLevelUpgradeCost(i) <= getBudget(ns, budgetLimit, preservedMoney) &&
            ns.hacknet.upgradeLevel(i)
        ) {
            ns.tprint(`hacknet-server-${i} level upgraded to ${ns.hacknet.getNodeStats(i).level}`)
        }
    }
}

export function autoUpgradeRam(ns: NS, budgetLimit = Infinity, preservedMoney = 0) {
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        while (
            ns.hacknet.getRamUpgradeCost(i) <= getBudget(ns, budgetLimit, preservedMoney) &&
            ns.hacknet.upgradeRam(i)
        ) {
            ns.tprint(`hacknet-server-${i} RAM upgraded to ${ns.formatRam(ns.hacknet.getNodeStats(i).ram)}`)
        }
    }
}

export function autoUpgradeCore(ns: NS, budgetLimit = Infinity, preservedMoney = 0) {
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        while (
            ns.hacknet.getCoreUpgradeCost(i) <= getBudget(ns, budgetLimit, preservedMoney) &&
            ns.hacknet.upgradeCore(i)
        ) {
            ns.tprint(`hacknet-server-${i} cores upgraded to ${ns.hacknet.getNodeStats(i).cores}`)
        }
    }
}

export function autoUpgradeCache(ns: NS, budgetLimit = Infinity, preservedMoney = 0) {
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        while (
            ns.hacknet.getCacheUpgradeCost(i) <= getBudget(ns, budgetLimit, preservedMoney) &&
            ns.hacknet.upgradeCache(i)
        ) {
            ns.tprint(`hacknet-server-${i} cache level upgraded to ${ns.hacknet.getNodeStats(i).cache}`)
        }
    }
}

export function sellHashForMoney(ns: NS, preserved = 0) {
    const budget = Math.max(0, ns.hacknet.numHashes() - preserved)
    const price = ns.hacknet.hashCost('Sell for Money')
    const amount = Math.floor(budget / price)
    ns.hacknet.spendHashes('Sell for Money', '', amount)
}

export function getHacknetProduction(ns: NS) {
    const hashPrice = 1_000_000 / ns.hacknet.hashCost('Sell for Money')
    return getHacknetHashRate(ns) * hashPrice
}

export function getHacknetHashRate(ns: NS): number {
    let hashPerSecond = 0
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        hashPerSecond += ns.hacknet.getNodeStats(i).production
    }
    return hashPerSecond
}