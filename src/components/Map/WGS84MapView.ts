import { MapView, MapController } from "deck.gl";
import EPSG4326Viewport from "./EPSG4326Viewport";

export default class WGS84MapView extends MapView {
    static displayName = 'MapView';
  
    get ViewportType() {
      return EPSG4326Viewport;
    }
  
    get ControllerType() {
      return MapController;
    }
  }