
// import {_Tileset2D as Tileset2D } from '@deck.gl/geo-layers/typed';
// import { Tileset2DProps } from '@deck.gl/geo-layers/typed/tile-layer/tileset-2d';

// type WMSTileIndex = { x: number, y: number, z: number }

// function tileToBoundingBox({x, y, z}: WMSTileIndex) {
//     var map = this._map,
//         tileSize = this.getTileSize(),
//         nwPoint = coords.scaleBy(tileSize),
//         sePoint = nwPoint.add(tileSize),
//         nw = map.unproject(nwPoint, coords.z),
//         se = map.unproject(sePoint, coords.z);
//     return [nw, se];
// }



// export default class WMSTileset2D extends Tileset2D {

//     getTileMetadata(index: WMSTileIndex) {
//       return {bbox: tileToBoundingBox(index)};
//     }

//     setOptions(opts: Tileset2DProps): void {

//     }
  
//     // @ts-expect-error Tileset2D should be generic over TileIndex
//     // getTileZoom({i}: H3TileIndex): number {
//     //   return h3GetResolution(i);
//     // }
  
//     // // @ts-expect-error Tileset2D should be generic over TileIndex
//     // getParentIndex(index: H3TileIndex): H3TileIndex {
//     //   const resolution = h3GetResolution(index.i);
//     //   const i = h3ToParent(index.i, resolution - 1);
//     //   return {i};
//     // }
//   }