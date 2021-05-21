import React from 'react';
import Map from './Map';
import CoordsDisplay from './CoordsDisplay';
import { View, ViewType, GameStatus } from './common';
import { apiKey } from './vars';
import { generateUniform } from './generate';
import update from 'immutability-helper';

type AppState = {
    view: View,
    showingCoords: boolean,
    status: GameStatus,
};

type AppProps = {};

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state = {
            view: {
                coords: {lat: 0, lng: 0},
                zoom: 1,
                type: ViewType.Satellite,
            },
            showingCoords: false,
            status: GameStatus.Loading,
        };

        this.newGame = this.newGame.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.showCoords = this.showCoords.bind(this);
        this.showMapLabels = this.showMapLabels.bind(this);
    }

    componentDidMount() {
        console.log('mounted');
        this.newGame();
    }

    async newGame() {
        const view = await generateUniform();

        this.setState({
            view,
            showingCoords: true,
            status: GameStatus.Loaded,
        });
    }

    zoomOut() {
        const minZoom = 2;

        this.setState(state => {
            let newZoom = state.view.zoom;

            if(newZoom > minZoom){
                newZoom --;
                if(newZoom > 7){
                    // double the zoom out speed if zoom > 7
                    newZoom --;
                }
            }

            return update(state, {view: {zoom: {$set: newZoom}}});
        });
    }

    showCoords() {
        this.setState(state => update(state, {showingCoords: {$set: true}}));
    }

    showMapLabels() {
        this.setState(state => update(state, {view: {type: {$set: ViewType.Hybrid}}}));
    }

    render() {
        return <div>
            <p className="align-left">The map starts out at a random location, at the maximum available zoom level.
            You can zoom out to see how long it takes you to guess what place you're looking at.</p>

            <Map
                status={this.state.status}
                view={this.state.view}
                apiKey={apiKey}
            />

            <br/>

            <div className="button" onClick={this.zoomOut}>Zoom out</div>
            <div className="button" onClick={this.newGame}>Restart</div>
            <div className="button" onClick={this.showCoords}>Coordinates</div>
            <div className="button" onClick={this.showMapLabels}>Labels</div>

            { this.state.showingCoords ? <CoordsDisplay coords={this.state.view.coords}/> : null }
            <br/>
        </div>;
    }
}

export default App;
