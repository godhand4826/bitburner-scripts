import { NS, AutocompleteData, ScriptArg } from '@ns';
import { run } from './lib/cron';

export async function main(ns: NS): Promise<void> {
    const sleep = ns.args[0] as number
    const script = ns.args[1] as string
    const scriptArgs = ns.args.slice(2)

    ns.tprint(`Exec ${script} ${JSON.stringify(scriptArgs)} every ${ns.tFormat(sleep)}`)
    await run(ns, sleep, script, scriptArgs)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return data.scripts
}