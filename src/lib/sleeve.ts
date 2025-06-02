import { NS } from "@ns";

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
            ns.sleeve.setToGymWorkout(i, 'Powerhouse Gym', gymType)
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