import React, { useEffect, useMemo, useState } from 'react';
import { prettyPrint } from './coords';
// import Dropdown, { Option } from 'react-dropdown';
import mapLoading from './img/MapLoading.png';
import { ViewType, imgUrlDictGet, fetchView, imgUrlDictSet, GameState } from './common';
import { googleConfig } from './vars';
import { generate } from './generate';
import update from 'immutability-helper';

type AppProps = {
    availableSpawnMaps: string[],
};

const App: React.FC<AppProps> = ({availableSpawnMaps}) => {
    const [selectedSpawnMap, setSelectedSpawnMap] = useState(availableSpawnMaps[0]);
    const [round, setRound] = useState<GameState | undefined>(undefined);
    const [lastImage, setLastImage] = useState(mapLoading);

    const newRound = async () => {
        setRound(undefined);

        const [currentView, maxZoom] = await generate(selectedSpawnMap);

        setRound({
            currentView,
            maxZoom,
            loadedImages: {},
            showingCoords: false,
        });
    };

    const changeSelectedSpawnMap = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSpawnMap(ev.target.value);
        newRound();
    };

    const toggleCoordinates = () => {
        setRound(r => {
            if (!r) return undefined;

            return update(r, {$toggle: ['showingCoords']});
        });
    };

    const toggleViewType = () => {
        setRound(r => {
            if (!r) return undefined;

            switch (r.currentView.type) {
                case ViewType.Hybrid:
                    return update(r, {currentView: {type: {$set: ViewType.Satellite}}});
                    case ViewType.Satellite:
                        return update(r, {currentView: {type: {$set: ViewType.Hybrid}}});
                    }
                });
            };

            const zoomIn = () => {
                setRound(r => {
                    if (!r) return undefined;

                    const step = r.currentView.zoom >= 8 ? 2 : 1;
                    const newZoom = Math.min(r.currentView.zoom + step, r.maxZoom);

                    return update(r, {currentView: {zoom: {$set: newZoom}}});
                });
            };

            const zoomOut = () => {
                const minZoom = 2;

                setRound(r => {
            if (!r) return undefined;

            const step = r.currentView.zoom >= 10 ? 2 : 1;
            const newZoom = Math.max(r.currentView.zoom - step, minZoom);

            return update(r, {currentView: {zoom: {$set: newZoom}}});
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
            return update(r, {loadedImages: {$set: imgUrlDictSet(r.loadedImages, view, {})}});
        });

        const url = await fetchView(view, googleConfig);

        setRound(r => {
            if (!r) return undefined;
            return update(r, {loadedImages: {$set: imgUrlDictSet(r.loadedImages, view, {url})}});
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

    const [imgSrc, ] = useMemo(() => {
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
        <p className="align-left">The map starts out at a random location at the maximum available zoom level.
        You can zoom out to see how long it takes you to guess what place you're looking at.</p>

        <img className="map" src={imgSrc} alt="Satellite Imagery"/>

        <br/>

        <div className="button" onClick={zoomOut}>Zoom out</div>
        <div className="button" onClick={zoomIn}>Zoom in</div>
        <div className="button" onClick={newRound}>New Round</div>
        <div className="button" onClick={toggleCoordinates}>Coordinates</div>
        <div className="button" onClick={toggleViewType}>Labels</div>

        { round?.showingCoords ? <p>{prettyPrint(round.currentView.coords)}</p> : <><br/><br/></> }

        <select value={selectedSpawnMap} onChange={changeSelectedSpawnMap}>
            { availableSpawnMaps.concat('random').map(m =>
                <option value={m} key={m}>{m}</option>
            ) }
        </select>

        <br/>
    </div>;
};

export default App;
