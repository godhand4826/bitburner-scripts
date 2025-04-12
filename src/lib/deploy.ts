import { NS, RunOptions, ScriptArg } from '@ns';

export function deploy(ns: NS, script: string, host: string, threadOrOptions?: number | RunOptions, ...args: ScriptArg[]) {
    !ns.fileExists(script, host) && ns.scp(script, host, 'home')

    ns.exec(script, host, threadOrOptions, ...args)
}
