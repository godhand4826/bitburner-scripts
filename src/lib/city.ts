import { CityName, NS } from "@ns";

export function getCites(ns: NS): CityName[] {
    return [
        ns.enums.CityName.Aevum,
        ns.enums.CityName.Chongqing,
        ns.enums.CityName.Sector12,
        ns.enums.CityName.NewTokyo,
        ns.enums.CityName.Ishima,
        ns.enums.CityName.Volhaven
    ]
}