import { toGoogleFormat } from './coords';
import mapBackground from './img/MapBackground.png';
import { View } from './store';
import { googleConfig } from './vars';

/// Get the googlemaps image url for the current view.
export function getViewImgUrl(view: View): string {
    if (googleConfig.mockGoogle) {
        return mapBackground;
    }

    return `https://maps.googleapis.com/maps/api/staticmap?center=${toGoogleFormat(view.coords)}` +
        `&zoom=${view.zoom}&size=640x640&maptype=${view.type}&key=${googleConfig.apiKey}`;
}
