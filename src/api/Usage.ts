import fetch from "node-fetch";
import CONFIG from "../Config";
import {UsageData} from "../Types";

class UsageApi{

    static async getUsage(start:Date, end:Date) {
        const formatDate = (date:Date) => {
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
        const ep = new URL(CONFIG.URL + "/analytics");
        ep.searchParams.append("start_date", formatDate(start));
        ep.searchParams.append("end_date", formatDate(end));

        try{
            const response = await fetch(ep);
            if(response.status !== 200){
                throw Error("Failed to get usage analytics");
            }
            const usageData: UsageData = await response.json();
            return usageData;
        }
        catch(error){   
            throw Error(error.message);
        }
    };
}

export default UsageApi;