import { configureStore, createSelector } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import mapLoading from './img/MapLoading.png';
import type { PayloadAction } from '@reduxjs/toolkit'
import { Coords, viewDiagonal } from './coords';
import { getViewImgUrl } from './common';

export enum ViewType {
    Hybrid = 'hybrid',
    Satellite = 'satellite',
};

export interface View {
    coords: Coords,
    zoom: number,
    type: ViewType,
    spawnMap: string,
}

export interface HistoryItem {
    view: View,
    maxZoom: number,
    spawnMap: string,
    finishData?: {
        viewDiagonal: number,
    },
}

export interface GameState {
    view?: View,
    maxZoom: number,
    viewHistory: HistoryItem[],
    replayingHistory: boolean,
    showingCoords: boolean,
}

const initialState: GameState = {
    maxZoom: 0,
    viewHistory: [],
    replayingHistory: false,
    showingCoords: false,
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        zoomOut: (state) => {
            const minZoom = 2;
            if (state.view) {
                const step = state.view.zoom >= 10 ? 2 : 1;
                state.view.zoom = Math.max(state.view.zoom - step, minZoom);
            }
        },
        zoomIn: (state) => {
            if (state.view) {
                const step = state.view.zoom >= 8 ? 2 : 1;
                state.view.zoom = Math.min(state.view.zoom + step, state.maxZoom);
            }
        },
        setLabels: (state, action: PayloadAction<boolean>) => {
            if (state.view) {
                state.view.type = action.payload ? ViewType.Hybrid : ViewType.Satellite;
            }
        },
        finishRound: (state) => {
            const currentView = state.view;
            state.view = undefined;

            if (state.replayingHistory || !currentView || state.viewHistory.length === 0) {
                return;
            }
            state.viewHistory[state.viewHistory.length - 1].finishData = {
                viewDiagonal: viewDiagonal(currentView.coords, currentView.zoom),
            };
        },
        replayRound: (state, action: PayloadAction<number>) => {
            const nr = action.payload;
            if (nr >= state.viewHistory.length) {
                console.error(`replay round idx out of bounds: ${nr} >= ${state.viewHistory.length}`);
                return;
            }

            const item = state.viewHistory[nr];
            state.view = item.view;
            state.maxZoom = item.maxZoom;
            state.replayingHistory = true;
            state.showingCoords = false;
        },
        setNewRound: (state, action: PayloadAction<[View, number, string]>) => {
            const [newView, maxZoom, spawnMap] = action.payload;
            state.view = newView;
            state.maxZoom = maxZoom;
            state.replayingHistory = false;
            state.showingCoords = false;
            state.viewHistory.push({
                view: newView,
                maxZoom,
                spawnMap,
            });
        },
    },
})


export const { zoomOut, zoomIn, setLabels, finishRound, replayRound, setNewRound } = gameSlice.actions

export const store = configureStore({
    reducer: gameSlice.reducer,
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const selectImgSrc = createSelector((state: RootState) => state.view, view => {
    if (!view) {
        return mapLoading;
    } else {
        return getViewImgUrl(view);
    }
});

export const selectHistory = (state: RootState) => state.viewHistory;
