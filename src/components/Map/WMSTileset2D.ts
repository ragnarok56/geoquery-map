// @ts-ignore
import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers/typed';
import { Viewport } from '@deck.gl/core/typed';
import { Matrix4 } from '@math.gl/core'

type Bounds = [minX: number, minY: number, maxX: number, maxY: number];
type TileIndex = {x: number; y: number; z: number};
type ZRange = [minZ: number, maxZ: number]
const TILE_SIZE = 512
const DEFAULT_EXTENT: Bounds = [-Infinity, -Infinity, Infinity, Infinity]

function tileToBoundingBox(coords: any) {
    var map = this._map,
        tileSize = this.getTileSize(),
        nwPoint = coords.scaleBy(tileSize),
        sePoint = nwPoint.add(tileSize),
        nw = map.unproject(nwPoint, coords.z),
        se = map.unproject(sePoint, coords.z);
    return [nw, se];
}

function getBoundingBox(viewport: Viewport, zRange: number[] | null, extent: Bounds): Bounds {
    let bounds;
    if (zRange && zRange.length === 2) {
      const [minZ, maxZ] = zRange;
      // @ts-ignore
      const bounds0 = viewport.getBounds({z: minZ});
      // @ts-ignore
      const bounds1 = viewport.getBounds({z: maxZ});
      bounds = [
        Math.min(bounds0[0], bounds1[0]),
        Math.min(bounds0[1], bounds1[1]),
        Math.max(bounds0[2], bounds1[2]),
        Math.max(bounds0[3], bounds1[3])
      ];
    } else {
        // @ts-ignore
      bounds = viewport.getBounds();
    }
    if (!viewport.isGeospatial) {
      return [
        // Top corner should not be more then bottom corner in either direction
        Math.max(Math.min(bounds[0], extent[2]), extent[0]),
        Math.max(Math.min(bounds[1], extent[3]), extent[1]),
        // Bottom corner should not be less then top corner in either direction
        Math.min(Math.max(bounds[2], extent[0]), extent[2]),
        Math.min(Math.max(bounds[3], extent[1]), extent[3])
      ];
    }
    return [
      Math.max(bounds[0], extent[0]),
      Math.max(bounds[1], extent[1]),
      Math.min(bounds[2], extent[2]),
      Math.min(bounds[3], extent[3])
    ];
  }

function getScale(z: number, tileSize: number): number {
    return (Math.pow(2, z) * TILE_SIZE) / tileSize;
}


function transformBox(bbox: Bounds, modelMatrix: Matrix4): Bounds {
    const transformedCoords = [
        // added null as 2nd arg
      // top-left
      modelMatrix.transformAsPoint([bbox[0], bbox[1]], null),
      // top-right
      modelMatrix.transformAsPoint([bbox[2], bbox[1]], null),
      // bottom-left
      modelMatrix.transformAsPoint([bbox[0], bbox[3]], null),
      // bottom-right
      modelMatrix.transformAsPoint([bbox[2], bbox[3]], null)
    ];
    const transformedBox: Bounds = [
      // Minimum x coord
      Math.min(...transformedCoords.map(i => i[0])),
      // Minimum y coord
      Math.min(...transformedCoords.map(i => i[1])),
      // Max x coord
      Math.max(...transformedCoords.map(i => i[0])),
      // Max y coord
      Math.max(...transformedCoords.map(i => i[1]))
    ];
    return transformedBox;
  }

function getIndexingCoords(bbox: Bounds, scale: number, modelMatrixInverse?: Matrix4): Bounds {
    if (modelMatrixInverse) {
      const transformedTileIndex = transformBox(bbox, modelMatrixInverse).map(
        i => (i * scale) / TILE_SIZE
      );
      return transformedTileIndex as Bounds;
    }
    return bbox.map(i => (i * scale) / TILE_SIZE) as Bounds;
  }

function getIdentityTileIndices(
    viewport: Viewport,
    z: number,
    tileSize: number,
    extent: Bounds,
    modelMatrixInverse?: Matrix4
  ) {
    const bbox = getBoundingBox(viewport, null, extent);
    const scale = getScale(z, tileSize);
    const [minX, minY, maxX, maxY] = getIndexingCoords(bbox, scale, modelMatrixInverse);
    console.log(bbox, scale)
    const indices: TileIndex[] = [];
  
    /*
        |  TILE  |  TILE  |  TILE  |
          |(minX)            |(maxX)
     */
    for (let x = Math.floor(minX); x < maxX; x++) {
      for (let y = Math.floor(minY); y < maxY; y++) {
        indices.push({x, y, z});
      }
    }
    return indices;
  }


// goal is to be able to return wms tiles by some kind of bounding box
// instead of OSM indices so the tiles requested can be sane
// and not bound by OSM/web mercator nonsense
export default class WMSTileset2D extends Tileset2D {
  getTileIndices({viewport,
    maxZoom,
    minZoom,
    zRange,
    extent,
    tileSize = TILE_SIZE,
    modelMatrix,
    modelMatrixInverse,
    zoomOffset = 0
  }: {
    viewport: Viewport;
    maxZoom?: number;
    minZoom?: number;
    zRange: ZRange | undefined;
    extent?: Bounds;
    tileSize?: number;
    modelMatrix?: Matrix4;
    modelMatrixInverse?: Matrix4;
    zoomOffset?: number;
  }) {
    let z = viewport.isGeospatial
        ? Math.round(viewport.zoom + Math.log2(TILE_SIZE / tileSize)) + zoomOffset
        : Math.ceil(viewport.zoom) + zoomOffset;
    if (typeof minZoom === 'number' && Number.isFinite(minZoom) && z < minZoom) {
        if (!extent) {
        return [];
        }
        z = minZoom;
    }
    if (typeof maxZoom === 'number' && Number.isFinite(maxZoom) && z > maxZoom) {
        z = maxZoom;
    }
    let transformedExtent = extent;
    if (modelMatrix && modelMatrixInverse && extent && !viewport.isGeospatial) {
        transformedExtent = transformBox(extent, modelMatrix);
    }
    const result = getIdentityTileIndices(
        viewport,
        z,
        tileSize,
        transformedExtent || DEFAULT_EXTENT,
        modelMatrixInverse
    );
    result.map(x => console.log(x))
    // console.log(result)
    return result
  }

  getTileId(q) {
    console.log('getTileId', q)
    return q;
  }

  getTileMetadata(opts) {
    console.log('getTileMetadata', opts)
    return {};
  }

  getTileZoom(q) {
    console.log('getTileZoom', q)
    return q.length;
  }

//   getParentIndex(index) {
//     // const q = index.q.slice(0, -1);
//     // return {q};
//     return null
//   }
}
