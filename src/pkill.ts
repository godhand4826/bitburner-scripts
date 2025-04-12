import { AutocompleteData, NS, ScriptArg } from '@ns';
import { pkill } from './lib/remote';

export async function main(ns: NS): Promise<void> {
    const substrings = ns.args as string[]

    if (substrings.length == 0) {
        substrings.push('')
    }

    substrings.forEach(substring => pkill(ns, substring))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return data.processes
        .map(p => p.filename)
        .filter(script => !args.includes(script))
}