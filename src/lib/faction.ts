import { NS } from '@ns';
import { pkill } from './remote';

export function autoJoinFaction(ns: NS) {
    for (const faction of ns.singularity.checkFactionInvitations()) {
        if (ns.singularity.joinFaction(faction)) {
            ns.tprint(`You have joined the '${faction}' faction`)
        }
    }
}

export function getFactions(ns: NS): string[] {
    return [
        ns.enums.FactionName.Illuminati,
        ns.enums.FactionName.Daedalus,
        ns.enums.FactionName.TheCovenant,
        ns.enums.FactionName.ECorp,
        ns.enums.FactionName.MegaCorp,
        ns.enums.FactionName.BachmanAssociates,
        ns.enums.FactionName.BladeIndustries,
        ns.enums.FactionName.NWO,
        ns.enums.FactionName.ClarkeIncorporated,
        ns.enums.FactionName.OmniTekIncorporated,
        ns.enums.FactionName.FourSigma,
        ns.enums.FactionName.KuaiGongInternational,
        ns.enums.FactionName.FulcrumSecretTechnologies,
        ns.enums.FactionName.BitRunners,
        ns.enums.FactionName.TheBlackHand,
        ns.enums.FactionName.NiteSec,
        ns.enums.FactionName.Aevum,
        ns.enums.FactionName.Chongqing,
        ns.enums.FactionName.Ishima,
        ns.enums.FactionName.NewTokyo,
        ns.enums.FactionName.Sector12,
        ns.enums.FactionName.Volhaven,
        ns.enums.FactionName.SpeakersForTheDead,
        ns.enums.FactionName.TheDarkArmy,
        ns.enums.FactionName.TheSyndicate,
        ns.enums.FactionName.Silhouette,
        ns.enums.FactionName.Tetrads,
        ns.enums.FactionName.SlumSnakes,
        ns.enums.FactionName.Netburners,
        ns.enums.FactionName.TianDiHui,
        ns.enums.FactionName.CyberSec,
        ns.enums.FactionName.Bladeburners,
        ns.enums.FactionName.ChurchOfTheMachineGod,
        ns.enums.FactionName.ShadowsOfAnarchy,
    ]
}

const NeuroFluxGovernor = 'NeuroFlux Governor'

export function autoPurchaseAugmentation(ns: NS) {
    for (const faction of getFactions(ns)) {
        for (const augmentation of ns.singularity.getAugmentationsFromFaction(faction)) {
            if (augmentation != NeuroFluxGovernor && ns.singularity.purchaseAugmentation(faction, augmentation)) {
                ns.tprint(`You have purchased ${augmentation} from ${faction}`)
            }
        }
    }
}

export function installNeuroFluxGovernor(ns: NS) {
    const factions = getFactions(ns)
        .sort((a, b) => ns.singularity.getFactionFavor(a) - ns.singularity.getFactionFavor(b))

    for (const faction of factions) {
        while (ns.singularity.purchaseAugmentation(faction, NeuroFluxGovernor)) {
            ns.tprint(`You have purchased ${NeuroFluxGovernor} from ${faction}`)
        }
    }
}

export function autoInstallAugmentations(ns: NS, queuedLimit = 5) {
    if (queuedAugmentations(ns) < queuedLimit) {
        return
    }

    pkill(ns) // close stock position for money
    autoPurchaseAugmentation(ns)
    installNeuroFluxGovernor(ns)
    ns.singularity.installAugmentations('main.js')
}

export function queuedAugmentations(ns: NS): number {
    return ns.singularity.getOwnedAugmentations(true).length -
        ns.singularity.getOwnedAugmentations(false).length
}