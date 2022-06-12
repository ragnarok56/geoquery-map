/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useMemo } from 'react'
import { ViewMode } from "@nebula.gl/edit-modes";
import { PolygonLayer } from '@deck.gl/layers'
import { MapView, MapController } from '@deck.gl/core'
import { EditableGeoJsonLayer } from 'nebula.gl'
import GL from '@luma.gl/constants';
import turfCentroid from '@turf/centroid';
import bbox from '@turf/bbox'
import * as d3 from 'd3'

import DeckGL from '@deck.gl/react'

import { generateGeohashes, generatePoints, valueGeneratorGenerator } from '../../data'

import GeohashLayer from '../GeohashLayer/GeohashLayer'
import Toolbar from '../ToolBar'

import { getViewBoundsClipped } from '../../utils/view'

import BasemapLayers from './BaseMaps'

import { EditorState, NAIEditing, NAIFeatureCollection } from '../../types'
import { getEditMode } from '../../utils/editing';
import { FlyToInterpolator, RGBAColor, ScatterplotLayer, TextLayer, WebMercatorViewport } from 'deck.gl';
import NAIControl from '../NAIControl';
import LayerControl from '../LayerControl';

function hex2rgb(hex: string) {
    const value = parseInt(hex, 16);
    return [16, 8, 0].map((shift) => ((value >> shift) & 0xff) / 255);
}

const INITIAL_VIEW_STATE = {
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0
}

const EMPTY_FEATURE_COLLECTION: NAIFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
}

const transitions : Record<string, any> = {
    getColors: {
        duration: 300,
        easing: d3.easeCubicInOut,
        enter: value => [value[0], value[1], value[2], 0] // fade in
    },
    getRadius: {
        type: 'spring',
        stiffness: 0.01,
        damping: 0.15,
        enter: value => [0] // grow from size 0
    }
}

// this is fun but not useful to have lots 
// of random colors
const FEATURE_COLORS = [
    '00AEE4',
    // 'DAF0E3',
    // '9BCC32',
    // '07A35A',
    // 'F7DF90',
    // 'EA376C',
    // '6A126A',
    // 'FCB09B',
    // 'B0592D',
    // 'C1B5E3',
    // '9C805B',
    // 'CCDFE5',
].map(hex2rgb);

function getPositionCount(geometry) {
    const flatMap = (f, arr) => arr.reduce((x, y) => [...x, ...f(y)], []);

    const { type, coordinates } = geometry;
    switch (type) {
        case 'Point':
            return 1;
        case 'LineString':
        case 'MultiPoint':
            return coordinates.length;
        case 'Polygon':
        case 'MultiLineString':
            return flatMap((x) => x, coordinates).length;
        case 'MultiPolygon':
            return flatMap((x) => flatMap((y) => y, x), coordinates).length;
        default:
            throw Error(`Unknown geometry type: ${type}`);
    }
}

function featuresToInfoString(featureCollection) {
    if (!featureCollection || !featureCollection.features) {
        return ""
    }
    const info = featureCollection.features.map(
        (feature) => `${feature.geometry.type}(${getPositionCount(feature.geometry)})`
    );

    return JSON.stringify(info);
}


interface MapProps {
    seed?: string,
    editor: EditorState
    onEditorUpdated: (editorState: EditorState) => void
}


