import UsageApi from "../api/Usage";
import Graph from "./Graph";
import DatePicker from "react-datepicker";
import { useState, useEffect } from "react";
import {Day} from "../Types";
import "react-datepicker/dist/react-datepicker.css";
import "./Dashboard.css";


const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

const copyDate = (date:Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const format = (days: Day[], start:Date, end:Date, metric:String) => {

    const destruct = (day_id: string) => {
        let [year, month, day] = day_id.split("-").map((d) => parseInt(d));
        month--;
        return [year, month, day];
    }

    let output: any = [["day", metric]];
    let current = copyDate(start);
    let index = 0;
    while(current <= end){
        const display = months[current.getMonth()] + " " + current.getDate(); 
        if(index < days.length){
            const [year, month, day]  = destruct(days[index].day_id);

            if(year === current.getFullYear() && month === current.getMonth() && day === current.getDate()){
                if(metric === "views"){
                    output.push([display, days[index].views]);
                }
                else if(metric === "reads"){
                    output.push([display, days[index].reads]);
                }
                else{
                    output.push([display, days[index].viewers]);
                }
                index++;
            }
            else{
                output.push([display, 0]);
            }
        }
        else{
            output.push([display, 0])
        }
        current.setDate(current.getDate() + 1);
    }
    return output;
}


const Dashboard = () => {
    const [data, setData] = useState<Day[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const currentDay = new Date();
    const [end, setEnd] = useState<Date>(currentDay);
    
    const startDay = copyDate(currentDay);
    startDay.setMonth(startDay.getMonth() - 1);
    const [start, setStart] = useState<Date>(startDay);

    const [metric, setMetric] = useState("views");
    const [metricData, setMetricData] = useState<any>({views: 0, reads:0, viewers:0})

    useEffect(() => {
        UsageApi.getUsage(start, end).then(({days, views, reads, viewers}) => {
            setData(days);
            setMetricData({views:views, reads:reads, viewers:viewers})
        }).finally(() => {
            setIsLoading(false);
        })
    }, [start, end]);

    const getTabs = () => {
        const metrics = ["views", "reads", "viewers"];
        return metrics.map((m) => {
            let textStyle: any = {
                margin: "10px"
            };
            if(metric === m){
                textStyle.color = "black";
                textStyle.textDecoration = "underline";
            }
            return <div className="tab" style={textStyle} onClick={()=>{
                setMetric(m);
            }}>
                {`${metricData[m]} ${m}`}
            </div>
        });
    }

    if (isLoading) {
        return (<div>
            Loading data... Hang on!
        </div>);
    }

    return (
        <div style={{
            width: "90%",
            textAlign: "center"
        }}>
            <div style={{
                fontSize: 28,
                marginBottom: "2%",
                marginTop: "2%"
            }}>
                Usage Tracking
            </div>
            <div>
                <div style={{
                    marginBottom: "5%",
                }}>
                    <span style={{
                        display: "inline-block",
                        paddingRight: "10px"
                    }}>
                        {"From "} 
                    </span>
                    <div style={{
                        display: "inline-block",
                        paddingRight: "10px"
                    }}>
                        <DatePicker selected={start} onChange={(date: Date) => {
                            if (date !== null) {
                                if(date >= end){
                                    const newEnd = copyDate(date);
                                    newEnd.setDate(newEnd.getDate() + 1);
                                    setEnd(newEnd);
                                }
                                setStart(date);
                            }
                        }}/>
                    </div>
                    <span style={{
                        display: "inline-block",
                        paddingRight: "10px"
                    }}>
                        {" to"} 
                    </span>
                    <div style={{
                        display: "inline-block"
                    }}>
                        <DatePicker selected={end} onChange={(date: Date) => {
                            if (date !== null) {
                                setEnd(date);
                            }
                        }} filterDate={(date) => {
                            return date >= start  
                        }}/>
                    </div>
                </div>
            </div>
            <div>
                {getTabs()}
                <Graph data={format(data, start, end, metric)} />
            </div>
        </div>)
};

export default Dashboard;