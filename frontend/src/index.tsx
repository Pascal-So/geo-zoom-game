import { createRoot } from 'react-dom/client';
import './index.css';
import Play from './Play';
import { Loader } from "@googlemaps/js-api-loader";
import { googleConfig } from './vars';
import { store } from './store';
import { Provider } from 'react-redux';

async function main() {
    if (!googleConfig.mockGoogle) {
        await new Loader({
            apiKey: googleConfig.apiKey,
            version: 'beta', // todo: fix a version
        }).load();
    }

    const root = createRoot(document.getElementById('root')!);
    root.render(<Provider store={store}>
        <Play />
    </Provider>);
}

main();
