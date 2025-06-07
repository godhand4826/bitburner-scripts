import { CityName, NS, UniversityClassType, UniversityLocationName } from '@ns';
import { travelToCity } from './travel';

export function setCourse(ns: NS,
    universityName: UniversityLocationName | `${UniversityLocationName}`,
    courseName: UniversityClassType | `${UniversityClassType}`,
    focus = ns.singularity.isFocused(),
) {
    const course = getCurrentCourse(ns)
    if (
        (course?.universityName != universityName || course?.courseName != courseName) &&
        travelToCity(ns, getUniversityCity(ns, universityName)) &&
        ns.singularity.universityCourse(universityName, courseName, focus)
    ) {
        ns.tprint(`Started ${courseName} at ${universityName}`)
    }
}

export interface Course {
    universityName: UniversityLocationName | `${UniversityLocationName}`,
    courseName: UniversityClassType | `${UniversityClassType}`,
}

export function getCurrentCourse(ns: NS): Course | undefined {
    const work = ns.singularity.getCurrentWork()
    return work?.type == 'CLASS' ? {
        universityName: work.location as UniversityLocationName,
        courseName: work.classType as UniversityClassType,
    } : undefined
}

export function getUniversityCity(
    ns: NS,
    university: UniversityLocationName | `${UniversityLocationName}`
): CityName {
    switch (university) {
        case ns.enums.LocationName.AevumSummitUniversity:
            return ns.enums.CityName.Aevum
        case ns.enums.LocationName.Sector12RothmanUniversity:
            return ns.enums.CityName.Sector12
        case ns.enums.LocationName.VolhavenZBInstituteOfTechnology:
            return ns.enums.CityName.Volhaven
        default:
            throw new Error(`unexpected UniversityLocationName: ${university}`)
    }
}