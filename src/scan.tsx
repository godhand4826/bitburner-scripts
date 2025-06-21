import { NS } from '@ns'
import React from './lib/react.js';
import { TimeTicker } from './lib/ui.js';
import { forever } from './lib/time.js';
import { listAll } from './lib/host.js'
import { run } from './lib/terminal.js';
import {
    hackDifficulty, hasAdminRights, isBackdoorInstalled, isFtpPortOpen, isHttpPortOpen,
    isSmtpPortOpen, isSqlPortOpen, isSshPortOpen, maxMoney, minHackDifficulty, moneyAvailable, requiredHackingSkill
} from './lib/hack.js';
import { barString, booleanString } from './lib/tui.js';

export async function main(ns: NS): Promise<void> {
    const substring = (ns.args[0] ?? '') as string

    if (substring !== '') {
        ns.tprintRaw(<Scan ns={ns} substring={substring} />)

        // wait react to render with `ns`
        await ns.asleep(200)
    } else {
        ns.disableLog('ALL')

        ns.atExit(() => ns.ui.closeTail())
        ns.ui.openTail()

        ns.clearLog()
        ns.printRaw(<ScanAnalyze ns={ns} />)

        await forever()
    }
}

export function ScanAnalyze({ ns }: { ns: NS }) {
    const divRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!divRef.current) return;

        const TAIL_WIDTH = 2380
        const TAIL_TOP_MARGIN = 20;
        const TAIL_PADDING = 40;

        ns.ui.moveTail(0, 0);

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const elementHeight = entry.target.getBoundingClientRect().height;
                const [windowWidth, windowHeight] = ns.ui.windowSize()

                ns.ui.resizeTail(
                    Math.min(windowWidth, TAIL_WIDTH),
                    Math.min(windowHeight - TAIL_TOP_MARGIN, elementHeight + TAIL_PADDING),
                );
            }
        });
        observer.observe(divRef.current);

        return () => observer.disconnect();
    }, []);

    return <div ref={divRef}>
        <TimeTicker interval={100} render={() =>
            <Scan ns={ns} doubleColumn={true} />
        } />
    </div>
}

export function Scan({ ns, substring = '', doubleColumn = false }: { ns: NS, substring?: string, doubleColumn?: boolean }) {
    const hosts = listAll(ns)
        .filter(host => host.includes(substring))
        .map(host => <Host ns={ns} host={host} />)

    if (!doubleColumn) {
        return hosts.map(host => <div>{host}</div>)
    } else {
        const half = Math.ceil(hosts.length / 2);
        const left = hosts.slice(0, half);
        const right = hosts.slice(half);
        const rows = [];
        for (let i = 0; i < half; i++) {
            const leftHost = left[i];
            const rightHost = right[i];

            rows.push(<div>
                {leftHost} | {rightHost}
            </div>);
        }

        return <>
            <div style={{ fontSize: "15px" }}>
                {rows}
            </div>
        </>;
    }
}

export function Host({ ns, host }: { ns: NS, host: string }) {
    const cmd = `ssh ${host}`

    const stat = [
        // port
        `${booleanString(isSshPortOpen(ns, host))}` +
        `${booleanString(isFtpPortOpen(ns, host))}` +
        `${booleanString(isSmtpPortOpen(ns, host))}` +
        `${booleanString(isHttpPortOpen(ns, host))}` +
        `${booleanString(isSqlPortOpen(ns, host))}`,
        // root
        `${booleanString(hasAdminRights(ns, host))}`,
        // ram
        `${barString(ns.getServerUsedRam(host), ns.getServerMaxRam(host))}` +
        ` ${ns.formatRam(ns.getServerUsedRam(host)).padStart(8)} / ${ns.formatRam(ns.getServerMaxRam(host)).padStart(8)}`,
        // required hacking skill
        `${requiredHackingSkill(ns, host).toString().padStart(4)}`,
        // backdoor
        `${booleanString(isBackdoorInstalled(ns, host))}`,
        // security
        `${Math.round(hackDifficulty(ns, host)).toString().padStart(3)} / ${minHackDifficulty(ns, host).toString().padStart(2)}`,
        // money
        `${barString(moneyAvailable(ns, host), maxMoney(ns, host))}` +
        ` ${ns.formatNumber(moneyAvailable(ns, host)).padStart(8)} / ${ns.formatNumber(maxMoney(ns, host)).padStart(8)}`,
    ]

    const text = ' '.repeat(18 - host.length) + stat.join(', ')

    return <span>
        <a style={{ color: 'rgb(0, 204, 0)' }} href={`javascript:navigator.clipboard.writeText("${cmd}");`} onClick={() => setTimeout(() => run(cmd), 0)}>{host}</a>
        <span> {text}</span>
    </span>
}