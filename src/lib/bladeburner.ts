import { BladeburnerActionName, BladeburnerActionType, BladeburnerSkillName, NS } from '@ns';
import { formatTime, now } from './time';

export const HighChaosThreshold = 50

export function hasSimulacrum(ns: NS): boolean {
    return ns.singularity.getOwnedAugmentations().includes("The Blade's Simulacrum")
}

export function getStaminaPercentage(ns: NS) {
    const [current, max] = ns.bladeburner.getStamina();
    return current / max;
}

export function hasStaminaPenalty(ns: NS): boolean {
    return getStaminaPercentage(ns) < 0.5;
}

export function getCityChaos(ns: NS): number {
    return ns.bladeburner.getCityChaos(ns.bladeburner.getCity())
}

export function upgradeSkills(ns: NS) {
    if (ns.bladeburner.getSkillLevel('Overclock') < 90) {
        upgradeSkill(ns, 'Overclock')
    } else {
        ns.bladeburner.getSkillNames()
            .sort((a, b) => ns.bladeburner.getSkillLevel(a) - ns.bladeburner.getSkillLevel(b))
            .forEach(skill => upgradeSkill(ns, skill))
    }
}

export function getOperationTimeReduction(ns: NS): number {
    return ns.bladeburner.getSkillLevel('Overclock') * 0.01;
}

export function upgradeSkill(ns: NS, skill: BladeburnerSkillName | `${BladeburnerSkillName}`) {
    if (
        ns.bladeburner.getSkillUpgradeCost(skill) <= ns.bladeburner.getSkillPoints() &&
        ns.bladeburner.upgradeSkill(skill)) {
        ns.toast(`${skill} level upgraded to ${ns.bladeburner.getSkillLevel(skill)}`)
    }
}

export function autoStartActions(ns: NS) {
    // avoid interrupting tasks that have been running for a while
    if (ns.bladeburner.getActionCurrentTime() > 5000) {
        return
    }

    if (hasRequiredRankForNextBlackOp(ns) && getActionMinSuccessChance(ns, getNextBlackOpName(ns)) == 1) {
        setAction(ns, getNextBlackOpName(ns))
    } else if (hasActionRemaining(ns, 'Assassination') && getActionMinSuccessChance(ns, 'Assassination') == 1) {
        setAction(ns, 'Assassination')
    } else if (hasActionRemaining(ns, 'Retirement') && getActionMinSuccessChance(ns, 'Retirement') == 1) {
        setAction(ns, 'Retirement')
    } else if (hasStaminaPenalty(ns)) {
        setAction(ns, 'Hyperbolic Regeneration Chamber')
    } else if (getCityChaos(ns) >= HighChaosThreshold) {
        setAction(ns, 'Diplomacy')
    } else {
        setAction(ns, 'Training')
    }
}

export function setAction(ns: NS, name: BladeburnerActionName | `${BladeburnerActionName}` | '') {
    if (getCurrentAction(ns) == name) {
        return
    }

    if (name == '') {
        ns.bladeburner.stopBladeburnerAction()
        return
    }

    const typ = getActionType(name)
    const opTime = getActionTime(ns, name)
    if (ns.bladeburner.startAction(typ, name)) {
        if (typ == 'Black Operations') {
            ns.toast(`${name} will complete in ${ns.tFormat(opTime)}` +
                ` at ${formatTime(now() + opTime)}`,
                'info', opTime)
        }
    } else {
        ns.tprint(`Failed to set action ${name}`)
    }
}

export function getCurrentAction(ns: NS): string {
    return ns.bladeburner.getCurrentAction()?.name ?? '';
}

export function getActionMinSuccessChance(ns: NS, name: BladeburnerActionName | `${BladeburnerActionName}` | ''): number {
    return getActionSuccessChance(ns, name)[0]
}

export function getActionMaxSuccessChance(ns: NS, name: BladeburnerActionName | `${BladeburnerActionName}` | ''): number {
    return getActionSuccessChance(ns, name)[1]
}

