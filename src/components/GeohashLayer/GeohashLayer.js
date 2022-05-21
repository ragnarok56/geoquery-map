import GeoCellLayer from '@deck.gl/geo-layers/src/geo-cell-layer/GeoCellLayer'
import { decode_bbox } from 'ngeohash'

function getGeohashPolygon(geohash) {
    const [s, w, n, e] = decode_bbox(geohash);

    return [e, n, e, s, w, s, w, n, e, n];
}

const defaultProps = {
    getGeohash: { type: 'accessor', value: d => d.geohash }
};

export default class GeohashLayer extends GeoCellLayer {
    indexToBounds() {
        const { data, getGeohash } = this.props;

        return {
            data,
            _normalize: false,
            positionFormat: 'XY',
            getPolygon: (x, objectInfo) => getGeohashPolygon(getGeohash(x, objectInfo))
        }
    }
}

GeohashLayer.layerName = 'GeohashLayer';
GeohashLayer.defaultProps = defaultProps;