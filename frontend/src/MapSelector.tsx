type MapSelectorProps = {
    selectMap: (map: string) => void,
    availableMaps: {
        map: string,
        img: string,
    }[]
};

function MapSelector({
    selectMap,
    availableMaps,
}: MapSelectorProps) {
    return <div>
        <p className="align-left">
            The map starts out at a random location at the maximum available zoom level.
            You can zoom out to see how long it takes you to guess what place you're looking at.
        </p>

        <br />
        <br />
        <br />
        <p>Select a map:</p>
        <div className="map-list">
            {availableMaps.map(m => (
                <div
                    className={'map-option'}
                    key={m.map}
                    onClick={() => selectMap(m.map)} >
                    <img src={m.img}
                        alt={`example location for map type ${m.map}`}
                        title={m.map} />
                    <p>{m.map}</p>
                </div>
            ))}
        </div>
    </div>;
};

export default MapSelector;
