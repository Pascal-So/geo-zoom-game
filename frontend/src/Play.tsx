import { useEffect, useMemo, useState } from 'react';
import mapLoading from './img/MapLoading.png';
import { imgUrlDictGet, fetchView, imgUrlDictSet, GameState } from './common';
import { googleConfig } from './vars';
import { generate } from './generate';
import update from 'immutability-helper';
import MapIcon from '@mui/icons-material/Map';
import RoomIcon from '@mui/icons-material/Room';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

type PlayProps = {
    spawnMap: string,
    selectNewSpawnMap: () => void,
};

function Play({ spawnMap, selectNewSpawnMap }: PlayProps) {
    const [round, setRound] = useState<GameState | undefined>(undefined);
    const [lastImage, setLastImage] = useState(mapLoading);
    const [showViewTypeSelector, setShowViewTypeSelector] = useState(false);

    const newRound = async () => {
        setRound(undefined);

        const [currentView, maxZoom] = await generate(spawnMap);

        setRound({
            currentView,
            maxZoom,
            loadedImages: {},
            showingCoords: false,
        });
    };

    const toggleCoordinates = () => {
        setRound(r => {
            if (!r) return undefined;

            return update(r, { $toggle: ['showingCoords'] });
        });
    };

    const zoomIn = () => {
        setRound(r => {
            if (!r) return undefined;

            const step = r.currentView.zoom >= 8 ? 2 : 1;
            const newZoom = Math.min(r.currentView.zoom + step, r.maxZoom);

            return update(r, { currentView: { zoom: { $set: newZoom } } });
        });
    };

    const zoomOut = () => {
        const minZoom = 2;

        setRound(r => {
            if (!r) return undefined;

            const step = r.currentView.zoom >= 10 ? 2 : 1;
            const newZoom = Math.max(r.currentView.zoom - step, minZoom);

            return update(r, { currentView: { zoom: { $set: newZoom } } });
        });
    };

    const loadImage = async () => {
        if (!round) return;

        const view = round.currentView;

        // Has the loading of this entry already started?
        if (imgUrlDictGet(round.loadedImages, view))
            return;

        setRound(r => {
            if (!r) return undefined;
            return update(r, { loadedImages: { $set: imgUrlDictSet(r.loadedImages, view, {}) } });
        });

        const url = await fetchView(view, googleConfig);

        setRound(r => {
            if (!r) return undefined;
            return update(r, { loadedImages: { $set: imgUrlDictSet(r.loadedImages, view, { url }) } });
        });
    };

    useEffect(() => {
        loadImage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [round?.currentView])

    useEffect(() => {
        // start first round
        newRound();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [imgSrc,] = useMemo(() => {
        const current = !!round
            ? imgUrlDictGet(round.loadedImages, round.currentView)?.url
            : undefined;

        if (current) {
            setLastImage(current);
            return [current, false];
        } else {
            return [lastImage, true];
        }
    }, [round, lastImage]);

    return <div>
        <img className="map" src={imgSrc} alt="Satellite Imagery" />

        <br />

        <div className="zoom-controls" onClick={zoomOut}>
            <div className="button">
                <ZoomOutIcon fontSize='large' />
                <br />
                <p>Zoom Out</p>
            </div>
            <div className="button" onClick={zoomIn}>
                <ZoomInIcon fontSize='large' />
                <br />
                <p>Zoom In</p>
            </div>
        </div>

        <div className="controls">
            <div className="button" style={{ position: "relative" }} onClick={toggleCoordinates}>
                <RoomIcon fontSize='large' />
                <br />
                <p>Coordinates</p>
            </div>
            <div className="button" onClick={() => { setShowViewTypeSelector(true) }}>
                <MapIcon fontSize='large' />
                <br />
                <p>View Type</p>
            </div>
            <div className="button" onClick={selectNewSpawnMap}>Change Map</div>
        </div>

        <br />
    </div>;
};

export default Play;
