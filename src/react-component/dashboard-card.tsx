/* React */
import React, { Component } from "react"
import { Redirect } from "react-router-dom"
import store from "../store/store"

interface props {
    title: string,
    color: string,
    current: number,
    max: number,
    guide?: boolean,
    onClick?: any
}

interface state {
    current: string,
    max: string,
    percent: number,
    redirect: boolean,
}

export default class extends Component<props,state> {
    constructor(props: any){
        super(props);
        this.state = {
            current: this.props.current.toString(),
            max: this.props.max.toString(),
            percent:  ( this.props.current / this.props.max ) * 100,
            redirect: false
        }
    }

    redirect = (e: any):void => {
        if(this.props.guide) return;
        this.setState({
            redirect:true
        })
        store.dispatch({
            type: "updateCollection",
            collection: this.props.title
        })
    }

    render(){
        if(this.state.redirect){
            return(
                <Redirect push to="/collection" />
            )
        }
        if(this.props.onClick){
            return(
                <div className={`dashboard-card ${this.props.color}`} onClick={e => this.props.onClick()}>
                    <h1>{this.props.title}</h1>
                    <div>
                        <h6>{this.state.current}/{this.state.max}</h6>
                        <div className="dashboard-progress-bar">
                            <div style={{width: `${this.state.percent}%`}}></div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return(
                <div className={`dashboard-card ${this.props.color}`} onClick={e => this.redirect(e)}>
                    <h1>{this.props.title}</h1>
                    <div>
                        <h6>{this.state.current}/{this.state.max}</h6>
                        <div className="dashboard-progress-bar">
                            <div style={{width: `${this.state.percent}%`}}></div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}