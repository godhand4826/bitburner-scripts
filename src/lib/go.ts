import { GoOpponent, NS } from '@ns';
import { disableLogs } from './log';

export async function play(ns: NS, debug = false): Promise<boolean> {
    let result;
    do {
        // waiting for my turn
        await ns.go.opponentNextTurn()

        // generate list of move candidates, ranked by priority
        const moves = await calculateNextMoves(ns, debug)

        if (debug) {
            ns.ui.openTail()
            disableLogs(ns, 'sleep', 'disableLog')
            await ns.sleep(500)
            continue // skip actual move, just show board
        }

        // make move
        if (moves.length == 0) {
            // pass turn
            result = await ns.go.passTurn()
        } else if (moves.length >= 2 && ns.go.cheat.getCheatSuccessChance() == 1) {
            // cheat move: play best-ranked move and another random move
            const [x, y] = moves[0]
            const nonEdge = moves.slice(1).filter(([x, y]) =>
                x != 0 && x != getBoardSize(ns) - 1 &&
                y != 0 && y != getBoardSize(ns) - 1)
            const [x2, y2] = nonEdge.length > 0 ?
                nonEdge[Math.floor(Math.random() * nonEdge.length)] :
                moves[1 + Math.floor(Math.random() * (moves.length - 1))]
            result = await ns.go.cheat.playTwoMoves(x, y, x2, y2)
        } else {
            // normal move: play best-ranked move
            const [x, y] = moves[0]
            result = await ns.go.makeMove(x, y)
        }

        // end game if already winning to settle the game
        if (result?.type == 'pass' && ns.go.getGameState().blackScore > ns.go.getGameState().whiteScore) {
            result = await ns.go.passTurn()
        }
    } while (!isGameEnd(ns))

    return ns.go.getGameState().blackScore > ns.go.getGameState().whiteScore
}

export async function calculateNextMoves(ns: NS, debug = false): Promise<number[][]> {
    // only handle black move
    if (ns.go.getGameState().currentPlayer == 'White') {
        return []
    }

    // load the board state
    const board = ns.go.getBoardState()
    const boardSize = board.length

    // analyze api
    const isValidMoves = ns.go.analysis.getValidMoves()
    const controlledEmptyNodes = ns.go.analysis.getControlledEmptyNodes()
    const liberties = ns.go.analysis.getLiberties()
    const chains = ns.go.analysis.getChains()

    // additional chain info
    const chainsSize = Array(boardSize * boardSize).fill(0)
    const chainsLiberties = Array(boardSize * boardSize).fill(0)
    for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
            const chainId = chains[x][y];
            if (chainId !== null) {
                chainsSize[chainId] += 1;
                chainsLiberties[chainId] = liberties[x][y];
            }
        }
    }

    // helper functions
    function captured(x: number, y: number, target: string): [number, number] {
        let count = 0;
        const capturedTargetChains = new Set();
        const adjacentTargetChains = new Set();
        for (const [dx, dy] of [[+1, +0], [-1, +0], [+0, +1], [+0, -1]]) {
            const [nx, ny] = [x + dx, y + dy]

            if (0 <= nx && nx < boardSize &&
                0 <= ny && ny < boardSize &&
                board[nx][ny] == target
            ) {
                const chainId = chains[nx][ny]
                if (liberties[nx][ny] == 1 && chainId != null && !capturedTargetChains.has(chainId)) {
                    capturedTargetChains.add(chainId)
                    count += chainsSize[chainId]
                }
                adjacentTargetChains.add(chainId)
            }
        }
        return [count, adjacentTargetChains.size]
    }
    function centerDistance(x: number, y: number) {
        const center = (boardSize - 1) / 2;
        const dx = Math.abs(x - center);
        const dy = Math.abs(y - center);
        return Math.sqrt(dx ** 2 + dy ** 2);
    }

    // calculate the best move
    const moveInfo = Array(boardSize).fill(null)
        .map(() => Array(boardSize).fill({ kill: 0, escape: 0, reduceLiberty: 0, extendLiberty: 0 }))
    const moves = []
    for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
            if (isValidMoves[x][y]) {
                const [kill, reduceLiberty] = captured(x, y, 'O')
                const [escape, extendLiberty] = captured(x, y, 'X')

                moveInfo[x][y] = { x, y, kill, escape, reduceLiberty, extendLiberty }
                moves.push([x, y])
            }
        }
    }
    moves.sort(([x, y], [x2, y2]) =>
        -(moveInfo[x][y].kill - moveInfo[x2][y2].kill) ||
        -(moveInfo[x][y].escape - moveInfo[x2][y2].escape) ||
        -(moveInfo[x][y].reduceLiberty - moveInfo[x2][y2].reduceLiberty) ||
        -(moveInfo[x][y].extendLiberty - moveInfo[x2][y2].extendLiberty) ||
        centerDistance(x, y) - centerDistance(x2, y2)
    )
    moves.forEach(([x, y], i) => moveInfo[x][y].rank = i)

    if (!debug) {
        return moves
    }

    function gradient(index: number, total: number): string {
        const progress = index / (total - 1)
        const hue = 270
        const saturation = 90 - progress * 40
        const lightness = 30 + progress * 30
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }

    for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
            const text: string[] = []

            const ctrl = controlledEmptyNodes[x][y]
            const color = moveInfo[x][y].kill > 0 ? 'red' :
                moveInfo[x][y].escape > 0 ? 'green' :
                    isValidMoves[x][y] ? gradient(moveInfo[x][y].rank, moves.length) :
                        ctrl == 'X' ? 'black' :
                            ctrl == 'O' ? 'white' :
                                'none'

            if (isValidMoves[x][y]) {
                const rank = moveInfo[x][y].rank
                text.push(`#${rank + 1}`)
            }

            const chainId = chains[x][y]
            if (board[x][y] != '.' && chainId !== null) {
                text.push(`⚑:${chainsSize[chainId]}`)
                text.push(`♥:${chainsLiberties[chainId]}`)
            }

            ns.go.analysis.highlightPoint(x, y, color, text.join(' '))
        }
    }

    return moves
}

