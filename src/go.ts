import { AutocompleteData, NS, ScriptArg } from '@ns';
import { autoResetBoard, isGameEnd, play } from './lib/go';

export async function main(ns: NS): Promise<void> {
    const debug = (ns.args[0] ?? false) as boolean

    let wins = 0
    let winStreak = 0
    let total = 0
    const winRate = () => total > 0 ? wins / total : 0

    ns.atExit(() => ns.toast(`${wins} wins out of ${total} with a ${ns.formatPercent(winRate())} win rate`))

    for (; ;) {
        if (isGameEnd(ns)) {
            autoResetBoard(ns)
        }

        const isWin = await play(ns, debug)

        wins += Number(isWin)
        winStreak += isWin ? 1 : -winStreak
        total += 1

        ns.print(`${wins} wins out of ${total} with a ${ns.formatPercent(winRate())} win rate`)
        const outcome = isWin ? 'Win' : 'Loss'
        const opponent = ns.go.getOpponent()
        const streak = winStreak > 1 ? ` (${winStreak} win streak)` : ''
        const result = `${outcome} vs ${opponent} • ${wins}/${total} ${ns.formatPercent(winRate())} win rate${streak}`
        ns.toast(result, 'info')
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return ['true']
}