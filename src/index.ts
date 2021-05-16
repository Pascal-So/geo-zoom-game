import formatcoords from 'formatcoords';
import { Loader } from "@googlemaps/js-api-loader";
import {} from 'google.maps';
import { apiKey } from './vars';

type State = {
    coords: Coords,
    zoom: number,
    counter: number,
};

let globalState: State = {
    coords: null,
    zoom: null,
    counter: 0,
};

type Coords = {
    lat: number,
    lng: number
};

function randomInRange(start: number, end: number): number {
    const diff = end - start;
    return Math.random() * diff + start;
}

function coordsToString({lat, lng}: Coords): string {
    const prec = 7;
    const lat_s = lat.toString().substr(0, prec);
    const lng_s = lng.toString().substr(0, prec);
    return `${lat_s},${lng_s}`;
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
    return response.zoom;
}

function generateMapURI(coords: Coords, zoom: number, type: string): string {
    //https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=3&size=640x640&maptype=satellite

    return `https://maps.googleapis.com/maps/api/staticmap?center=${coordsToString(coords)}` +
        `&zoom=${zoom}&size=640x640&maptype=${type}&key=${apiKey}`;
}

function updateMap(coords: Coords, zoom: number, type: string) {
    const mapElement = document.getElementById('map') as HTMLImageElement;

    mapElement.src = generateMapURI(coords, zoom, type);
}

function showSolution() {
    updateMap(globalState.coords, globalState.zoom, 'hybrid');
}

function zoomOut() {
    const minZoom = 2;

    if(globalState.zoom > minZoom){
        globalState.zoom --;
        if(globalState.zoom > 7){
            // double the zoom out speed if zoom > 7
            globalState.zoom --;
        }
        updateMap(globalState.coords, globalState.zoom, 'satellite');
    }
}

function showCoords() {
    const coordsString = formatcoords(globalState.coords).format('DDMMssX', {latLonSeparator: ' '});
    const coordsField = document.getElementById('coords_field');
    coordsField.innerHTML = coordsString;
}

async function logState(state: State) {
    const url = `logger.php?data=${coordsToString(state.coords)},${state.zoom},${state.counter}`;
    await fetch(encodeURI(url));
}

async function startGame() {
    globalState.counter++;
    const coordsField = document.getElementById('coords_field');
    coordsField.innerHTML = '';

    const coords = uniformRandomCoordinates();

    const zoomLevel = await getMaxZoomLevel(coords);

    globalState.coords = coords;
    globalState.zoom = zoomLevel;

    updateMap(globalState.coords, globalState.zoom, 'satellite');
    await logState(globalState);
}

async function main() {
    const loader = new Loader({
        apiKey,
        version: 'beta',
    });
    await loader.load();

    await startGame();
}

const anyWindow = window as any;
anyWindow.showSolution = showSolution;
anyWindow.zoomOut = zoomOut;
anyWindow.showCoords = showCoords;
anyWindow.startGame = startGame;

main();
