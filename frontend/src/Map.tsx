import React from 'react';
import { View, ApiKey, GameStatus, serializeCoords } from './common';
import mapError from './MapError.png';
import mapLoading from './MapLoading.png';

export type MapProps = {
    status: GameStatus,
    view: View,
    apiKey: ApiKey,
};

function generateMapURL(view: View, apiKey: ApiKey) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${serializeCoords(view.coords)}` +
        `&zoom=${view.zoom}&size=640x640&maptype=${view.type}&key=${apiKey}`;
}

function Map(props: MapProps) {
    let imgSrc;

    switch (props.status) {
        case GameStatus.Loading:
            imgSrc = mapLoading;
            break;
        case GameStatus.Error:
            imgSrc = mapError;
            break;
        case GameStatus.Loaded:
            imgSrc = generateMapURL(props.view, props.apiKey);
            break;
    }

    return <img className="map" src={imgSrc} alt="Satellite Imagery"/>;
}

export default Map;