export function resetBoard(
    ns: NS,
    opponent = ns.go.getOpponent(),
    boardSize = ns.go.getBoardState().length as 5 | 7 | 9 | 13
) {
    ns.go.resetBoardState(opponent, boardSize)
}

export function autoResetBoard(ns: NS) {
    if (getBonusPercent(ns, 'Netburners') < 1.20) {
        resetBoard(ns, 'Netburners', 5)
    } else if (getSafeCheats(ns) < 4) {
        resetBoard(ns, 'Slum Snakes', 5)
    } else if (getBonusPercent(ns, 'Daedalus') < 3.00) {
        resetBoard(ns, 'Daedalus', 5)
    } else if (getBonusPercent(ns, 'Tetrads') < 1.00) {
        resetBoard(ns, 'Tetrads', 5)
    } else if (getBonusPercent(ns, 'The Black Hand') < getBonusPercent(ns, 'Illuminati')) {
        resetBoard(ns, 'The Black Hand', 5)
    } else {
        resetBoard(ns, 'Illuminati', 5)
    }
}

export function isGameEnd(ns: NS): boolean {
    return ns.go.getGameState().currentPlayer == 'None'
}

export function getBoardSize(ns: NS): number {
    return ns.go.getBoardState().length
}

export function simulateState(ns: NS, x: number, y: number, piece = 'X', board = ns.go.getBoardState()): string[] {
    const matrix = board.map(row => row.split(''))
    matrix[x][y] = piece
    return matrix.map(row => row.join(''))
}

let maxAttempted = 0;
// Determines the total number of risk-free cheats you can perform in a game
export function getSafeCheats(ns: NS): number {
    const largeStep = 1
    const smallStep = 0.001

    // `maxAttempted` might not reset to zero after installing augmentations
    if (ns.go.cheat.getCheatSuccessChance(maxAttempted) < 1) {
        maxAttempted = 0
    }

    while (ns.go.cheat.getCheatSuccessChance(maxAttempted + largeStep) === 1) {
        maxAttempted += largeStep;
    }
    while (ns.go.cheat.getCheatSuccessChance(maxAttempted + smallStep) === 1) {
        maxAttempted += smallStep;
    }

    // the next one is still guaranteed to succeed, 
    // we can safely cheat one more time
    return maxAttempted + 1;
}

export function getBonusPercent(ns: NS, opponent: GoOpponent): number {
    return (ns.go.analysis.getStats()[opponent]?.bonusPercent ?? 0) / 100
}