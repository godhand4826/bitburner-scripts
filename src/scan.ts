import { NS } from '@ns'
import React from './lib/react.js';
import { listAll } from './lib/host.js'
import { run } from './lib/terminal.js';

export async function main(ns: NS): Promise<void> {
    const substring = (ns.args[0] ?? '') as string

    listAll(ns)
        .filter(host => host.includes(substring))
        .forEach(host => {
            const cmd = `ssh ${host}`

            ns.tprintRaw(
                React.createElement("a", {
                    style: { color: 'rgb(0, 204, 0)' },
                    href: `javascript:navigator.clipboard.writeText("${cmd}");`,
                    onClick: () => setTimeout(() => run(cmd), 0),
                }, host)
            )
        });
}