import { NS } from '@ns';
import { setCourse } from './course';
import { crimeForKarmaAndKill } from './crime';
import { hasSimulacrum } from './bladeburner';

export async function autoSetAction(ns: NS) {
    if (ns.getPlayer().skills.hacking < 100) {
        setCourse(ns, 'Rothman University', 'Computer Science')
    } else if (!ns.gang.inGang()) {
        crimeForKarmaAndKill(ns, true)
    } else if (!hasSimulacrum(ns)) {
        // Release focus to allow bladeburner.js to take over and
        // farm reputation for Simulacrum
        stopAction(ns)
    } else {
        setCourse(ns, 'ZB Institute of Technology', 'Computer Science')
    }
}

export async function stopAction(ns: NS) {
    if (ns.singularity.isBusy()) {
        ns.singularity.stopAction()
    }
}