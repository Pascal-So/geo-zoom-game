import update from 'immutability-helper';
import { Coords, toGoogleFormat } from './coords';
import mapBackground from './img/MapBackground.png';

import viewTypeHybridImage from './img/viewtype-hybrid.png';
import viewTypeSatelliteImage from './img/viewtype-satellite.png';


export enum ViewType {
    Hybrid = 'hybrid',
    Satellite = 'satellite',
};

export function viewTypeImage(vt: ViewType): string {
    switch (vt) {
        case ViewType.Hybrid:
            return viewTypeHybridImage;
        case ViewType.Satellite:
            return viewTypeSatelliteImage;
    }
}

export type View = {
    coords: Coords,
    zoom: number,
    type: ViewType,
};

export type GameState = {
    currentView: View,
    maxZoom: number,
    loadedImages: ImgUrlDict,
    showingCoords: boolean,
    lastImg?: string,
};

export type GoogleConfig = {
    apiKey: string,
    mockGoogle: boolean,
};

/**
 * Undefined `url` means the image is still loading.
 */
export type ImgUrl = {url?: string};

/**
 * Dict from zoom level and view type to the object url for the google maps image.
 */
export type ImgUrlDict = { [zoom: number]: { [viewType in ViewType]?: ImgUrl } };

type DictKey = Pick<View, 'zoom' | 'type'>;

export function imgUrlDictGet(dict: ImgUrlDict, view: DictKey): ImgUrl | undefined {
    return dict[view.zoom]?.[view.type];
}

export function imgUrlDictSet(dict: ImgUrlDict, view: DictKey, url: ImgUrl): ImgUrlDict {
    return update(dict, {[view.zoom]: typedict => update(typedict || {}, {[view.type]: {$set: url}})});
}

export async function fetchView(view: View, conf: GoogleConfig): Promise<string> {
    if (conf.mockGoogle) {
        return new Promise(resolve => {
            window.setTimeout(() => resolve(mapBackground), 500);
        });
    }

    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${toGoogleFormat(view.coords)}` +
    `&zoom=${view.zoom}&size=640x640&maptype=${view.type}&key=${conf.apiKey}`;

    const response = await fetch(url);
    return URL.createObjectURL(await response.blob());
}
