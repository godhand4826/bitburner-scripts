import { CityName, NS } from '@ns';
import { getBudget } from './money';
import { k } from './const';

export const airlineTicketPrice = 200 * k

export function travelToCity(ns: NS, city: CityName | `${CityName}`): boolean {
    if (
        ns.getPlayer().city != city &&
        getBudget(ns) >= airlineTicketPrice &&
        ns.singularity.travelToCity(city)
    ) {
        ns.tprint(`Traveled to ${city}`)
    }
    return ns.getPlayer().city == city
}