/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// View and Projection Matrix calculations for mapbox-js style
// map view properties
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
const EARTH_CIRCUMFERENCE = 40.03e6;
const DEGREES_TO_RADIANS = Math.PI / 180;

function getOrbitViewMatrix({
    height,
    focalDistance,
    orbitAxis,
    rotationX,
    rotationOrbit,
    zoom
  }: {
    height: number;
    focalDistance: number;
    orbitAxis: 'Y' | 'Z';
    rotationX: number;
    rotationOrbit: number;
    zoom: number;
  }): Matrix4 {
    // We position the camera so that one common space unit (world space unit scaled by zoom)
    // at the target maps to one screen pixel.
    // This is a similar technique to that used in web mercator projection
    // By doing so we are able to convert between common space and screen space sizes efficiently
    // in the vertex shader.
    const up = orbitAxis === 'Z' ? [0, 0, 1] : [0, 1, 0];
    const eye = orbitAxis === 'Z' ? [0, -focalDistance, 0] : [0, 0, focalDistance];
    const center = [0, 0, 0]
    
    // @ts-ignore
    const viewMatrix = new Matrix4().lookAt({eye, center, up});
  
    viewMatrix.rotateX(rotationX * DEGREES_TO_RADIANS);
    if (orbitAxis === 'Z') {
      viewMatrix.rotateZ(rotationOrbit * DEGREES_TO_RADIANS);
    } else {
      viewMatrix.rotateY(rotationOrbit * DEGREES_TO_RADIANS);
    }
  
    // When height increases, we need to increase the distance from the camera to the target to
    // keep the 1:1 mapping. However, this also changes the projected depth of each position by
    // moving them further away between the near/far plane.
    // Without modifying the default near/far planes, we instead scale down the common space to
    // remove the distortion to the depth field.
    const projectionScale = Math.pow(2, zoom) / height;
    viewMatrix.scale(projectionScale);
  
    return viewMatrix;
  }

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

function unitsPerMeter(latitude: number): number {
  const latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);
  return TILE_SIZE / EARTH_CIRCUMFERENCE / latCosine;
}

function latLonToPixels(latitude: number, longitude: number, zoom: number) {
    const res = 180 / 256.0 / 2 ** zoom
    const x = (180 + latitude) / res
    const y = (90 + longitude) / res
    return [x, y]
}

/**
 * Manages transformations to/from WGS84 coordinates using the Web Mercator Projection.
 */
export default class WGS84Viewport extends Viewport {
  static displayName = 'WGS84Viewport';

  longitude: number;
  latitude: number;
  pitch: number;
  bearing: number;
  altitude: number;
  fovy: number;
  orthographic: boolean;

  /** Each sub viewport renders one copy of the world if repeat:true. The list is generated and cached on first request. */
  private _subViewports: WGS84Viewport[] | null;

