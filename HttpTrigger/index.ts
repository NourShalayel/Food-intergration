import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { JsonConvert } from "json2typescript";
import moment = require("moment");
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { DB } from "../Helper/DB";
import { RevelSendRequest } from "../Helper/sendRequest";
import { Utils } from "../Helper/Utils";
import { ICustomMenu, IMenu } from "../Interface/ICustomMenu.interface";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { ICategories, ICategory, IFoodbitMenu, IRevelMenu, IRevelProduct } from "../Interface/IMenu.interface";

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {
    try {

        const schemaName: string | undefined = req.headers.schemaname;

        if (!schemaName) {
            context.res = {
                status: 400,
                body: "Missing schemaName header in the request"
            };
            return;
        }

        // get revelAccount from header to get schemaName from database 
        const account: string | undefined = req.headers.revelaccount;
        if (!account) {
            context.res = {
                status: 400,
                body: "Missing RevelAccount header in the request"
            };
            return;
        }

        // get accountconfig and customMenu from database 
        const accountConfig: IAccountConfig = await DB.getAccountConfig(account);
        const CustomMenu: ICustomMenu[] = await DB.getCustomMenu(accountConfig.SchemaName)

        const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`

        //get data from revel based on customMenu name and establishment 
        const AllCustommenu  : IMenu[]= await Promise.all(CustomMenu.map(async element => {
            const menus = await RevelSendRequest({
                url: `${baseURL}${SystemUrl.REVELMENU}?establishment= ${element.LocationId}&name=${element.MenuName}`,
                headers: { contentType: "application/json", token: `${accountConfig.RevelAuth}` },
                method: MethodEnum.GET,
            });
            const AllMenus: IMenu = {
                LocationId: element.LocationId,
                MenuName: element.MenuName,
                data: menus
            }
            return AllMenus;
        }));


        // prepaer payload to post foodbit 

        context.res = {
            status: 200,
            body: AllCustommenu,
            headers: {
                'Content-Type': 'application/json'
            },
        };

        //get all categories 


        // prepare payload 
        // const menu = allMenu.categories.map((data) => {
        //     const categories: ICategories[] = [{
        //         merchantId: merchantId,
        //         items: data.products.map((item) => ({
        //             id: item.id.toString(),
        //             createdDate: date.toString(),
        //             notTaxable: false,
        //             merchantId: merchantId,
        //             calories: 200,
        //             total: item.cost,
        //             price: item.price,
        //         })),
        //         nameEn: data.name,
        //         itemsCount: data.products.length
        //     }]

        //     const foodbitData: IFoodbitMenu = {
        //         id: (data.id).toString(),
        //         createdDate: date.toString(),
        //         lastUpdated: date.toString(),
        //         merchantId: merchantId,
        //         entityType: "MENU",
        //         isDefault: false,
        //         isHidden: false,
        //         categories: categories,
        //         availability: undefined
        //     }
        //     return foodbitData;
        // })
        // context.res = {
        //     status: 200,
        //     body: categories,
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        // };

    } catch (error) {
        console.error(error); context.res =
        {
            status:
                context.res.status,
            body: error
        };
    }
};
export default httpTrigger;




