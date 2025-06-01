import { NS } from '@ns'
import { autoAscendMember, autoPurchaseEquipment, autoRecruitMember, autoSetMemberTask, autoSetTerritoryWarfare, renameMembers } from './lib/gang'
import { disableLogs } from './lib/log'

export function run(ns: NS, budgetLimit = 0, preservedMoney = 0) {
    ns.run('gang.js', 1, budgetLimit, preservedMoney)
}

export async function main(ns: NS): Promise<void> {
    const budgetLimit = (ns.args[0] ?? 0) as number
    const preservedMoney = (ns.args[1] ?? 0) as number

    disableLogs(ns, 'sleep', 'gang.createGang', 'getServerMoneyAvailable', 'gang.renameMember')

    while (!ns.gang.inGang()) {
        // if (ns.gang.createGang(ns.enums.FactionName.NiteSec)) {
        //     ns.tprint(`Successfully create gang with ${ns.gang.getGangInformation().faction}`)
        // }

        await ns.sleep(2000)
    }

    renameMembers(ns)

    for (; ;) {
        autoRecruitMember(ns)
        autoAscendMember(ns)
        autoPurchaseEquipment(ns, budgetLimit, preservedMoney)
        autoSetMemberTask(ns)
        autoSetTerritoryWarfare(ns)

        await ns.gang.nextUpdate()
    }
}