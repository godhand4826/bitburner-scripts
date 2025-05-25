import { NS } from '@ns';
import { forever, now } from './lib/time';
import { TimeTicker } from './dashboard';

import { ReactDOM } from './lib/react'
import React from './lib/react'

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')

    const doc = eval('document') as Document;
    const hook0 = doc.getElementById('overview-extra-hook-0') as HTMLDivElement;
    const hook1 = doc.getElementById('overview-extra-hook-1') as HTMLDivElement;

    ns.atExit(() => {
        ReactDOM.render(<></>, hook0);
        ReactDOM.render(<></>, hook1);
    });

    ReactDOM.render(<>
        <div>city</div>
        <div>karma</div>
        <div>people killed</div>
        <div>entropy</div>
        <div>awake for</div>
    </>, hook0)

    ReactDOM.render(<>
        <TimeTicker interval={1000} render={() => {
            const { city, karma, numPeopleKilled, entropy } = ns.getPlayer()

            return <>
                <div>{city}</div>
                <div>{ns.formatNumber(karma)} / ${ns.formatNumber(-54000)}</div>
                <div>{ns.formatNumber(numPeopleKilled)}</div>
                <div>{ns.formatNumber(entropy)}</div>
                <div>{ns.tFormat(now() - ns.getResetInfo().lastAugReset)}</div>
            </>
        }} />
    </>, hook1)

    await forever()
}