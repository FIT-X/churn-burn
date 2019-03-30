import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import {csv as requestCsv} from 'd3-request';

import io from 'socket.io-client';

const MAPBOX_TOKEN = process.env.MapboxAccessToken;

const CHURN_COLOR = [255, 0, 0];
const NO_CHURN_COLOR = [0, 128, 255];

const DATA_URL = '/public/data.csv';
const TOWER_DATA_URL = '/public/towers.csv';

class Root extends Component {
  constructor(props) {

    super(props);

    this.state = {
      socketAddress: 'wss://woodle.ngrok.io',
      socket: null,
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null,
      heatMap: null,
      coolMap: null,
      towerData: null,
      newTower: null
    };

    this.connectSocket = this.connectSocket.bind(this);

    requestCsv(DATA_URL, (error, response) => {
      if (!error) {
        const data = response.map(d => [Number(d.long), Number(d.lat), Number(d.churn == 'True' ? 1 : 2)]);


        var heatMapData = [];
        var coolMapData = [];
        for (var i in data) {
          if (data[i][2] === 1) {
            heatMapData.push([Number(data[i][0]), Number(data[i][1])]);
          } else {
            coolMapData.push([Number(data[i][0]), Number(data[i][1])]);
          }
        }

        requestCsv(TOWER_DATA_URL, (error, response) => {
          if (!error) {
            const towerData = response.map(d => [Number(d.lon), Number(d.lat), 0]);

            this.setState({data: data, heatMap: heatMapData, towerData: towerData, coolMap: coolMapData});
          }
        });
      }
    });
  }

  componentDidMount() {
    this.connectSocket();
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  connectSocket() {
    const socket = io(this.state.socketAddress);

    socket.on('connect', () => {

      socket.on('update', data => {
        this.setState({newTower: data}, function(){this.forceUpdate()});
      });

      this.setState({socket: socket});

    });
  }

  render() {
    const {viewport, data, heatMap, towerData, coolMap} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <DeckGLOverlay
          viewport={viewport}
          data={data}
          maleColor={CHURN_COLOR}
          femaleColor={NO_CHURN_COLOR}
          radius={30}
          heatData={heatMap}
          cellSize={20}
          towerData={towerData}
          coolData={coolMap}
        />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
