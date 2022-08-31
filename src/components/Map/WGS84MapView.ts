import { MapView, MapController } from "deck.gl";
import WGS84Viewport from "./WGS84Viewport";

export default class WGS84MapView extends MapView {
    static displayName = 'MapView';
  
    get ViewportType() {
      return WGS84Viewport;
    }
  
    get ControllerType() {
      return MapController;
    }
  }