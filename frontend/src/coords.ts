export type Coords = {
    lat: number,
    lng: number,
};

function toDMS({lat, lng}: Coords): [number, number, number, string, number, number, number, string] {
    const latL = lat > 0 ? 'N' : 'S';
    lat = Math.abs(lat);
    const latD = Math.floor(lat);
    const latM = Math.floor((lat - latD) * 60);
    const latS = (lat - latD - latM / 60) * 3600;

    const lngL = lng > 0 ? 'E' : 'W';
    lng = Math.abs(lng);
    const lngD = Math.floor(lng);
    const lngM = Math.floor((lng - lngD) * 60);
    const lngS = (lng - lngD - lngM / 60) * 3600;

    return [latD, latM, latS, latL, lngD, lngM, lngS, lngL];
}

export function prettyPrint(coords: Coords): string {
    const [latD, latM, latS, latL, lngD, lngM, lngS, lngL] = toDMS(coords);
    return `${latD}° ${latM}′ ${Math.floor(latS)}″ ${latL} ${lngD}° ${lngM}′ ${Math.floor(lngS)}″ ${lngL}`;
}

export function toGoogleFormat({lat, lng}: Coords): string {
    const prec = 7;
    const lat_s = lat.toString().substr(0, prec);
    const lng_s = lng.toString().substr(0, prec);
    return `${lat_s},${lng_s}`;
}

export function toGeoHackFormat(coords: Coords): string {
    const [latD, latM, latS, latL, lngD, lngM, lngS, lngL] = toDMS(coords);
    return `${latD}_${latM}_${latS}_${latL}_${lngD}_${lngM}_${lngS}_${lngL}`;
}
