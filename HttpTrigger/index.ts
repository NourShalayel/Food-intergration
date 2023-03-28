import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Tables } from "../Common/Constant/Tables";
import { DB_ORM } from "../Helper/DB";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { Establishments, establishmentTable } from "../models/Establishments";


// get all data
const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        console.log(req.headers);
        const schemaName: string | undefined = req.headers.schemaname;

        if (!schemaName) {
            context.res = {
                status: 400,
                body: "Missing schemaName header in the request"
            };
            return;
        }

        const id: number = Number(req.headers.id);
        // const establishment = DB_ORM.establishment(schemaName).establishment;

        // intialize table => get schemaName
        const test  = establishmentTable.schema(schemaName);

        // const getAllEstablishments = await establishment.findAll();


        const getAllEstablishments = await test.findAll();
        //    console.log(getAllEstablishments);


        const data: Establishments = JSON.parse(JSON.stringify(getAllEstablishments, null, 2));
        context.res = {
            status: 200,
            body: data ,
            headers: {
                'Content-Type': 'application/json'
              },
        };
    } catch (error) {

        console.error(error);
        context.res = {
            status: context.res.status,
            body: error
        };
    }
};

// create new establishment
const createEstablishment: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        console.log(req.headers);

        // get schemaName from header
        const schemaName: string | undefined = req.headers.schemaname;

        if (!schemaName) {
            context.res = {
                status: 400,
                body: "Missing schemaName header in the request"
            };
            return;
        }

        // get data from body request and parse json
        const dataReq = req.body
        const data: Establishments = JSON.parse(JSON.stringify(dataReq, null, 2));

        // pass schemaName
        const establishment =  (await DB_ORM.establishment(schemaName)).establishment ;

        // use sequlize to create
        const createEst = await establishment.create({ ...data });
        createEst.save();
        context.res = {
            status: 200,
            body: createEst
        }

    } catch (error) {
        console.error(error);
        context.res = {
            status: context.res.status,
            body: error
        }
    }


}

// update establishment
const updateEstablishment: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        console.log(req.headers);

        // get schemaName from header
        const id: number = Number(req.headers.id);
        const schemaName: string | undefined = req.headers.schemaname;

        if (!schemaName) {
            context.res = {
                status: 400,
                body: "Missing schemaName header in the request"
            };
            return;
        }

        // get data from body request and parse json
        const dataReq = req.body
        const data: Establishments = JSON.parse(JSON.stringify(dataReq, null, 2));

        // pass schemaName
        const establishment = (await DB_ORM.establishment(schemaName)).establishment ;

        // update establishment
        await establishment.update(
            { ...data },
            {
                where: { id: id }
            }

        );

        context.res = {
            status: 200,
            body: "Updated Successfully"
        }

    } catch (error) {
        console.error(error);
        context.res = {
            status: context.res.status,
            body: error
        }
    }
}


// remove establishment
const deleteEstablishment: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        console.log(req.headers);

        // get schemaName from header
        const id: number = Number(req.headers.id);
        const schemaName: string | undefined = req.headers.schemaname;

        if (!schemaName) {
            context.res = {
                status: 400,
                body: "Missing schemaName header in the request"
            };
            return;
        }

        // pass schemaName
        const establishment =  (await DB_ORM.establishment(schemaName)).establishment ;

        await establishment.destroy({
            where: { id: id },
        });

        context.res = {
            status: 200,
            body: "Deleted Successfully"
        }

    } catch (error) {
        console.error(error);
        context.res = {
            status: context.res.status,
            body: error
        }
    }
}


// get all data b use query
const getByQuery: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        console.log(req.headers);

        // get schemaName from header
        const id: number = Number(req.headers.id);
        const schemaName: string | undefined = req.headers.schemaname;

        if (!schemaName) {
            context.res = {
                status: 400,
                body: "Missing schemaName header in the request"
            };
            return;
        }

        // pass schemaName to get data

        const establishment = (await DB_ORM.establishment(schemaName)).establishment ;

        const data: Establishments = JSON.parse(JSON.stringify(establishment, null, 2));
        console.log(data);

        context.res = {
            status: 200,
            body: establishment
        }

    } catch (error) {
        console.error(error);
        context.res = {
            status: context.res.status,
            body: error
        }
    }

}
export default httpTrigger;




