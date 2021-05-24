import React from 'react';
import { Coords } from './common';
import formatcoords from 'formatcoords';

export type CoordsDisplayProps = {
    coords: Coords,
};

function CoordsDisplay(props: CoordsDisplayProps) {
    const coordsString = formatcoords(props.coords)
        .format('DDMMssX', {latLonSeparator: ' '});

    return <p>{ coordsString }</p>;
}

export default CoordsDisplay;
