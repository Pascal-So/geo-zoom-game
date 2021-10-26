import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Play from './Play';
import { Loader } from "@googlemaps/js-api-loader";
import { googleConfig, geoApiUrl } from './vars';
import MapSelector from './MapSelector';

import mapGlobal from './img/map-global.png';
import mapUrban from './img/map-urban.png';

function App() {
    const [spawnMap, setSpawnMap] = useState<string | undefined>(undefined);

    if (spawnMap) {
        return <Play
            spawnMap={spawnMap}
            selectNewSpawnMap={() => { setSpawnMap(undefined) }}
        />;
    } else {
        return <MapSelector
            selectMap={setSpawnMap}
            availableMaps={[
                {
                    img: mapGlobal,
                    map: 'global',
                },
                {
                    img: mapUrban,
                    map: 'urban',
                },
            ]}
        />;
    }
}

async function main() {
    const loader = new Loader({
        apiKey: googleConfig.apiKey,
        version: 'beta',
    });

    const [, availableMaps] = await Promise.all([
        googleConfig.mockGoogle ? null : loader.load(),
        fetch(`${geoApiUrl}/available-maps`).then(r => r.json())
    ]);

    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,

        document.getElementById('root')
    );
}

main();
