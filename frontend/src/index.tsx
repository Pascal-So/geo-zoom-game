import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Loader } from "@googlemaps/js-api-loader";
import { googleConfig, geoApiUrl } from './vars';

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
            <App availableSpawnMaps={availableMaps} />
        </React.StrictMode>,

        document.getElementById('root')
    );
}

main();
