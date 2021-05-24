export type Coords = {
    lat: number,
    lng: number,
};

export function serializeCoords({lat, lng}: Coords): string {
    const prec = 7;
    const lat_s = lat.toString().substr(0, prec);
    const lng_s = lng.toString().substr(0, prec);
    return `${lat_s},${lng_s}`;
}

export enum ViewType {
    Hybrid = 'hybrid',
    Satellite = 'satellite',
};

export type View = {
    coords: Coords,
    zoom: number,
    type: ViewType,
};

export type ApiKey = string;

export enum GameStatus {
    Loading,
    Loaded,
    Error,
};
