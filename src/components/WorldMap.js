import React, { Component } from 'react'
import axios from 'axios';
import { feature } from 'topojson-client';
import { geoKavrayskiy7 } from 'd3-geo-projection';   
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import * as d3Scale from 'd3-scale';
import { schemeCategory10  } from 'd3-scale-chromatic';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import { Spin } from "antd";

import { WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY } from '../constants';

const width = 960;
const height = 600;

class WorldMap extends Component {
    constructor() {
        super();
        this.state = {
            map: null,
            color: d3Scale.scaleOrdinal(schemeCategory10),
            isLoading: false,
            isDrawing: false
        }
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res => {
                const { data } = res;
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);
            })
            .catch(e => {
                console.log("fectch map error -> ", e.message);
            })
    }

    generateMap = (land) => {
        const projection = geoKavrayskiy7()
                        .scale(170)
                        .translate([width / 2, height / 2])
                        .precision(.1);
        
        const graticule = geoGraticule();

        const canvas = d3Select(this.refMap.current)
                        .attr("width", width)
                        .attr("height", height);
        
        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);
        
        const context = canvas.node().getContext("2d");
        const context2 = canvas2.node().getContext("2d");

        let path = geoPath().projection(projection).context(context);

        land.forEach(element => {
            context.fillStyle = '#ccfcfb';
            context.strokeStyle = "#000";
            context.glbalAlpha = 0.7;
            context.beginPath();
            path(element);
            context.fill();
            context.stroke();

            context.strokeStyle = 'rgba(190, 190, 190, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();

        });

        this.setState({
            map: {
                projection: projection,
                graticule: graticule,
                context: context,
                context2: context2
            }
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.satData !== this.props.satData) {
            const { observerLat, observerLong, duration, observerElevation } = this.props.observerData;

            const startTime = duration[0] * 60, endTime = duration[1] * 60;

            this.setState({
                isLoading: true
            });
            // sending position request for each selected satellite
            const urls = this.props.satData.map( sat => {
                const { satid } = sat;
                const url = `${SATELLITE_POSITION_URL}/${satid}/${observerLat}/${observerLong}/${startTime}/${endTime}/&apiKey=${SAT_API_KEY}`;
                return axios.get(url);
            })

            axios.all(urls)
                    .then (
                        axios.spread((...args) => {
                            return args.map(item => item.data);
                        })
                    )
                    .then ( res => {
                        // statellite tracking
                        this.setState({
                            isLoading: false,
                            isDrawing: true
                        });

                        if(!prevState.isDrawing) {
                            this.track(res);
                        } else {
                            const oHint = document.getElementsByClassName('hint')[0];
                            oHint.innerHTML = 'Please wait for these satellite animation to finish before selection new ones!'
                        }
                    })
                    .catch ( e => {
                        console.log('err in fetche satellite position ', e.message);
                    })
        }
    }

    track = (data) => {
        if(!data[0].hasOwnProperty('positions')) {
            throw new Error('no position data');
            return;
        };

        const len = data[0].positions.length;
        const { duration: [startTime, endTime] } = this.props.observerData;
        const { context2 } = this.state.map;

        let now = new Date();
        let i = startTime;

        let timer = setInterval(() => {
            if(i === startTime) {
                now = new Date(now.getTime() + startTime * 1000);
            }

            let ct = new Date();
            ct.setSeconds(ct.getSeconds() + startTime);

            let timePassed = (ct - now);

            let time = new Date(now.getTime() + 60 * timePassed);
            context2.clearRect(0, 0, width, height);

            context2.font = "bold 14 px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);

            if(i >= len) {
                clearInterval(timer);
                this.setState({isDrawing: false});
                const oHint = document.getElementsByClassName('hint')[0];
                oHint.innerHTML = '';
                return;
            }

            data.forEach( sat => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i])
            })

            i += 60;
        }, 1000);
    }

    drawSat = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;

        if (!satlongitude || !satlatitude) {
            return;
        }

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join('');

        const { projection, context2 } = this.state.map;
        const xy = projection([satlongitude, satlatitude]);

        context2.fillStyle = this.state.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2*Math.PI);
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(sat.satname, xy[0], xy[1]+14);
    }

    render() {
        const { isLoading } = this.state;
        return (
            <div className="map-box">
                {
                    isLoading ? 
                    <div className="spinner">
                        <Spin tip="Loading..." size="large"/>
                    </div> : null
                }
                <canvas className="map" ref={this.refMap}/>
                <canvas className="track" ref={this.refTrack} />
                <div className="hint"></div>
            </div>
        )
    }
}

export default  WorldMap;