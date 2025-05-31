import { NS } from '@ns';
import { getBudget } from './money';

export function autoRecruitMember(ns: NS) {
    while (ns.gang.canRecruitMember()) {
        renameMembers(ns)
        recruitMember(ns)
    }
}

export function recruitMember(ns: NS) {
    const nextIndex = ns.gang.getMemberNames().length
    const name = memberNameByIndex(nextIndex)
    if (ns.gang.recruitMember(name)) {
        ns.tprint(`Recruited member ${name}`)
    }
}

export function autoAscendMember(ns: NS, ratio = 1.2) {
    for (const member of ns.gang.getMemberNames()) {
        const r = ns.gang.getAscensionResult(member)
        if (r != null && (
            r.hack >= ratio || r.str >= ratio || r.def >= ratio ||
            r.dex >= ratio || r.agi >= ratio || r.cha >= ratio
        )) {
            ascendMember(ns, member)
        }
    }
}

export function ascendMember(ns: NS, member: string) {
    if (ns.gang.ascendMember(member)) {
        ns.toast(`Ascended ${member}`)
    }
}

export function renameMembers(ns: NS) {
    ns.gang.getMemberNames()
        .forEach((m, i) => ns.gang.renameMember(m, `_${memberNameByIndex(i)}`))
    ns.gang.getMemberNames()
        .forEach((m, i) => ns.gang.renameMember(m, `${memberNameByIndex(i)}`))
}

function memberNameByIndex(index: number): string {
    const id = index + 1
    const prefix = `member`
    const suffix = id.toString().padStart(2, '0')
    const name = `${prefix}-${suffix}`
    return name
}

export function autoPurchaseEquipment(ns: NS, budgetLimit = 0, preservedMoney = 0) {
    const members = ns.gang.getMemberNames()
    const equipments = ns.gang.getEquipmentNames()
    for (const member of members) {
        for (const equipment of equipments) {
            if (
                ns.gang.getEquipmentCost(equipment) <= getBudget(ns, budgetLimit, preservedMoney) &&
                ns.gang.purchaseEquipment(member, equipment)
            ) {
                ns.tprint(`Purchased ${equipment} for ${member}`)
            }
        }
    }
}

/**
 * Strategy:
 * - Goal is to win Territory Warfare by increasing gang power.
 * - Power comes from warfare, which requires more members.
 * - Recruiting members needs Respect, gained via Money Laundering.
 * - That increases Wanted Level, which reduces task efficiency.
 * - After warfare is completed, members shift focus back to generating income.
 * 
 * Role assignment:
 * - Some members lower Wanted Level (e.g. Ethical Hacking, Vigilante Justice)
 * - Some members gain Respect (e.g. DDoS Attacks, Plant Virus, Cyberterrorism)
 * - Some members build Power (Territory Warfare)
 * - Some members generate income (e.g. Money Laundering)
 * 
 * Member allocation (Based on practical experience):
 * - Before Territory Warfare is completed, a 1/1/rest/0 split efficiently balances wanted level,
 *   respect gain, and power growth during the early to mid stages.
 * - After the warfare is over, all members shift focus to Money Laundering (1/0/0/rest).
 */
export function autoSetMemberTask(ns: NS) {
    const members = ns.gang.getMemberNames()

    const [wantedLevelTeamSize, respectTeamSize, incomeTeamSize, powerTeamSize] =
        ns.gang.getMemberNames().length < maxGangMembers ?
            [1, 1, 0, members.length - 2] :
            isTerritoryWarfareNotCompleted(ns) ?
                [1, 0, 1, members.length - 2] :
                [1, 0, members.length - 1, 0];

    let index = 0;

    // wanted level team
    members.slice(index, index += wantedLevelTeamSize).forEach(m =>
        setMemberTask(ns, m, getSortedTasks(ns, m, GainType.WantedLevel).at(0) ?? ''))

    // respect team
    // Choose the highest-respect task that keeps total wanted level gain rate <= 0
    members.slice(index, index += respectTeamSize).forEach(m => {
        const currentTotalGain = ns.gang.getGangInformation().wantedLevelGainRate
        const currentGain = ns.gang.getMemberInformation(m).wantedLevelGain

        const task = getSortedTasks(ns, m, GainType.Respect).findLast(t => {
            const nextGain = getTaskWantedLevelGain(ns, m, t)
            const gainDelta = nextGain - currentGain
            const nextTotalGain = currentTotalGain + gainDelta

            return nextTotalGain <= 0 || getWantedPenalty(ns) > -0.02
        })

        setMemberTask(ns, m, task ?? '')
    })

    // income team
    members.slice(index, index += incomeTeamSize).forEach(m =>
        setMemberTask(ns, m, getSortedTasks(ns, m, GainType.Money).at(-1) ?? ''))

    // power team
    members.slice(index, index += powerTeamSize).forEach(m =>
        setMemberTask(ns, m, 'Territory Warfare'))
}

