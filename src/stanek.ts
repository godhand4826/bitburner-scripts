import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
    ns.stanek.acceptGift()
    // ns.stanek.clearGift()
    const X = ns.stanek.giftWidth()
    const Y = ns.stanek.giftHeight()

    if (X == 6 && Y == 5) {
        ns.stanek.placeFragment(4, 2, 1, 0)
        ns.stanek.placeFragment(2, 1, 1, 1)
        ns.stanek.placeFragment(2, 3, 2, 5)
        ns.stanek.placeFragment(0, 1, 1, 6)
        ns.stanek.placeFragment(0, 0, 2, 7)
        ns.stanek.placeFragment(1, 1, 1, 20)
        ns.stanek.placeFragment(4, 0, 0, 21)
    } else if (X == 6 && Y == 6) {
        ns.stanek.placeFragment(0, 3, 0, 0)
        ns.stanek.placeFragment(0, 0, 1, 1)
        ns.stanek.placeFragment(1, 1, 2, 5)
        ns.stanek.placeFragment(0, 5, 0, 6)
        ns.stanek.placeFragment(2, 0, 2, 7)
        ns.stanek.placeFragment(5, 0, 1, 20)
        ns.stanek.placeFragment(4, 4, 0, 21)
        ns.stanek.placeFragment(2, 2, 0, 105)
    } else if (X == 7 && Y == 6) {
        ns.stanek.placeFragment(4, 0, 1, 0)
        ns.stanek.placeFragment(2, 3, 3, 5)
        ns.stanek.placeFragment(1, 2, 1, 6)
        ns.stanek.placeFragment(1, 0, 2, 7)
        ns.stanek.placeFragment(0, 2, 1, 20)
        ns.stanek.placeFragment(3, 2, 0, 21)
        ns.stanek.placeFragment(5, 3, 3, 25)
        ns.stanek.placeFragment(5, 0, 3, 28)
        ns.stanek.placeFragment(0, 0, 1, 104)
        ns.stanek.placeFragment(3, 3, 0, 105)
    } else {
        throw new Error(`unexpected stanek gift size [X, Y] ${X}, ${Y}`)
    }

    for (; ;) {
        for (const f of ns.stanek.activeFragments()) {
            // skip booster fragments
            if (f.id >= 100) {
                continue
            }

            await ns.stanek.chargeFragment(f.x, f.y)
        }
    }
}