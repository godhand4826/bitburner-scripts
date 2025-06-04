import { GymLocationName, GymType, NS } from "@ns";
import { getBudget } from "./money";

export function autoSetAction(ns: NS) {
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        const sleeve = ns.sleeve.getSleeve(i)
        if (sleeve.shock > 0) {
            setToShockRecovery(ns, i)
        } else if (sleeve.sync < 100) {
            setToSynchronize(ns, i)
        } else {
            const skills = ns.getPlayer().skills
            let min = skills.strength
            let gymType = ns.enums.GymType.strength
            if (skills.defense < min) {
                min = skills.defense
                gymType = ns.enums.GymType.defense
            }
            if (skills.dexterity < min) {
                min = skills.dexterity
                gymType = ns.enums.GymType.dexterity
            }
            if (skills.agility < min) {
                min = skills.agility
                gymType = ns.enums.GymType.agility
            }
            setToGymWorkout(ns, i, 'Powerhouse Gym', gymType)
        }
    }
}

export function setToGymWorkout(
    ns: NS,
    sleeve: number,
    gymName: GymLocationName | `${GymLocationName}`,
    gymType: GymType | `${GymType}`,
) {
    const task = ns.sleeve.getTask(sleeve)
    if (task?.type != 'CLASS' ||
        (task.location != gymName || task.classType != gymType)
    ) {
        if (ns.sleeve.setToGymWorkout(sleeve, gymName, gymType)) {
            ns.tprint(`Set task train ${gymType} at ${gymName} for sleeve ${sleeve}`)
        } else {
            ns.tprint(`Failed to set task train ${gymType} at ${gymName} for sleeve ${sleeve}`)
        }
    }
}

export function setToShockRecovery(ns: NS, sleeve: number) {
    if (ns.sleeve.getTask(sleeve)?.type != 'RECOVERY') {
        if (ns.sleeve.setToShockRecovery(sleeve)) {
            ns.tprint(`Set task shock recovery for sleeve ${sleeve}`)
        } else {
            ns.tprint(`Failed to set task shock recovery for sleeve ${sleeve}`)
        }
    }
}

export function setToSynchronize(ns: NS, sleeve: number) {
    if (ns.sleeve.getTask(sleeve)?.type != 'SYNCHRO') {
        if (ns.sleeve.setToSynchronize(sleeve)) {
            ns.tprint(`Set task synchronize for sleeve ${sleeve}`)
        } else {
            ns.tprint(`Failed to set task synchronize for sleeve ${sleeve}`)
        }
    }
}

export function autoPurchaseAugs(ns: NS) {
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        for (const augName of getPurchasableAugs(ns, i)) {
            purchaseAug(ns, i, augName)
        }
    }
}

export function getPurchasableAugs(ns: NS, sleeve: number): string[] {
    return ns.sleeve.getSleevePurchasableAugs(sleeve)
        .sort((a, b) => a.cost - b.cost)
        .map(aug => aug.name)
}

export function purchaseAug(ns: NS, sleeve: number, augName: string) {
    if (ns.sleeve.getSleeveAugmentationPrice(augName) <= getBudget(ns)) {
        ns.sleeve.purchaseSleeveAug(sleeve, augName)
    }
}