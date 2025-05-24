import { NS } from '@ns';
import { disableLogs } from './lib/log';

export async function main(ns: NS): Promise<void> {
    disableLogs(ns, 'sleep', 'hasTorRouter', 'singularity.getDarkwebProgramCost', 'singularity.getDarkwebPrograms')

    while (!ns.hasTorRouter()) {
        if (ns.singularity.purchaseTor()) {
            ns.toast(`You have purchased TOR Router`)

            break
        }

        await ns.sleep(2000)
    }


    while (!ns.singularity.getDarkwebPrograms().every(p => ns.fileExists(p))) {
        const programs = ns.singularity.getDarkwebPrograms()
            .filter(program => !ns.fileExists(program))
            .sort((p1, p2) => ns.singularity.getDarkwebProgramCost(p1) - ns.singularity.getDarkwebProgramCost(p2))

        for (const program of programs) {
            if (ns.singularity.purchaseProgram(program)) {
                ns.toast(`You have purchased the ${program} program`)
            }
        }

        await ns.sleep(2000)
    }
}