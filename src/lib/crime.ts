import { CrimeType, NS } from '@ns';
import { disableLogs } from './log';

export async function autoCrimeForMoney(ns: NS, focus = ns.singularity.isFocused()) {
    disableLogs(ns, 'sleep')

    const crimes = getCrimes(ns)

    const crimeTime = new Map<CrimeType, number>()
    crimes.forEach(crime => crimeTime.set(crime, ns.singularity.commitCrime(crime, false)))

    function getMoneyGainRate(ns: NS, crime: CrimeType) {
        const player = ns.getPlayer()
        const money = ns.formulas.work.crimeGains(player, crime).money
        const successRate = ns.formulas.work.crimeSuccessChance(player, crime)
        const time = crimeTime.get(crime) ?? Infinity

        return money * successRate / time
    }

    for (; ;) {
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

        await ns.sleep(2000)
    }

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

export function crimeForKarmaAndKill(ns: NS, focus = ns.singularity.isFocused()) {
    setCrime(ns, ns.enums.CrimeType.homicide, focus)
}