import { CrimeType, NS } from '@ns';

export async function autoSetCrimeForMoney(ns: NS, focus = ns.singularity.isFocused()) {
    const crimes = getCrimes(ns)

    let max = 0
    let maxGainCrime = crimes[0]
    for (const crime of crimes) {
        const gain = getMoneyGainRate(ns, crime)
        if (gain > max) {
            max = gain
            maxGainCrime = crime
        }
    }

    setCrime(ns, maxGainCrime, focus)
}

let crimeTimeMapCache: Map<CrimeType, number> | null = null
// The crime time is constant, but the only way to obtain it is by committing the crime.
// So we do it once, cache the result, and avoid further interruptions.
export function getCrimeTimeMap(ns: NS) {
    if (crimeTimeMapCache === null) {
        ns.print(`Committing each crime for crime time`);
        const ct = new Map<CrimeType, number>()
        getCrimes(ns).forEach(crime => ct.set(crime, ns.singularity.commitCrime(crime, false)))
        crimeTimeMapCache = ct
        ns.print(`Crime time map cached: ${JSON.stringify(Array.from(crimeTimeMapCache.entries()))}`);
    }
    return crimeTimeMapCache
}

export function getMoneyGainRate(ns: NS, crime: CrimeType) {
    const crimeTime = getCrimeTimeMap(ns)

    const player = ns.getPlayer()
    const money = ns.formulas.work.crimeGains(player, crime).money
    const successRate = ns.formulas.work.crimeSuccessChance(player, crime)
    const time = crimeTime.get(crime) ?? Infinity

    return money * successRate / time
}

export function getCrimes(ns: NS): CrimeType[] {
    return [
        ns.enums.CrimeType.shoplift,
        ns.enums.CrimeType.robStore,
        ns.enums.CrimeType.mug,
        ns.enums.CrimeType.larceny,
        ns.enums.CrimeType.dealDrugs,
        ns.enums.CrimeType.bondForgery,
        ns.enums.CrimeType.traffickArms,
        ns.enums.CrimeType.homicide,
        ns.enums.CrimeType.grandTheftAuto,
        ns.enums.CrimeType.kidnap,
        ns.enums.CrimeType.assassination,
        ns.enums.CrimeType.heist,
    ]
}

export function getCurrentCrime(ns: NS): CrimeType | undefined {
    const work = ns.singularity.getCurrentWork()
    return work?.type == 'CRIME' ? work.crimeType : undefined
}

export function setCrime(ns: NS, crime: CrimeType, focus = ns.singularity.isFocused()) {
    if (getCurrentCrime(ns) != crime) {
        ns.singularity.commitCrime(crime, focus)
        ns.tprint(`Attempting to commit ${crime}`)
    }
}
