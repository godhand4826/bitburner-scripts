import { AutocompleteData, NS, ScriptArg } from '@ns';
import { autoResetBoard, isGameEnd, play } from './lib/go';

export async function main(ns: NS): Promise<void> {
    const debug = (ns.args[0] ?? false) as boolean

    let wins = 0
    let total = 0
    const winRate = () => total > 0 ? wins / total : 0

    ns.atExit(() => ns.toast(`${wins} wins out of ${total} with a ${ns.formatPercent(winRate())} win rate`))

    for (; ;) {
        if (isGameEnd(ns)) {
            autoResetBoard(ns)
        }

        const isWin = await play(ns, debug)

        wins += Number(isWin)
        total += 1
        ns.print(`${wins} wins out of ${total} with a ${ns.formatPercent(winRate())} win rate`)
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return ['true']
}