const Map = ({ seed, editor, onEditorUpdated }: MapProps) => {
    const [viewBoundsPolygon, setViewBoundsPolygon] = useState([[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]])

    const [cursorCoordinates, setCursorCoordiantes] = useState(null)

    const [perspectiveEnabled, setPerspectiveEnabled] = useState(true)

    const [featureNamesVisible, setFeatureNamesVisible] = useState(true)

    const [geohashLayerConfig, setGeohashLayerConfig] = useState({})

    const [viewStates, setViewStates] = useState({
        mainmap: INITIAL_VIEW_STATE,
        minimap: INITIAL_VIEW_STATE
    });

    const [geohashData, setGeohashData] = useState([])
    const [pointData, setPointData] = useState([])

    const [editingFeatures, setEditingFeatures] = useState<NAIEditing>({
        name: null,
        featureCollection: EMPTY_FEATURE_COLLECTION,
        selectedFeatureIndexes: []
    })

    const valueGenerator = useMemo(() => valueGeneratorGenerator(seed), [seed])

    const VIEWS = [
        new MapView({
            id: 'mainmap',
            controller: {
                type: MapController,
                doubleClickZoom: false,
                dragRotate: perspectiveEnabled
            }
        }),
        // this is commented out because otherwise editablegeojsonlayer uses _this_ viewport as the context for which
        // to get cursor events off of, which is why the lines end up all over the place.  not sure how to have multiple viewports
        // and the nebula stuff for editing since its all baked in to react-map-gl MapContext which doesnt appear to 
        // allow for selecting a viewport to use for its context
        // new MapView({
        //     id: 'minimap',
        //     x: '80%',
        //     y: '65%',
        //     height: '30%',
        //     width: '15%',
        //     clear: true,
        //     controller: true
        // })
    ]

    const onTogglePerspective = () => {
        const updatedPerspective = !perspectiveEnabled
        setPerspectiveEnabled(updatedPerspective)
        setViewStates(currentViewStates => ({
            mainmap: {
                ...currentViewStates.mainmap,
                pitch: updatedPerspective ? currentViewStates.mainmap.pitch : 0,
                bearing: updatedPerspective ? currentViewStates.mainmap.bearing : 0
            },
            minimap: {
                ...currentViewStates.minimap
            }
        }));
    }

    const _getDeckColorForFeature = (index: number, bright: number, alpha: number): RGBAColor => {
        const length = FEATURE_COLORS.length;
        const color = FEATURE_COLORS[index % length].map((c) => c * bright * 255);

        // @ts-ignore
        return [...color, alpha * 255];
    }

    const getFillColor = (feature, isSelected) => {
        const index = editingFeatures.featureCollection.features.indexOf(feature);
        return isSelected
            ? _getDeckColorForFeature(index, 1.0, 0.5)
            : _getDeckColorForFeature(index, 0.5, 0.5);
    };

    const getLineColor = (feature, isSelected) => {
        const index = editingFeatures.featureCollection.features.indexOf(feature);
        return isSelected
            ? _getDeckColorForFeature(index, 1.0, 1.0)
            : _getDeckColorForFeature(index, 0.5, 1.0);
    };

    const handleDeleteFeature = useCallback((i) => {
        setEditingFeatures({
            ...editingFeatures,
            featureCollection: {
                ...editingFeatures.featureCollection,
                features: [
                    ...editingFeatures.featureCollection.features.slice(0, i),
                    ...editingFeatures.featureCollection.features.slice(i + 1)
                ]
            }
        })
    }, [editingFeatures])

    const handleEditFeatureName = useCallback((i, name) => {
        const updatedFeatures = [...editingFeatures.featureCollection.features]
        updatedFeatures[i].properties.name = name
        setEditingFeatures({
            ...editingFeatures,
            featureCollection: {
                ...editingFeatures.featureCollection,
                features: updatedFeatures
            }
        })
    }, [editingFeatures])

    const handleEditFeatureCollectionName = useCallback(name => {
        setEditingFeatures({
            ...editingFeatures,
            name
        })
    }, [editingFeatures])

    const handleFlyToFeature = useCallback((i?: number) => {
        setViewStates(currentViewStates => {
            
            const feature = (i !== undefined && i !== null) ? editingFeatures.featureCollection.features[i] : editingFeatures.featureCollection
            const [minLng, minLat, maxLng, maxLat] = bbox(feature); // Turf.js
            const viewport = new WebMercatorViewport(currentViewStates.mainmap);
            const viewBounds = viewport.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
                padding: 50
            })

            return {
                ...currentViewStates,
                mainmap: {
                    ...currentViewStates.mainmap,
                    zoom: viewBounds.zoom,
                    // @ts-expect-error  viewport does have latitude
                    latitude: viewBounds.latitude,
                    // @ts-expect-error  viewport does have longitude
                    longitude: viewBounds.longitude,
                    pitch: 0,
                    bearing: 0,
                    transitionDuration: 1500,
                    transitionInterpolator: new FlyToInterpolator()
                }
            }
        })
    }, [editingFeatures])

    const handleToggleSelectFeature = useCallback((i) => {
        const { selectedFeatureIndexes } = editingFeatures
        if (selectedFeatureIndexes.includes(i)) {
            setEditingFeatures({
                ...editingFeatures,
                selectedFeatureIndexes: selectedFeatureIndexes.filter((e) => e !== i),
            })
        } else {
            setEditingFeatures({
                ...editingFeatures,
                selectedFeatureIndexes: [...selectedFeatureIndexes, i],
            });
        }
    }, [editingFeatures])

    const onSetViewBounds = useCallback(() => {
        const polygon = getViewBoundsClipped(viewStates.mainmap)
        setViewBoundsPolygon(polygon)

        const viewBbox = [
            Math.min(...polygon.map(([_, x]) => x)),
            Math.min(...polygon.map(([x, _]) => x)),
            Math.max(...polygon.map(([_, x]) => x)),
            Math.max(...polygon.map(([x, _]) => x))
        ]

        const geohashes = generateGeohashes(
            viewStates.mainmap.zoom,
            viewBbox
        )

        const points = generatePoints(viewBbox)
        console.log(points)

        setGeohashData(geohashes.map(x => ({ geohash: x, value: valueGenerator() })))

        setPointData(points)
    }, [viewStates, valueGenerator])

    const onLayerClick = (info) => {
        if (editor.mode?.handler !== ViewMode) {
            // don't change selection while editing
            return;
        }

        setEditingFeatures(prev => ({
            ...prev,
            selectedFeatureIndexes: info ? [info.index] : []
        }))
    };

    const onEdit = ({ updatedData, editType, editContext }) => {
        let updatedSelectedFeatureIndexes = editingFeatures.selectedFeatureIndexes;

        // if (!['movePosition', 'extruding', 'rotating', 'translating', 'scaling'].includes(editType)) {
        //     // Don't log edits that happen as the pointer moves since they're really chatty
        //     const updatedDataInfo = featuresToInfoString(updatedData);
        //     // eslint-disable-next-line
        //     console.log('onEdit', editType, editContext, updatedDataInfo);
        // }

        if (editType === 'addFeature') {
            const { featureIndexes } = editContext;
            // Add the new feature to the selection
            updatedSelectedFeatureIndexes = [...editingFeatures.selectedFeatureIndexes, ...featureIndexes];

            // add name property to added feature
            updatedData.features[featureIndexes[0]].properties.name = 'Unnamed Area'

            setEditingFeatures({
                featureCollection: updatedData,
                selectedFeatureIndexes: updatedSelectedFeatureIndexes,
            });
        }
    };

    const editableGeoJsonLayer = new EditableGeoJsonLayer({
        id: 'geojson-editor-layer',
        data: editingFeatures.featureCollection,
        selectedFeatureIndexes: editingFeatures.selectedFeatureIndexes,
        mode: editor.mode?.handler,
        onEdit: onEdit,
        autoHighlight: false,
        editHandleType: 'point',
        getFillColor: getFillColor,
        getLineColor: getLineColor,
        // not sure what these do
        parameters: {
            depthTest: true,
            depthMask: false,
            blend: true,
            blendEquation: GL.FUNC_ADD,
            blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA],
        }
    })

    const geoJsonNames = editingFeatures.featureCollection.features?.filter(x => x.geometry.type === 'Polygon')
        .map(x => {
            return {
                position: turfCentroid(x.geometry).geometry.coordinates,
                text: x.properties?.name
            }
        })
    const geoJsonNamesLayer = new TextLayer({
        id: 'geojson-names-layer',
        visible: featureNamesVisible,
        data: geoJsonNames,
        parameters: {
            depthTest: false
        }
    })
    
    const geohashLayer = new GeohashLayer({
        id: 'geohash-layer',
        data: geohashData,
        pickable: true,
        wireframe: false,
        filled: true,
        ...geohashLayerConfig,
        getGeohash: d => d.geohash,
        getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],
        getElevation: d => d.value * 100,
        transitions
    })

    const pointLayer = new ScatterplotLayer({
        id: 'point-layer',
        data: pointData,
        pickable: true,
        filled: true,
        opacity: 0.3,
        radiusMinPixels: 5,
        radiusMaxPixels: 100,
        lineWidthMinPixels: 1,
        getPosition: (x: any) => [x.coordinates[0], x.coordinates[1], 10],
        transitions
    })

    const viewBoxPolygonLayer = new PolygonLayer({
        id: 'polygon-layer',
        data: [{ polygon: viewBoundsPolygon }],
        pickable: true,
        stroked: true,
        filled: false,
        wireframe: true,
        lineWidthMinPixels: 10,
        getPolygon: (d: any) => d.polygon,
        getLineColor: [255, 0, 0],
        getLineWidth: 1
    })

    const layers = [
        ...BasemapLayers,
        geohashLayer,
        pointLayer,
        viewBoxPolygonLayer,
        editableGeoJsonLayer,
        geoJsonNamesLayer
    ]

    const layerFilter = useCallback(({ layer, viewport }) => {
        if (viewport.id === 'minimap' && layer.id === 'basemap-minimap') {
            return true;
        } else {
            if (viewport.id === 'mainmap') {
                if (layer.id === 'basemap-minimap') {
                    return false
                }
                return true;
            }
        }
        return false;
    }, []);

    const onViewStateChange = useCallback(({ viewId, viewState }) => {
        if (viewId === 'mainmap') {
            setViewStates(currentViewStates => ({
                mainmap: viewState,
                minimap: {
                    ...currentViewStates.minimap,
                    longitude: viewState.longitude,
                    latitude: viewState.latitude
                }
            }));
        } else {
            setViewStates(currentViewStates => ({
                mainmap: {
                    ...currentViewStates.mainmap,
                    longitude: viewState.longitude,
                    latitude: viewState.latitude
                },
                minimap: viewState
            }));
        }
    }, []);

    const getTooltip = (data: any) => {
        return data.object?.name
    }

    const onSwitchMode = (id) => {
        onEditorUpdated({
            mode: getEditMode(id)
        })
    };

    return (
        <div style={{ alignItems: 'stretch', display: 'flex', height: '100vh' }}>
            <DeckGL
                layerFilter={layerFilter}
                layers={layers}
                views={VIEWS}
                // @ts-expect-error - this can an object of viewstates
                viewState={viewStates}
                getCursor={editableGeoJsonLayer.getCursor.bind(editableGeoJsonLayer)}
                // @ts-expect-error - not typed correctly, missing viewId prop
                onViewStateChange={onViewStateChange}
                onClick={onLayerClick}
                height="100%"
                width="100%"
                onHover={(info) => setCursorCoordiantes(info.coordinate)} 
                getTooltip={ getTooltip }/>
            <Toolbar editor={editor}
                perspectiveEnabled={perspectiveEnabled}
                featureNamesVisible={featureNamesVisible}
                onSetMode={onSwitchMode}
                onRefresh={onSetViewBounds}
                onTogglePerspective={onTogglePerspective}
                onToggleFeatureNamesVisible={() => setFeatureNamesVisible(x => !x)}/>
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#888' }}>
                {cursorCoordinates && (<span>{cursorCoordinates[1] + ', ' + cursorCoordinates[0]}</span>)}
            </div>
            <NAIControl
                editingFeatures={ editingFeatures }
                onDeleteFeature={ handleDeleteFeature }
                onToggleSelectFeature={ handleToggleSelectFeature }
                onEditFeatureName={ handleEditFeatureName }
                onEditFeatureCollectionName={ handleEditFeatureCollectionName }
                onFlyToFeature={ handleFlyToFeature }/>
            <LayerControl
                layerConfig={ geohashLayerConfig }
                onLayerConfigUpdated={ x => setGeohashLayerConfig(x) }/>
        </div>
    )
}

export default Map
