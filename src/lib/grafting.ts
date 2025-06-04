import { NS } from "@ns";
import { formatTime, now } from "./time";
import { getBudget } from "./money";
import { travelToCity } from "./travel";

export function list(ns: NS, onlyPurchasable = false): string[] {
    const budget = getBudget(ns)

    return ns.grafting.getGraftableAugmentations()
        .filter(augName => !onlyPurchasable || ns.grafting.getAugmentationGraftPrice(augName) <= budget)
}

export async function autoGrafting(ns: NS) {
    if (getCurrentGraft(ns)) {
        await ns.grafting.waitForOngoingGrafting()
    } else {
        const augs = list(ns, true)
        if (augs.length > 0) {
            await grafting(ns, augs[0])
        }
    }
}

export async function grafting(
    ns: NS,
    augName: string,
    focus = ns.singularity.isFocused(),
): Promise<void> {
    if (graft(ns, augName, focus)) {
        await ns.grafting.waitForOngoingGrafting()
    }
    return
}

export function graft(
    ns: NS,
    augName: string,
    focus = ns.singularity.isFocused(),
): boolean {
    const graftTime = ns.grafting.getAugmentationGraftTime(augName)

    if (
        getCurrentGraft(ns) != augName &&
        travelToCity(ns, 'New Tokyo') &&
        ns.grafting.graftAugmentation(augName, focus)) {
        ns.toast(`Grafting ${augName} will complete ` +
            `in ${ns.tFormat(graftTime)} at ${formatTime(now() + graftTime)}`, 'info', graftTime + 2000)

        return true
    }
    return false
}

export function getCurrentGraft(ns: NS): string | undefined {
    const work = ns.singularity.getCurrentWork()
    return work?.type == 'GRAFTING' ? work.augmentation : undefined
}