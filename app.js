import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import {csv as requestCsv} from 'd3-request';

import io from 'socket.io-client';
import axios from 'axios';

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
    this.sendData = this.sendData.bind(this);

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

  sendData() {
    var data = {
      'account length': document.getElementById("length").value,
      'number vmail messages': '1',
      'total day minutes': '1',
      'total day calls': '1',
      'total day charge': '1',
      'total eve minutes': '1',
      'total eve calls': '1',
      'total eve charge': '1',
      'total night minutes': '1',
      'total night calls': '1',
      'total night charge': '1',
      'total intl minutes': '1',
      'total intl calls': '1',
      'total intl charge': '1',
      'customer service calls': document.getElementById("calls").value,
      churn: 'false',
      lat: document.getElementById("lat").value,
      long: document.getElementById("lon").value
    }
    
    console.log(data)

    axios.post('/user', data)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  render() {
    const {viewport, data, heatMap, towerData, coolMap} = this.state;

    return (
      <div>
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
        <div style={{width: '100%', height: '32px', background: 'gray', position: 'absolute', top: '0'}}>
          <input id="length" type="text" placeholder="Account Length" style={{height: '26px'}}></input>
          <input id="calls" type="text" placeholder="Customer Service Calls" style={{height: '26px'}}></input>
          <input id="lat" type="text" placeholder="Latitude" style={{height: '26px'}}></input>
          <input id="lon" type="text" placeholder="Longitude" style={{height: '26px'}}></input>
          <button style={{height: '31px'}} onClick={this.sendData}>Submit</button>
        </div>
        
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
