import { NS } from '@ns';
import { formatDate, now } from './lib/time';

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')

    const doc = eval('document') as Document;
    const hook0 = doc.getElementById('overview-extra-hook-0') as HTMLDivElement;
    const hook1 = doc.getElementById('overview-extra-hook-1') as HTMLDivElement;

    ns.atExit(() => {
        hook0.innerHTML = '';
        hook1.innerHTML = '';
    });

    for (; ;) {
        const { city, karma, numPeopleKilled, entropy } = ns.getPlayer()

        const metrics = [
            ['time', `${formatDate(now())}`],
            ['city', `${city}`],
            ['karma', `${ns.formatNumber(karma)} / ${ns.formatNumber(-54000)}`],
            ['people killed', `${ns.formatNumber(numPeopleKilled)}`],
            ['entropy', `${ns.formatNumber(entropy)}`],
            ['awake for', `${ns.tFormat(now() - ns.getResetInfo().lastAugReset)}`],
        ]

        hook0.innerHTML = metrics.map(([header,]) => header).join('<br>');
        hook1.innerHTML = metrics.map(([, value]) => value).join('<br>');

        await ns.sleep(1000);
    }
}