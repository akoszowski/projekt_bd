import React, {Component} from 'react';
import './Timetable.css';
import axios from 'axios'
import {isDefined} from './helpers'
import {changeRootState} from './state-manager'
import {cookies} from './cookie-manager'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Prev, Next} from './icons'

class Timetable extends Component {

    resetSelection() {
        this.setState({
            selectedRow: undefined,
            selectedColumnStart: undefined,
            selectedColumnStop: undefined
        });
    }

    constructor(props) {
        super();
        let now = new Date();
        this.state = {
            time: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            //headers: [],
            //headers: ["6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15"],
            headers: ["6:00", "6:15", "6:30", "6:45", "7:00", "7:15"],
            data: [
                [0, 2, null, 4, 5, 6],
                [7, 8, 9, 10, 11, 12]
            ],
            //data: [],
            selectedRow: undefined,
            selectedColumnStart: undefined,
            selectedColumnStop: undefined
        }
        this.selectedPool = props.selectedPool;
    }


    request() {
        console.log("Sending request");
        axios.get('/api/v1/timetable', {
            params: {
                date: this.state.time
            }
        }).then((res) => {
            const data = res.data;
            console.log(data);
            //this.setState(data);
        });
    }

    componentDidMount() {
        this.request();
    }

    getClicked(rowIndex, columnIndex) {
        console.log(this.state)
        let result = isDefined(rowIndex) && (rowIndex == this.state.selectedRow) && (this.state.selectedColumnStart <= columnIndex) && (columnIndex <= this.state.selectedColumnStop);
        return result;
    }

    makeReservation() {
        axios.post('/api/v1/reserve', {
            basenId: this.selectedPool,
            token: cookies.get("token"),
            selectedPool: this.selectedPool,
            selectedRow: this.state.selectedRow,
            date: this.state.time,
            start: this.state.selectedColumnStart,
            stop: this.state.selectedColumnStop
        }).then((response) => {
            console.log("Success!");
            changeRootState({page: "end"});
            console.log(response);
        }).catch(function (error) {
            console.log("Error!");
            console.log(error);
        });
    }

    valid() {
        return isDefined(this.state.selectedRow) && isDefined(this.state.selectedColumnStart) && isDefined(this.state.selectedColumnStop);
    }


    toggle(rowIndex, columnIndex) {
        let left = this.getClicked(rowIndex, columnIndex - 1);
        let middle = this.getClicked(rowIndex, columnIndex);
        let right = this.getClicked(rowIndex, columnIndex + 1);


        if (!isDefined(this.state.selectedRow) || (!middle && (left || right)) || (middle && (!left || !right))) {
            console.log("Toggling", rowIndex, columnIndex);
            this.setState((prevState) => {
                    let copy = Object.assign({}, prevState);
                    copy.selectedRow = rowIndex;
                    if (middle) {
                        if (copy.selectedColumnStart == copy.selectedColumnStop)
                            this.resetSelection();
                        else {
                            if (copy.selectedColumnStart == columnIndex)
                                copy.selectedColumnStart++;
                            if (copy.selectedColumnStop == columnIndex)
                                copy.selectedColumnStop--;
                        }
                    } else {
                        if (!isDefined(copy.selectedColumnStart) || columnIndex < copy.selectedColumnStart)
                            copy.selectedColumnStart = columnIndex;
                        if (!isDefined(copy.selectedColumnStop) || copy.selectedColumnStop < columnIndex)
                            copy.selectedColumnStop = columnIndex;
                    }
                    return copy;
                }
            );
        }
    }

    changeTime(numOfDays) {
        let newDate = (this.state.time.getDate()) + numOfDays;
        console.log(newDate);
        this.setState((prevState) => {
            let copy = Object.assign({}, prevState);
            copy.time.setDate(newDate);
            return copy;
        })
        this.resetSelection();
        this.request();
    }


    render() {
        return <div className="zero">
            <center>
                <h1>Selected pool: {this.selectedPool} </h1>
                <center>
                    <Prev onClick={((e) => this.changeTime(-1))}>Prev</Prev>
                    <div className="timetableHeaderDate">
                        {this.state.time.toLocaleDateString("pl-PL")}
                    </div>
                    <Next onClick={((e) => this.changeTime(1))}>Next</Next>
                </center>
                <div className="flipper zero">
                    <div className="div zero">
                        <div className="flipper zero inline">
                            <Table bordered size="sm" className="timetable table-responsive zero inline">
                                <thead>
                                    <tr>
                                        {this.state.headers.map((hour) =>
                                            <td className="header">{hour}</td>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.data.map((row, rowIndex) => {
                                        return <tr>
                                            {row.map((n, columnIndex) => {
                                                let clicked = this.getClicked(rowIndex, columnIndex);
                                                let cellClass = (n || n==0) ? (clicked ? "selected" : "free") : "busy";
                                                let callback = (n || n==0) ? ((e)=>this.toggle(rowIndex, columnIndex)) : null;
                                                return <td className={cellClass + " data"} onClick={callback}>{n}</td>;
                                            })}
                                        </tr>;
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
                <Button onClick={(e) => changeRootState({page: "dashboard"})} className="leftButton">Dashboard</Button>
                <Button onClick={(e) => this.makeReservation()} disabled={!this.valid()} className="rightButton">
                    Reserve
                </Button>
            </center>
        </div>
    }


}

export default Timetable;