export function getActionSuccessChance(ns: NS, name: BladeburnerActionName | `${BladeburnerActionName}` | ''): number[] {
    return name == '' ? [0, 0] : ns.bladeburner.getActionEstimatedSuccessChance(getActionType(name), name)
}

export function getActionCountRemaining(ns: NS, name: BladeburnerActionName | `${BladeburnerActionName}`): number {
    return ns.bladeburner.getActionCountRemaining(getActionType(name), name)
}

export function hasActionRemaining(ns: NS, name: BladeburnerActionName | `${BladeburnerActionName}`): boolean {
    return getActionCountRemaining(ns, name) >= 1
}

export function hasRequiredRankForNextBlackOp(ns: NS): boolean {
    const requiredRank = getNextBlackOpRequiredRank(ns)
    const currentRank = ns.bladeburner.getRank()
    return currentRank >= requiredRank
}

export function getNextBlackOpRequiredRank(ns: NS): number {
    return ns.bladeburner.getNextBlackOp()?.rank ?? Infinity
}

export function getNextBlackOpName(ns: NS): BladeburnerActionName | `${BladeburnerActionName}` | '' {
    return ns.bladeburner.getNextBlackOp()?.name ?? ''
}

export function getActionTime(ns: NS, name: BladeburnerActionName | `${BladeburnerActionName}`): number {
    return ns.bladeburner.getActionTime(getActionType(name), name)
}

export function getActionType(name: BladeburnerActionName | `${BladeburnerActionName}`): BladeburnerActionType | `${BladeburnerActionType}` {
    return toActionType.get(name) ?? 'General'
}

export const toActionType = new Map<
    BladeburnerActionName | `${BladeburnerActionName}`,
    BladeburnerActionType | `${BladeburnerActionType}`
>();
// General
toActionType.set('Training', 'General');
toActionType.set('Field Analysis', 'General')
toActionType.set('Recruitment', 'General')
toActionType.set('Diplomacy', 'General')
toActionType.set('Hyperbolic Regeneration Chamber', 'General')
toActionType.set('Incite Violence', 'General')
// Contracts
toActionType.set('Tracking', 'Contracts')
toActionType.set('Bounty Hunter', 'Contracts')
toActionType.set('Retirement', 'Contracts')
// Operations
toActionType.set('Investigation', 'Operations')
toActionType.set('Undercover Operation', 'Operations')
toActionType.set('Sting Operation', 'Operations')
toActionType.set('Raid', 'Operations')
toActionType.set('Stealth Retirement Operation', 'Operations')
toActionType.set('Assassination', 'Operations')
// Black Operations
toActionType.set('Operation Typhoon', 'Black Operations')
toActionType.set('Operation Zero', 'Black Operations')
toActionType.set('Operation X', 'Black Operations')
toActionType.set('Operation Titan', 'Black Operations')
toActionType.set('Operation Ares', 'Black Operations')
toActionType.set('Operation Archangel', 'Black Operations')
toActionType.set('Operation Juggernaut', 'Black Operations')
toActionType.set('Operation Red Dragon', 'Black Operations')
toActionType.set('Operation K', 'Black Operations')
toActionType.set('Operation Deckard', 'Black Operations')
toActionType.set('Operation Tyrell', 'Black Operations')
toActionType.set('Operation Wallace', 'Black Operations')
toActionType.set('Operation Shoulder of Orion', 'Black Operations')
toActionType.set('Operation Hyron', 'Black Operations')
toActionType.set('Operation Morpheus', 'Black Operations')
toActionType.set('Operation Ion Storm', 'Black Operations')
toActionType.set('Operation Annihilus', 'Black Operations')
toActionType.set('Operation Ultron', 'Black Operations')
toActionType.set('Operation Centurion', 'Black Operations')
toActionType.set('Operation Vindictus', 'Black Operations')
toActionType.set('Operation Daedalus', 'Black Operations')
