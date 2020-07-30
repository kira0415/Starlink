import React, { Component } from 'react';
import { Button, Spin, List, Avatar, Checkbox } from 'antd';
import mySatellite from '../assets/images/my_satellite.svg';

class SatelliteList extends Component {
    constructor(){
        super();
        this.state = {
            selected: [],
            isLoad: false
        }
    }

    onChange = e => {
        const { dataInfo, checked } = e.target;
        const { selected } = this.state;
        const list = this.addOrRemove(dataInfo, checked, selected);
        console.log(list);
        this.setState({selected: list});
    }

    addOrRemove = (item, status, list) => {
        const found = list.some( entry => entry.satid === item.satid);
        if(status && !found){
            list.push(item)
        }

        if(!status && found){
            list = list.filter( entry => {
                return entry.satid !== item.satid;
            });
        }
        return list;

    }

    showMap = () => {
        this.props.onShowMap(this.state.selected);
    }

    render() {
        const { satInfo, isLoadingList } = this.props;
        const satList = satInfo ? satInfo.above : [];
        const { selected } = this.state;
        return (
            <div className="sat-list-box">
                <Button className="sat-list-btn" size="large"
                        disabled={ selected.length === 0}
                        onClick={this.showMap}
                >
                    Track on the map
                </Button>
                <hr/>
                {
                    isLoadingList ? 
                    <div className="spin-box">
                        <Spin tip="Loading..." size="large"></Spin>
                    </div> :
                    <List   className="sat-list"
                            itemLayout="horizontal"
                            dataSource={satList}
                            renderItem={ item => (
                                <List.Item actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}>
                                    <List.Item.Meta avatar={<Avatar src={mySatellite} size="large"
                                                                    alt="satellite"
                                                            />}
                                                    title={<p>{item.satname}</p>}     
                                                    description={`Lauch Date: ${item.launchDate}`}                                  
                                    />
                                </List.Item>
                            )}
                    />
                }
            </div>
        )
    }
}
export default SatelliteList;