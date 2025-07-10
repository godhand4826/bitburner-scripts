import { CityName, GymLocationName, GymType, NS, UniversityClassType, UniversityLocationName } from "@ns";
import { getBudget } from "./money";
import { airlineTicketPrice } from "./travel";
import { Course, getUniversityCity } from "./course";
import { getGymCity, Workout } from "./gym";
import { m } from "./const";

export function autoSetAction(ns: NS) {
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        const sleeve = ns.sleeve.getSleeve(i)
        if (sleeve.shock > 0) {
            setToShockRecovery(ns, i)
        } else if (sleeve.sync < 100) {
            setToSynchronize(ns, i)
        } else if (isIdle(ns, i)) {
            setSleeveCourse(ns, i, 'ZB Institute of Technology', 'Computer Science')
        } else if (ns.getPlayer().skills.hacking < 340) {
            if (getBudget(ns) < 50 * m) {
                continue
            }

            setSleeveCourse(ns, i, 'ZB Institute of Technology', 'Algorithms')
        } else {
            if (getBudget(ns) < 50 * m) {
                continue
            }

            const skills = ns.getPlayer().skills
            let min = skills.strength
            let gymType = ns.enums.GymType.strength
            const workout = getSleeveCurrentWorkout(ns, i)?.gymType
            if (skills.strength - (workout == ns.enums.GymType.strength ? 100 : 0) < min) {
                min = skills.strength - (workout == ns.enums.GymType.strength ? 100 : 0)
                gymType = ns.enums.GymType.strength
            }
            if (skills.defense - (workout == ns.enums.GymType.defense ? 100 : 0) < min) {
                min = skills.defense - (workout == ns.enums.GymType.defense ? 100 : 0)
                gymType = ns.enums.GymType.defense
            }
            if (skills.dexterity - (workout == ns.enums.GymType.dexterity ? 100 : 0) < min) {
                min = skills.dexterity - (workout == ns.enums.GymType.dexterity ? 100 : 0)
                gymType = ns.enums.GymType.dexterity
            }
            if (skills.agility - (workout == ns.enums.GymType.agility ? 100 : 0) < min) {
                min = skills.agility - (workout == ns.enums.GymType.agility ? 100 : 0)
                gymType = ns.enums.GymType.agility
            }
            setToGymWorkout(ns, i, 'Powerhouse Gym', gymType)
        }
    }
}

export function setSleeveCourse(ns: NS, sleeve: number,
    universityName: UniversityLocationName | `${UniversityLocationName}`,
    courseName: UniversityClassType | `${UniversityClassType}`,
) {
    const course = getSleeveCurrentCourse(ns, sleeve)
    if (
        (course?.universityName != universityName || course?.courseName != courseName) &&
        travelSleeveToCity(ns, sleeve, getUniversityCity(ns, universityName)) &&
        ns.sleeve.setToUniversityCourse(sleeve, universityName, courseName)
    ) {
        ns.tprint(`Sleeve ${sleeve} started ${courseName} at ${universityName}`)
    }
}

export function travelSleeveToCity(ns: NS, sleeve: number, city: CityName | `${CityName}`): boolean {
    if (
        ns.sleeve.getSleeve(sleeve).city != city &&
        getBudget(ns) >= airlineTicketPrice &&
        ns.sleeve.travel(sleeve, city)
    ) {
        ns.tprint(`Sleeve ${sleeve} traveled to ${city}`)
    }
    return ns.sleeve.getSleeve(sleeve).city == city
}

export function getSleeveCurrentCourse(ns: NS, sleeve: number): Course | undefined {
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
    const task = getSleeveCurrentWorkout(ns, sleeve)
    if (
        (task?.gymName != gymName || task.gymType != gymType) &&
        travelSleeveToCity(ns, sleeve, getGymCity(ns, gymName)) &&
        ns.sleeve.setToGymWorkout(sleeve, gymName, gymType)
    ) {
        ns.toast(`Set task train ${gymType} at ${gymName} for sleeve ${sleeve}`, 'info')
    }
}

export function isIdle(ns: NS, sleeve: number): boolean {
    return !ns.sleeve.getTask(sleeve)?.type
}

export function getSleeveCurrentWorkout(ns: NS, sleeve: number): Workout | undefined {
    const task = ns.sleeve.getTask(sleeve)
    return task?.type == 'CLASS' && (
        task.classType == ns.enums.GymType.agility ||
        task.classType == ns.enums.GymType.defense ||
        task.classType == ns.enums.GymType.dexterity ||
        task.classType == ns.enums.GymType.strength
    ) ? {
        gymName: task.location as GymLocationName,
        gymType: task.classType as GymType
    } : undefined
}

export function setToShockRecovery(ns: NS, sleeve: number) {
    if (ns.sleeve.getTask(sleeve)?.type != 'RECOVERY') {
        if (ns.sleeve.setToShockRecovery(sleeve)) {
            ns.toast(`Set task shock recovery for sleeve ${sleeve}`, 'info')
        } else {
            ns.tprint(`Failed to set task shock recovery for sleeve ${sleeve}`)
        }
    }
}

export function setToSynchronize(ns: NS, sleeve: number) {
    if (ns.sleeve.getTask(sleeve)?.type != 'SYNCHRO') {
        if (ns.sleeve.setToSynchronize(sleeve)) {
            ns.toast(`Set task synchronize for sleeve ${sleeve}`, 'info')
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