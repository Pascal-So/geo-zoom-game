import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Loader } from "@googlemaps/js-api-loader";
import { apiKey, geoApiUrl, mockGoogle } from './vars';

async function main() {
    const loader = new Loader({
        apiKey,
        version: 'beta',
    });

    const [, availableMaps] = await Promise.all([
        mockGoogle ? null : loader.load(),
        fetch(`${geoApiUrl}/available-maps`).then(r => r.json())
    ]);

    ReactDOM.render(
        <React.StrictMode>
            <App availableMaps={availableMaps} />
        </React.StrictMode>,

        document.getElementById('root')
    );
}

main();
