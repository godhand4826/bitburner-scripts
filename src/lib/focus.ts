import { NS } from '@ns';
import { setCourse } from './course';
import { crimeForKarmaAndKill } from './crime';
import { hasSimulacrum } from './bladeburner';
import { autoGrafting, list } from './grafting';

export async function autoSetAction(ns: NS) {
    if (ns.getPlayer().skills.hacking < 100) {
        setCourse(ns, 'Rothman University', 'Computer Science')
    } else if (!ns.gang.inGang() && ns.getPlayer().karma > -54000) {
        crimeForKarmaAndKill(ns, true)
    } else if (!hasSimulacrum(ns)) {
        // Release focus to allow bladeburner.js to take over and
        // farm reputation for Simulacrum
        stopAction(ns)
    } else if(list(ns, true).length > 0) {
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