  /* eslint-disable complexity, max-statements */
  constructor(opts: WGS84ViewportOptions = {}) {
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
    let projectionParameters: any = null;
    if (projectionMatrix) {
      altitude = projectionMatrix[5] / 2;
      fovy = altitudeToFovy(altitude);
    } else {
      if (opts.fovy) {
        fovy = opts.fovy;
        altitude = fovyToAltitude(fovy);
      } else {
        fovy = altitudeToFovy(altitude);
      }
      projectionParameters = getProjectionParameters({
        width,
        height,
        pitch,
        fovy,
        nearZMultiplier,
        farZMultiplier
      });
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

    if (worldOffset) {
      const viewOffset = new Matrix4().translate([512 * worldOffset, 0, 0]);
      viewMatrixUncentered = viewOffset.multiplyLeft(viewMatrixUncentered);
    }
    // fovy = 50
    const orbitAxis = 'Z'
    const focalDistance = projectionMatrix ? projectionMatrix[5] / 2 : fovyToAltitude(fovy);

    const rotationX = 0 // Rotating angle around X axis
    const rotationOrbit = 0 // Rotating angle around orbit axis

    const orbitViewMatrix = getOrbitViewMatrix({height: height || 1,
        focalDistance,
        orbitAxis,
        rotationX,
        rotationOrbit,
        zoom
    })

    console.log(viewMatrixUncentered, orbitViewMatrix)

    super({
      ...opts,
      // x, y,
      width,
      height,

      // view matrix
      viewMatrix: viewMatrixUncentered,
    //   viewMatrix: getOrbitViewMatrix({
    //     height: height || 1,
    //     focalDistance,
    //     orbitAxis,
    //     rotationX,
    //     rotationOrbit,
    //     zoom
    //   }),
      longitude,
      latitude,
      zoom,

      // projection matrix parameters
      //   ...projectionParameters,
      //fovy,
      focalDistance: altitude,
      orthographic
    });

    // Save parameters
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;
    this.fovy = fovy;

    this.orthographic = orthographic;

    this._subViewports = repeat ? [] : null;

    Object.freeze(this);

    console.log(this)
  }
  /* eslint-enable complexity, max-statements */

  get subViewports(): WGS84Viewport[] | null {
    if (this._subViewports && !this._subViewports.length) {
      // Cache sub viewports so that we only calculate them once
      const bounds = this.getBounds();

      const minOffset = Math.floor((bounds[0] + 180) / 360);
      const maxOffset = Math.ceil((bounds[2] - 180) / 360);

      for (let x = minOffset; x <= maxOffset; x++) {
        const offsetViewport = x
          ? new WGS84Viewport({
              ...this,
              worldOffset: x
            })
          : this;
        this._subViewports.push(offsetViewport);
      }
    }
    return this._subViewports;
  }

  projectPosition(xyz: number[]): [number, number, number] {
    // const [X, Y] = this.projectFlat(xyz);
    // const Z = (xyz[2] || 0) * unitsPerMeter(xyz[1]);
    // return [X, Y, Z];
    return [xyz[0], xyz[1], xyz[2]]
  }

  unprojectPosition(xyz: number[]): [number, number, number] {
    // const [X, Y] = this.unprojectFlat(xyz);
    // const Z = (xyz[2] || 0) / unitsPerMeter(Y);
    // return [X, Y, Z];
    return [xyz[0], xyz[1], xyz[2]]
  }

//   /**
//    * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
//    *
//    * Note: Uses simple linear approximation around the viewport center
//    * Error increases with size of offset (roughly 1% per 100km)
//    *
//    * @param {[Number,Number]|[Number,Number,Number]) lngLatZ - base coordinate
//    * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
//    * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
//    */
//   addMetersToLngLat(lngLatZ: number[], xyz: number[]): number[] {
//     return addMetersToLngLat(lngLatZ, xyz);
//   }

  panByPosition(coords: number[], pixel: number[]): WGS84ViewportOptions {
    const fromPosition = this.unproject(pixel);
    return {
      longitude: coords[0] - fromPosition[0] + this.longitude,
      latitude: coords[1] - fromPosition[1] + this.latitude
    };
  }

  getBounds(options: {z?: number} = {}): [number, number, number, number] {
    // @ts-ignore
    const corners = getBounds(this, options.z || 0);

    return [
      Math.min(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.min(corners[0][1], corners[1][1], corners[2][1], corners[3][1]),
      Math.max(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.max(corners[0][1], corners[1][1], corners[2][1], corners[3][1])
    ];
  }

  /**
   * Returns a new viewport that fit around the given rectangle.
   * Only supports non-perspective mode.
   * @param {Array} bounds - [[lon, lat], [lon, lat]]
   * @param {Number} [options.padding] - The amount of padding in pixels to add to the given bounds.
   * @param {Array} [options.offset] - The center of the given bounds relative to the map's center,
   *    [x, y] measured in pixels.
   * @returns {WGS84Viewport}
   */
  fitBounds(bounds: [[number, number], [number, number]], options = {}) {
    const {width, height} = this;

    const [[west, south], [east, north]] = bounds
    const longitude = (east + west) / 2
    const latitude  = (north + south) / 2

    // just call the web mercator version of this for now to get zoom level
    // todo: replace?
    const { zoom } = fitBounds({width, height, bounds, ...options})
    return new WGS84Viewport({width, height, longitude, latitude, zoom});
  }
}
