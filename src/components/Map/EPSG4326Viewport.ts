/* eslint-disable @typescript-eslint/no-unused-vars */

import { Viewport } from '@deck.gl/core';

 import {
  pixelsToWorld,
  getViewMatrix,
  addMetersToLngLat,
  getProjectionParameters,
   altitudeToFovy,
   fovyToAltitude,
   fitBounds,
  getBounds
 } from '@math.gl/web-mercator';

// TODO - import from math.gl
import * as vec2 from 'gl-matrix/vec2';
import {Matrix4} from '@math.gl/core';

const TILE_SIZE = 512;

export type WGS84ViewportOptions = {
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
  /** Camera fovy in degrees. If provided, overrides `altitude` */
  fovy?: number;
  /** Viewport center in world space. If geospatial, refers to meter offsets from lng, lat */
  position?: number[];
  /** Zoom level */
  zoom?: number;
  /** Model matrix of viewport center */
  modelMatrix?: number[] | null;
  /** Custom projection matrix */
  projectionMatrix?: number[];
  /** Use orthographic projection */
  orthographic?: boolean;
  /** Scaler for the near plane, 1 unit equals to the height of the viewport. Default `0.1` */
  nearZMultiplier?: number;
  /** Scaler for the far plane, 1 unit equals to the distance from the camera to the edge of the screen. Default `1.01` */
  farZMultiplier?: number;
  /** Render multiple copies of the world */
  repeat?: boolean;
  /** Internal use */
  worldOffset?: number;
  /** @deprecated Revert to approximated meter size calculation prior to v8.5 */
  legacyMeterSizes?: boolean;
};

function getDistanceScales() {
    const unitsPerMeter = 1;
    const unitsPerDegree = 1;//(Math.PI / 180) * 256;
  
    return {
      unitsPerMeter: [unitsPerMeter, unitsPerMeter, unitsPerMeter],
      unitsPerMeter2: [0, 0, 0],
      metersPerUnit: [1 / unitsPerMeter, 1 / unitsPerMeter, 1 / unitsPerMeter],
      unitsPerDegree: [unitsPerDegree, unitsPerDegree, unitsPerMeter],
      unitsPerDegree2: [0, 0, 0],
      degreesPerUnit: [1 / unitsPerDegree, 1 / unitsPerDegree, 1 / unitsPerMeter]
    };
  }
const PI = Math.PI
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;

// convert lat/long to common units (0 -> 512)
function latlngtoworld(xy: number[]) {
    const [lng, lat] = xy
    const lambda2 = lng * DEGREES_TO_RADIANS;
  const phi2 = lat * 2 * DEGREES_TO_RADIANS;
  const x = (TILE_SIZE * (lambda2 + PI)) / (2 * PI);
  const y = (TILE_SIZE * (phi2 + PI)) / (2 * PI);
  return [x, y];
}

// convert common units (0 -> 512) to lat/long
function worldtolatlng(xy: number[]) {
    const [x, y] = xy;
    const lambda2 = (x / TILE_SIZE) * (2 * PI) - PI;
    const phi2 = (y / TILE_SIZE) * (2 * PI) - PI;

    // added the / 2 for the phi2 to convert from 180 to 90 /shrug
    return [lambda2 * RADIANS_TO_DEGREES, phi2 / 2 * RADIANS_TO_DEGREES];
}

export default class EPSG4326Viewport extends Viewport {
    static displayName = 'EPSG4326Viewport';

    latitude = null
    longitude = null

    constructor(opts: any) {
        //console.log('opts', opts)
        const {
        latitude = 0,
        longitude = 0,
        zoom = 0,
        pitch = 0,
        bearing = 0,
        nearZMultiplier = 0.1,
        farZMultiplier = 1.01,
        orthographic = false,
        projectionMatrix,

        repeat = false,
        worldOffset = 0
        } = opts;

        let {width, height, altitude = 1.5} = opts;
        const scale = Math.pow(2, zoom);

        // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
        width = width || 1;
        height = height || 1;

        let fovy;
        if (opts.fovy) {
            fovy = opts.fovy;
            altitude = fovyToAltitude(fovy);
        } else {
            fovy = altitudeToFovy(altitude);
        }

        // The uncentered matrix allows us two move the center addition to the
        // shader (cheap) which gives a coordinate system that has its center in
        // the layer's center position. This makes rotations and other modelMatrx
        // transforms much more useful.
        let viewMatrixUncentered = getViewMatrix({
        height,
        pitch,
        bearing,
        scale,
        altitude
        });

        super({
        ...opts,
        // x, y,
        width,
        height,

        // view matrix
        viewMatrix: viewMatrixUncentered,
        projectionMatrix: null,
        longitude,
        latitude,
        zoom,

        fovy,
        focalDistance: altitude,
        orthographic,
        distanceScales: getDistanceScales()
        });

    // // Save parameters
    this.latitude = latitude;
    this.longitude = longitude;
    // this.zoom = zoom;
    // this.pitch = pitch;
    // this.bearing = bearing;
    // this.altitude = altitude;
    // this.fovy = fovy;

    // this.orthographic = orthographic;
    }

    projectPosition(xyz: number[]): [number, number, number] {

        // const lon = (xyz[0] + 90) / 180 * 512
        // const lat = (xyz[1] + 45) / 90 * 512
        // const [X, Y] = [lon, lat]

        // const [X, Y] = this.projectFlat(xyz);

        const [X, Y] = latlngtoworld(xyz)
        // @ts-ignore
        const Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
        
        // console.log('project', xyz, [X, Y, Z])
        return [X, Y, Z];
        //return super.projectPosition(xyz) as [number, number, number]
        // return [xyz[0], xyz[1], xyz[2]]
    }
    
    unprojectPosition(xyz: number[]): [number, number, number] {
        // const lon = (xyz[0] - 256) / 256 * 180
        // const lat = (xyz[1] - 256) / 256 * 90
        // const [X, Y] = [lon, lat]

        // const [X, Y] = this.unprojectFlat(xyz);

        const [X, Y] = worldtolatlng(xyz)
        // @ts-ignore
        const Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
        // console.log('unproject', xyz, [X, Y, Z])
        return [X, Y, Z];
        //return super.unprojectPosition(xyz) as [number, number, number]
        // return [xyz[0], xyz[1], xyz[2]]
    }

    panByPosition(coords: number[], pixel: number[]): WGS84ViewportOptions {
        const fromPosition = this.unproject(pixel);
        return {
          longitude: coords[0] - fromPosition[0] + this.longitude,
          latitude: coords[1] - fromPosition[1] + this.latitude
        };
      }
}
