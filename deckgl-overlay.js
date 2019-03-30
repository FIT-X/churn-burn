import React, {Component} from 'react';

import DeckGL, {ScatterplotLayer, ScreenGridLayer} from 'deck.gl';

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      longitude: -84.5628,
      latitude: 34.0677,
      zoom: 11,
      maxZoom: 16,
      pitch: 0,
      bearing: 0
    };
  }

  render() {
    const {viewport, maleColor, femaleColor, data, radius, heatData, cellSize, towerData, coolData, newTowerData} = this.props;

    if (!data || !heatData) {
      return null;
    }

    const pointLayer = new ScatterplotLayer({
      id: 'scatter-plot',
      data,
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => (d[2] === 1 ? maleColor : femaleColor),
      getRadius: d => .6,
      updateTriggers: {
        getColor: [maleColor, femaleColor]
      }
    });

    const towerLayer = new ScatterplotLayer({
      id: 'scatter-plot-towers',
      data: towerData,
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => ([243, 0, 113]),
      getRadius: d => 5,
      updateTriggers: {
        getColor: [maleColor, femaleColor]
      }
    });

    const newTower = new ScatterplotLayer({
      id: 'new-tower',
      data: newTowerData,
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => ([0, 255, 0]),
      getRadius: d => 8,
      updateTriggers: {
        getColor: [maleColor, femaleColor]
      }
    });

    const gridLayer = new ScreenGridLayer({
      id: 'grid',
      data: heatData,
      minColor: [0, 0, 0, 0],
      maxColor: [180, 0, 0, 255],
      getPosition: d => d,
      cellSizePixels: cellSize
    });

    const gridLayer2 = new ScreenGridLayer({
      id: 'grid-2',
      data: coolData,
      minColor: [0, 0, 0, 0],
      maxColor: [0, 0, 180, 255],
      getPosition: d => d,
      cellSizePixels: cellSize
    });

    var finalLayers = [pointLayer, gridLayer, gridLayer2, towerLayer, newTower];
    //var finalLayers = [gridLayer, gridLayer2, towerLayer];

    return <DeckGL {...viewport} layers={finalLayers} />;
  }
}
