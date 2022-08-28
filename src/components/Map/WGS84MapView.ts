import { MapView, MapController } from "deck.gl";

export default class WGS84MapView extends MapView {
    static displayName = 'MapView';
  
    get ViewportType() {
      return WebMercatorViewport;
    }
  
    get ControllerType() {
      return MapController;
    }
  }