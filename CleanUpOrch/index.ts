import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as I from '../Interface'
import * as df from "durable-functions"
import * as moment from "moment";


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> {

    const from: string = req.headers["from"] || null;
    const to: string = req.headers["to"] || null;
    const failed: string = req.headers["failed"] || null;
    const client = df.getClient(context);


    // Generate from,to dates
    const cleaneingDates: I.RunDate = checkPurgeInstanceHistoryDate(from, to);

    // Check add failed status
    const failedCheck: boolean = !!(failed && failed === "true");

    // Error with generating dates
    if (cleaneingDates.error) {
        context.res = {
            status: 400,
            body: {
                input: {
                    from: from,
                    to: to,
                    failedJobs: failedCheck,
                },
                message: "Please check your inputs, Supported date format 'yyyy-MM-dd'.",
                error: cleaneingDates.error,
                errorMessage: cleaneingDates.message,
            },
        };
        return context.bindings.response = {
            status: 400,
            body: cleaneingDates.error,
            headers: { 'Content-Type': 'application/json' }
        };
    
    }


    // Orch run status
    const runtimeStatuses = [df.OrchestrationRuntimeStatus.Completed, df.OrchestrationRuntimeStatus.Canceled];
    if (failedCheck) { runtimeStatuses.push(df.OrchestrationRuntimeStatus.Failed); }

    // Get the durable function client
    // const client: DurableOrchestrationClient = context.bindings.orch;

    // Call clean storage function
    let purgeResult = await client.purgeInstanceHistoryBy(
        new Date(cleaneingDates.from)
        , new Date(cleaneingDates.to),
         runtimeStatuses);

    // Log information about instances deleted
    context.log(`Scheduled cleanup done, ${purgeResult.instancesDeleted} instances deleted`);

    // Prepare response
    let result: any = {
        from: cleaneingDates.from,
        to: cleaneingDates.to,
        failedJobs: failedCheck,
        deletedInstancesCount: purgeResult.instancesDeleted
    };

    return context.bindings.response = {
        status: 200,
        body: result,
        headers: { 'Content-Type': 'application/json' }
    };


    
};
const checkPurgeInstanceHistoryDate = (from = null, to = null) => {
    let rangeDates: I.RunDate = {
        error: false,
        message: "",
        from: "",
        to: ""
    };
    try {
        let currentDay = moment();
        rangeDates.from = currentDay.clone().subtract(1, 'days').format("YYYY-MM-DD");
        rangeDates.to = currentDay.clone().format("YYYY-MM-DD");
        if (from) {
            rangeDates.from = moment(from, "yyyy-MM-DD").format("YYYY-MM-DD");
        }
        if (to) {
            rangeDates.to = moment(to, "yyyy-MM-DD").format("YYYY-MM-DD");
        }
        console.log("rangeDates", rangeDates);
    }
    catch (error) {
        rangeDates.error = true;
        rangeDates.message = error.Message;
    }
    return rangeDates;
}

export default httpTrigger;