import { MapView, MapController } from "deck.gl";
import { OrbitView } from '@deck.gl/core'
import WGS84Viewport from "./WGS84Viewport";
import EPSG4326Viewport from "./EPSG4326Viewport";

// @ts-ignore
// const orbitViewPort = new OrbitView().ViewportType
// console.log(orbitViewPort)

export default class WGS84MapView extends MapView {
    static displayName = 'MapView';
  
    get ViewportType() {
      return EPSG4326Viewport;
    }
  
    get ControllerType() {
      return MapController;
    }
  }