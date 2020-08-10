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
            settings: null,
            satList: null,
            isLoadingList: false
        }
    }

    showNearbySatellite = (setting) => {
        this.setState({
            isLoadingList: true,
            settings: setting
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

    showMap = (selected) => {
        console.log('show on the map ', selected);
        this.setState(preState => ({
            ...preState,
            satList: [...selected]
        }))
    }

    render() {
        const { isLoadingList, satInfo, satList, settings } = this.state;
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
                    <WorldMap satData={satList}
                                observerData={settings}/>
                </div>
            </div>
        )
    }
}
export default Main;