import { NS } from '@ns';
import { setCourse } from './course';
import { autoSetCrimeForMoney, setCrime } from './crime';
import { hasSimulacrum } from './bladeburner';
import { autoGrafting, list } from './grafting';

export async function autoSetAction(ns: NS, enableGrafting = false) {
    const p = ns.getPlayer()
    if (p.numPeopleKilled < 30) {
        autoSetCrimeForMoney(ns)
    } else if (ns.getPlayer().skills.hacking < 100) {
        setCourse(ns, 'Rothman University', 'Computer Science')
    } else if (!ns.gang.inGang() && ns.getPlayer().karma > -54000) {
        setCrime(ns, ns.enums.CrimeType.homicide)
    } else if (!hasSimulacrum(ns)) {
        // Release focus to allow bladeburner.js to take over and
        // farm reputation for Simulacrum
        stopAction(ns)
    } else if (enableGrafting && list(ns, true).length > 0) {
        await autoGrafting(ns)
    } else {
        setCourse(ns, 'ZB Institute of Technology', 'Algorithms')
    }
}

export async function stopAction(ns: NS) {
    if (ns.singularity.isBusy()) {
        ns.singularity.stopAction()
    }
}