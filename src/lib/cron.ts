import { NS, ScriptArg } from '@ns';

export async function run(ns: NS, sleep: number, script: string, scriptArgs: ScriptArg[]) {
    for (; ;) {
        // forbid concurrent execution
        if (!ns.isRunning(script, 'home', ...scriptArgs)) {
            ns.exec(script, 'home', { threads: 1 }, ...scriptArgs);
        }

        await ns.sleep(sleep)
    }
}