import { CityName, GymLocationName, GymType, NS } from "@ns";

export interface Workout {
    gymName: GymLocationName | `${GymLocationName}`,
    gymType: GymType | `${GymType}`,
}

export function getGymCity(
    ns: NS,
    gymName: GymLocationName | `${GymLocationName}`,
): CityName {
    switch (gymName) {
        case ns.enums.LocationName.Sector12IronGym,
            ns.enums.LocationName.Sector12PowerhouseGym:
            return ns.enums.CityName.Sector12
        case ns.enums.LocationName.AevumSnapFitnessGym,
            ns.enums.LocationName.AevumCrushFitnessGym:
            return ns.enums.CityName.Aevum
        case ns.enums.LocationName.VolhavenMilleniumFitnessGym:
            return ns.enums.CityName.Volhaven
        default:
            throw new Error(`unexpected GymLocationName: ${gymName}`)
    }
}