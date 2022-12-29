import { Coords } from './coords';
import { View, ViewType } from './store';
import { geoApiUrl, googleConfig } from './vars';

async function getMaxZoomLevel(coords: Coords): Promise<number> {
    if (googleConfig.mockGoogle) {
        return 10;
    }

    const maxZoomService = new google.maps.MaxZoomService();

    const response = await maxZoomService.getMaxZoomAtLatLng(coords);

    return response?.zoom || 1;
}

async function fetchCoords(spawnMap: string): Promise<Coords> {
    const res = await fetch(`${geoApiUrl}/play-map/${spawnMap}`);
    if (!res.ok) {
        const json = await res.json();
        const reason = json?.reason || res.statusText;
        throw `Could not fetch coordinates: ${reason}`;
    }

    const { x, y } = await res.json();
    if (!x || !y) {
        throw `Received invalid coordinate format from server.`
    }

    return { lat: y, lng: x };
}

export async function generate(spawnMap: string): Promise<[View, number]> {
    const spawnMapSlug = spawnMap.toLowerCase().replaceAll(' ', '');
    const coords = await fetchCoords(spawnMapSlug);

    const zoom = await getMaxZoomLevel(coords);
    return [
        {
            coords,
            zoom,
            type: ViewType.Satellite,
            spawnMap,
        },
        zoom,
    ];
}
