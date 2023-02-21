import { MapView, MapController } from "deck.gl";
// import { OrbitView, OrthographicView } from '@deck.gl/core'
// import OrthographicViewport from '@deck.gl/core/src/viewports/orthographic-viewport'
import WGS84Viewport from "./WGS84Viewport";
import EPSG4326Viewport from "./EPSG4326Viewport";
import OrthographicViewport from "./OrthographicViewport";

// @ts-ignore
// const orbitViewPort = new OrbitView().ViewportType
// console.log(orbitViewPort)


export default class WGS84MapView extends MapView {
    static displayName = 'MapView';
  
    get ViewportType() {
      return OrthographicViewport;
    }
  
    get ControllerType() {
      return MapController;
    }
  }