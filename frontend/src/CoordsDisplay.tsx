import React from 'react';
import { Coords, prettyPrint, toGeoHackLink } from './coords';
import RoomIcon from '@mui/icons-material/Room';

type CoordsDisplayProps = {
    coords: Coords,
    showingCoords: boolean,
    setShowingCoords: (showingCoords: boolean) => void,
};

const CoordsDisplay: React.FC<CoordsDisplayProps> = ({
    coords,
    showingCoords,
    setShowingCoords,
}) => {
    const lines = prettyPrint(coords);
    const link = toGeoHackLink(coords);

    const showCoordsClick = (e: React.MouseEvent<HTMLElement>) => {
        if (!showingCoords) {
            e.preventDefault();
            setShowingCoords(true);
        }
    }

    return <div className="coords-display controls-section">
        <h2>coordinates</h2>
        <div className="coordinates-row" onClick={showCoordsClick}>
            <RoomIcon fontSize={'large'} className="coords-icon" />

            <p className="align-right">
                {showingCoords ? (
                    <a href={link} target="_blank">
                        {lines[0]}<br/>
                        {lines[1]}
                    </a>
                ) : (
                    <a href="#" onClick={e => e.preventDefault}>
                        show coords
                    </a>
                )}
            </p>
        </div>
    </div>;
};

export default CoordsDisplay;
