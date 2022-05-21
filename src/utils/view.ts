import { WebMercatorViewport } from "deck.gl";

function checkLat(value) {
    if (value >= -90 && value <= 90)
        return value
    else
        return value < -90 ? -90 : 90
}

function checkLon(value) {
    if (value >= -180 && value <= 180)
        return value
    else
        return value < -180 ? -180 : 180
}

function getCorner(viewport, coord) {
    const [lon, lat] = viewport.unproject(coord);
    return [checkLon(lon), checkLat(lat)]
}

export function getViewBoundsClipped(viewState) {
    const viewport = new WebMercatorViewport(viewState);

    const cUL = getCorner(viewport, [0, 0])
    const cUR = getCorner(viewport, [viewport.width, 0])
    const cLR = getCorner(viewport, [viewport.width, viewport.height])
    const cLL = getCorner(viewport, [0, viewport.height])

    return [cUL, cUR, cLR, cLL, cUL]
}