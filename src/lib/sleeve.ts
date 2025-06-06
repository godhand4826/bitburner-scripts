import { CityName, GymLocationName, GymType, NS, UniversityClassType, UniversityLocationName } from "@ns";
import { getBudget } from "./money";
import { airlineTicketPrice } from "./travel";
import { Course, getUniversityCity } from "./course";

export function autoSetAction(ns: NS) {
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        const sleeve = ns.sleeve.getSleeve(i)
        if (sleeve.shock > 0) {
            setToShockRecovery(ns, i)
        } else if (sleeve.sync < 100) {
            setToSynchronize(ns, i)
        } else if (ns.getPlayer().skills.hacking < 500) {
            setCourse(ns, i, 'ZB Institute of Technology', 'Computer Science')
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

export function setCourse(ns: NS, sleeve: number,
    universityName: UniversityLocationName | `${UniversityLocationName}`,
    courseName: UniversityClassType | `${UniversityClassType}`,
) {
    const course = getCurrentCourse(ns, sleeve)
    if (
        (course?.universityName != universityName || course?.courseName != courseName) &&
        travelToCity(ns, sleeve, getUniversityCity(ns, universityName)) &&
        ns.sleeve.setToUniversityCourse(sleeve, universityName, courseName)
    ) {
        ns.tprint(`Sleeve ${sleeve} started ${courseName} at ${universityName}`)
    }
}

export function travelToCity(ns: NS, sleeve: number, city: CityName | `${CityName}`): boolean {
    if (
        ns.sleeve.getSleeve(sleeve).city != city &&
        getBudget(ns) >= airlineTicketPrice &&
        ns.sleeve.travel(sleeve, city)
    ) {
        ns.tprint(`Sleeve ${sleeve} traveled to ${city}`)
    }
    return ns.sleeve.getSleeve(sleeve).city == city
}

export function getCurrentCourse(ns: NS, sleeve: number): Course | undefined {
    const task = ns.sleeve.getTask(sleeve)
    return task?.type == 'CLASS' ? {
        universityName: task.location as UniversityLocationName,
        courseName: task.classType as UniversityClassType
    } : undefined
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
    if (
        ns.sleeve.getSleeve(sleeve).shock == 0 &&
        ns.sleeve.getSleeveAugmentationPrice(augName) <= getBudget(ns) &&
        ns.sleeve.purchaseSleeveAug(sleeve, augName)
    ) {
        ns.toast(`You have purchased ${augName} for sleeve ${sleeve}`)
    }
}