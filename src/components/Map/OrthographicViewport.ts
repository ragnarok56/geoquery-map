
import { Viewport } from '@deck.gl/core';

import {Matrix4, clamp} from '@math.gl/core';
import {pixelsToWorld} from '@math.gl/web-mercator';
import * as vec2 from 'gl-matrix/vec2';

type Padding = {
    left?: number;
    right?: number;
    top?: number;q
    bottom?: number;
  };
type DistanceScales = {
unitsPerMeter: number[]
metersPerUnit: number[]
unitsPerDegree: number[]
degreesPerUnit: number[];
};
const PROJECTION_MODE = {
    /**
     * Render geospatial data in Web Mercator projection
     */
    WEB_MERCATOR: 1,
    /**
     * Render geospatial data as a 3D globe
     */
    GLOBE: 2,
  
    /**
     * (Internal use only) Web Mercator projection at high zoom
     */
    WEB_MERCATOR_AUTO_OFFSET: 4,
  
    /**
     * No transformation
     */
    IDENTITY: 0
  } as const;

//@ts-ignore
const viewMatrix = new Matrix4().lookAt({eye: [0, 0, 1]});
const DEFAULT_DISTANCE_SCALES: DistanceScales = {
    unitsPerMeter: [1, 1, 1],
    metersPerUnit: [1, 1, 1],
    unitsPerDegree: [1, 1, 1],
    degreesPerUnit: [1, 1, 1]
  };
function getProjectionMatrix({
  width,
  height,
  near,
  far,
  padding
}: {
  width: number;
  height: number;
  near: number;
  far: number;
  padding: Padding | null;
}) {
  let left = -width / 2;
  let right = width / 2;
  let bottom = -height / 2;
  let top = height / 2;
  if (padding) {
    const {left: l = 0, right: r = 0, top: t = 0, bottom: b = 0} = padding;
    const offsetX = clamp((l + width - r) / 2, 0, width) - width / 2;
    const offsetY = clamp((t + height - b) / 2, 0, height) - height / 2;
    left -= offsetX;
    right -= offsetX;
    bottom += offsetY;
    top += offsetY;
  }

  return new Matrix4().ortho({
    left,
    right,
    bottom,
    top,
    near,
    far
  });
}

export type OrthographicViewportOptions = {
  /** Name of the viewport */
  id?: string;
  /** Left offset from the canvas edge, in pixels */
  x?: number;
  /** Top offset from the canvas edge, in pixels */
  y?: number;
  /** Viewport width in pixels */
  width?: number;
  /** Viewport height in pixels */
  height?: number;
  /** Longitude in degrees */
  longitude?: number;
  /** Latitude in degrees */
  latitude?: number;
  /** Tilt of the camera in degrees */
  pitch?: number;
  /** Heading of the camera in degrees */
  bearing?: number;
  /** Camera altitude relative to the viewport height, legacy property used to control the FOV. Default `1.5` */
  altitude?: number;
  /** Viewport center in world space. If geospatial, refers to meter offsets from lng, lat */
  position?: number[];
  /**  The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large.
   *   To apply independent zoom levels to the X and Y axes, supply an array `[zoomX, zoomY]`. Default `0`. */
  zoom?: number | [number, number];
  /** Padding around the viewport, in pixels. */
  padding?: Padding | null;
  /** Distance of near clipping plane. Default `0.1`. */
  near?: number;
  /** Distance of far clipping plane. Default `1000`. */
  far?: number;
  /** Whether to use top-left coordinates (`true`) or bottom-left coordinates (`false`). Default `true`. */
  flipY?: boolean;
};

export default class OrthographicViewport extends Viewport {
  constructor(props: OrthographicViewportOptions) {
    const {
      width,
      height,
      near = 0.1,
      far = 1000,
      zoom = 0,
      position = [0, 0, 0],
      padding = null,
      flipY = true
    } = props;
    const zoomX = Array.isArray(zoom) ? zoom[0] : zoom;
    const zoomY = Array.isArray(zoom) ? zoom[1] : zoom;
    const zoom_ = Math.min(zoomX, zoomY);
    const scale = Math.pow(2, zoom_);

    let distanceScales = DEFAULT_DISTANCE_SCALES;
    if (zoomX !== zoomY) {
      const scaleX = Math.pow(2, zoomX);
      const scaleY = Math.pow(2, zoomY);

      distanceScales = {
        unitsPerMeter: [scaleX / scale, scaleY / scale, 1],
        metersPerUnit: [scale / scaleX, scale / scaleY, 1],
        unitsPerDegree: [scaleX / scale, scaleY / scale, 1],
        degreesPerUnit: [scale / scaleX, scale / scaleY, 1]
      };
    }

    super({
      ...props,
      position,
      viewMatrix: viewMatrix.clone().scale([scale, scale * (flipY ? -1 : 1), scale]),
      projectionMatrix: getProjectionMatrix({
        width: width || 1,
        height: height || 1,
        padding,
        near,
        far
      }),
      zoom: zoom_,
      distanceScales
    });

    console.warn('ViewportConstructor', this)
  }

  project([x,y,z]: number[]): [number, number, number] {
    return [x,y,z]
  }

  unproject([x,y,z]: number[]): [number, number, number] {
    return [x,y,z]
  }

//   projectFlat([X, Y]: number[]): [number, number] {
//     // //@ts-ignore
//     // const {unitsPerMeter} = this.distanceScales;
//     // return [X * unitsPerMeter[0], Y * unitsPerMeter[1]];
//     return [X, Y]
//   }

//   unprojectFlat([x, y]: number[]): [number, number] {
//     // //@ts-ignore
//     // const {metersPerUnit} = this.distanceScales;
//     // return [x * metersPerUnit[0], y * metersPerUnit[1]];
//     return [x, y]
//   }

  /* Needed by LinearInterpolator */
  panByPosition(coords: number[], pixel: number[]): OrthographicViewportOptions {
    //@ts-ignore
    const fromLocation = pixelsToWorld(pixel, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(coords);

    const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
    //@ts-ignore
    const newCenter = vec2.add([], this.center, translate);

    return { position: this.unprojectFlat(newCenter) };
  }
  
  getDistanceScales(coordinateOrigin?: number[]): DistanceScales {
    //@ts-ignore
    console.log('getDistanceScales', coordinateOrigin, this.distanceScales);
    //@ts-ignore
    return this.distanceScales;
  }

//   get projectionMode(): number {
//     return PROJECTION_MODE.IDENTITY
//   }
}
