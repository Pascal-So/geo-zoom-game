import { View, ViewType, Coords } from './common';
import { geoApiUrl, mockGoogle } from './vars';

function randomInRange(start: number, end: number): number {
    const diff = end - start;
    return Math.random() * diff + start;
}

// http://mathworld.wolfram.com/SpherePointPicking.html
function uniformRandomCoordinates(): Coords {
    const lower = -0.866025403; // cut south at -60 deg
    const upper = 0.994522; // cut north at 84 deg

    const lat = (-Math.acos(randomInRange(lower, upper)) + Math.PI/2) * 180 / Math.PI;
    const lng = randomInRange(-180, 180);

    return {lat, lng};
}

async function getMaxZoomLevel(coords: Coords): Promise<number> {
    if (mockGoogle) {
        return 10;
    }

    const maxZoomService = new google.maps.MaxZoomService();

    const response = await maxZoomService.getMaxZoomAtLatLng(coords);

    return response?.zoom || 1;
}

async function fetchCoords(map: string): Promise<Coords> {
    const {x, y} = await fetch(`${geoApiUrl}/play-map/${map}`)
        .then(r => r.json());

    return {
        lat: y,
        lng: x
    };
}

export async function generate(map: string): Promise<View> {
    let coords;

    if (map === 'random') {
        coords = uniformRandomCoordinates();
    } else {
        coords = await fetchCoords(map);
    }

    const zoom = await getMaxZoomLevel(coords);
    return {
        coords,
        zoom,
        type: ViewType.Satellite,
    };
}
