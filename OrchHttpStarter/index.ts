import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as df from "durable-functions"

const httpStart: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> {
  
    const account: string | undefined = req.headers.revelaccount;

    console.log(`this is revel account ${account}`)
    const client = df.getClient(context);
    const timeStamp = new Date().toISOString();
    const instanceId = `Migration_job_${timeStamp}`;
    client.startNew('PostMenuFoodbitOrch',instanceId , account);
    return context.bindings.response = {
        status: 200,
        body: { jop: "PostMenuFoodbitOrch", id: instanceId },
        headers: { 'Content-Type': 'application/json' }
    };
};

export default httpStart;