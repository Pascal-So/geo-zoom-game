export type Coords = {
    lat: number,
    lng: number,
};

function toDMS({ lat, lng }: Coords): [number, number, number, string, number, number, number, string] {
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
    return `${latD}°${latM}′${Math.floor(latS)}″${latL} ${lngD}°${lngM}′${Math.floor(lngS)}″${lngL}`;
}

export function toGoogleFormat({ lat, lng }: Coords): string {
    const prec = 7;
    const lat_s = lat.toString().substring(0, prec);
    const lng_s = lng.toString().substring(0, prec);
    return `${lat_s},${lng_s}`;
}

export function toGeoHackLink(coords: Coords): string {
    const [latD, latM, latS, latL, lngD, lngM, lngS, lngL] = toDMS(coords);
    return `https://geohack.toolforge.org/geohack.php?params=${latD}_${latM}_${latS}_${latL}_${lngD}_${lngM}_${lngS}_${lngL}`;
}

export function toGoogleMapsLink(coords: Coords): string {
    return `https://www.google.com/maps/place/${toGoogleFormat(coords)}`;
}


// https://stackoverflow.com/a/23463262
function fromPointToLatLng(x: number, y: number): Coords {
    return {
        lat: (2 * Math.atan(Math.exp((y - 0.5) / -(0.5 / Math.PI))) - Math.PI / 2) / (Math.PI / 180),
        lng: (x - 0.5) / (1 / 360)
    };
}

// https://stackoverflow.com/a/23463262
function fromLatLngToPoint(c: Coords): [number, number] {
    const siny = Math.min(Math.max(Math.sin(c.lat * (Math.PI / 180)), -.9999), .9999);
    return [
        0.5 + c.lng * (1 / 360),
        0.5 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(1 / (2 * Math.PI))
    ];
}

// Return the distance between two coordinates in kilometers.
// https://stackoverflow.com/a/18883819
function haversine(c1: Coords, c2: Coords): number {
    const toRad = (x: number) => x * Math.PI / 180;

    const R = 6371;
    const dLat = toRad(c2.lat - c1.lat);
    const dLon = toRad(c2.lng - c1.lng);
    const lat1 = toRad(c1.lat);
    const lat2 = toRad(c2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate the distance of the diagonal when viewing a map with a given zoom level
// For now this seems to slightly underrestimate the distance, but I'm not sure why.
// Looks like the a and b coordinates are too close to the center.
export function viewDiagonal(c: Coords, zoom: number): number {
    const width = Math.pow(0.5, zoom);
    const [x, y] = fromLatLngToPoint(c);
    const a = fromPointToLatLng(x - width, y - width);
    const b = fromPointToLatLng(x + width, y + width);
    const dist = haversine(a, b);
    return dist;
}
