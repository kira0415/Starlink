import React, { Component } from 'react';
import axios from 'axios';

import { NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY} from '../constants';
import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';
import WorldMap from './WorldMap';

class Main extends Component {
    constructor(){
        super();
        this.state = {
            satInfo: null,
            isLoadingList: false
        }
    }

    showNearbySatellite = (setting) => {
        this.setState({
            isLoadingList: true
        })
        this.fetchSatelite(setting);
    }

    fetchSatelite = (setting) => {
        const { observerLat, observerLong, observerElevation, satAlt, duration } = setting;
        const url = `${NEARBY_SATELLITE}/${observerLat}/${observerLong}/${observerElevation}/${satAlt}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
        axios.get(url)
            .then(response => {
                console.log(response.data);
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                })
            })
            .catch(err => {
                console.log("fetch statellite failed -> ", err.message);
            })
    }

    showMap = () => {
        console.log('show on the map')
    }

    render() {
        const { isLoadingList, satInfo } = this.state;
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList isLoadingList={isLoadingList} 
                                    satInfo={satInfo}
                                    onShowMap={this.showMap}
                    />
                </div>
                <div className="right-side">
                    <WorldMap/>
                </div>
            </div>
        )
    }
}
export default Main;