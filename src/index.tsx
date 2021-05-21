import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Loader } from "@googlemaps/js-api-loader";
import { apiKey } from './vars';

// type State = {
//     zoom: number,
//     counter: number,
// };

// async function logState(state: State) {
//     const url = `logger.php?data=coords,${state.zoom},${state.counter}`;
//     await fetch(encodeURI(url));
// }

async function main() {
    const loader = new Loader({
        apiKey,
        version: 'beta',
    });
    await loader.load();

    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,

        document.getElementById('root')
    );
}

main();