export function setMemberTask(ns: NS, member: string, task: string) {
    if (ns.gang.getMemberInformation(member).task != task) {
        if (ns.gang.setMemberTask(member, task)) {
            ns.tprint(`Set task ${task} for member ${member}`)
        } else {
            ns.tprint(`Failed to set task ${task} for member ${member}`)
        }
    }
}

enum GainType {
    Money = 'Money',
    Respect = 'Respect',
    WantedLevel = 'Wanted Level',
}

export function getSortedTasks(ns: NS, member: string, sortBy = GainType.Money): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let cmp = (t1: string, t2: string) => 0
    if (sortBy == GainType.Money) {
        cmp = (t1: string, t2: string) => ns.gang.getTaskStats(t1).baseMoney - ns.gang.getTaskStats(t2).baseMoney
    } else if (sortBy == GainType.Respect) {
        cmp = (t1: string, t2: string) => ns.gang.getTaskStats(t1).baseRespect - ns.gang.getTaskStats(t2).baseRespect
    } else if (sortBy == GainType.WantedLevel) {
        cmp = (t1: string, t2: string) => ns.gang.getTaskStats(t1).baseWanted - ns.gang.getTaskStats(t2).baseWanted
    }

    return ns.gang.getTaskNames().sort(cmp)
}

export function getTaskMoneyGain(ns: NS, member: string, task: string): number {
    return ns.formulas.gang.moneyGain(
        ns.gang.getGangInformation(),
        ns.gang.getMemberInformation(member),
        ns.gang.getTaskStats(task)
    )
}

export function getTaskRespectGain(ns: NS, member: string, task: string): number {
    return ns.formulas.gang.respectGain(
        ns.gang.getGangInformation(),
        ns.gang.getMemberInformation(member),
        ns.gang.getTaskStats(task),
    )
}

export function getTaskWantedLevelGain(ns: NS, member: string, task: string): number {
    return ns.formulas.gang.wantedLevelGain(
        ns.gang.getGangInformation(),
        ns.gang.getMemberInformation(member),
        ns.gang.getTaskStats(task),
    )
}

export function autoSetTerritoryWarfare(ns: NS, minChanceToWinClash = 0.50) {
    const isClashLikelyToWin = getMinChanceToWinClash(ns) > minChanceToWinClash
    const shouldEngage = isTerritoryWarfareNotCompleted(ns) && isClashLikelyToWin;

    setTerritoryWarfare(ns, shouldEngage)
}

export function setTerritoryWarfare(ns: NS, engage: boolean) {
    if (ns.gang.getGangInformation().territoryWarfareEngaged != engage) {
        ns.gang.setTerritoryWarfare(engage)
        ns.tprint(`Set territory warfare to ${engage}`)
    }
}

export function getMinChanceToWinClash(ns: NS): number {
    let min = 1;
    for (const gang of getOtherGangs(ns).filter(g => ns.gang.getOtherGangInformation()[g].territory > 0)) {
        min = Math.min(min, ns.gang.getChanceToWinClash(gang))
    }
    return min;
}

export function getOtherGangs(ns: NS): string[] {
    const myGang = ns.gang.getGangInformation().faction
    return getGangs(ns).filter(gang => gang != myGang)
}

export function getGangs(ns: NS): string[] {
    return Object.keys(ns.gang.getOtherGangInformation())
}

export function isTerritoryWarfareNotCompleted(ns: NS): boolean {
    return !(ns.gang.inGang() && ns.gang.getGangInformation().territory == 1);
}

export const maxGangMembers = 12;

const tickPerSecond = 5;

export function moneyGainRate(ns: NS): number {
    return ns.gang.getGangInformation().moneyGainRate * tickPerSecond;
}

export function wantedLevelGainRate(ns: NS): number {
    return ns.gang.getGangInformation().wantedLevelGainRate * tickPerSecond;
}

export function respectGainRate(ns: NS): number {
    return ns.gang.getGangInformation().respectGainRate * tickPerSecond
}

export function getWantedPenalty(ns: NS): number {
    return -(1 - ns.gang.getGangInformation().wantedPenalty)
}
