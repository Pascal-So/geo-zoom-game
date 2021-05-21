import { View, ViewType, Coords } from './common';

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
    const maxZoomService = new google.maps.MaxZoomService();

    const response = await maxZoomService.getMaxZoomAtLatLng(coords);

    return response?.zoom || 1;
}

export async function generateUniform(): Promise<View> {
    const coords = uniformRandomCoordinates();
    const zoom = await getMaxZoomLevel(coords);
    return {
        coords,
        zoom,
        type: ViewType.Satellite,
    };
}
