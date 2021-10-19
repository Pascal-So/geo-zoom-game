import React from 'react';
import { ViewType, viewTypeImage } from './common';

type ViewTypeSelectorProps = {
    viewType: string,
    setViewType: (viewType: ViewType) => void,
};

const ViewTypeSelector: React.FC<ViewTypeSelectorProps> = ({
    viewType,
    setViewType,
}) => {
    return <div className="controls-section">
        <h2>view type</h2>

        { Object.values(ViewType).map(vt => (
            <img src={viewTypeImage(vt)}
                title={vt}
                key={vt}
                className={ 'viewtype-option ' + (viewType === vt ? 'viewtype-selected' : '') }
                onClick={ () => setViewType(vt) } />
        )) }
    </div>;
};

export default ViewTypeSelector;
