import { AutocompleteData, NS, ScriptArg } from '@ns';
import { kill } from './lib/remote';

export async function main(ns: NS): Promise<void> {
    const pids = ns.args as number[]

    kill(ns, ...pids)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return data.processes
        .map(p => p.pid)
        .filter(pid => !args.includes(pid))
}