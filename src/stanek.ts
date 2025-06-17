import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
    ns.stanek.acceptGift()
    // ns.stanek.clearGift()
    const X = ns.stanek.giftWidth()
    const Y = ns.stanek.giftHeight()

    if (X == 6 && Y == 5) {
        ns.stanek.placeFragment(2, 1, 1, 1)
        ns.stanek.placeFragment(4, 2, 1, 0)
        ns.stanek.placeFragment(0, 1, 1, 6)
        ns.stanek.placeFragment(0, 0, 2, 7)
        ns.stanek.placeFragment(2, 3, 2, 5)
        ns.stanek.placeFragment(4, 0, 0, 21)
        ns.stanek.placeFragment(1, 1, 1, 20)
    } else {
        throw new Error(`unexpected stanek gift size [X, Y] ${X}, ${Y}`)
    }


    for (; ;) {
        for (const f of ns.stanek.activeFragments()) {
            await ns.stanek.chargeFragment(f.x, f.y)
        }
    }
}