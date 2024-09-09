import axios from "axios";
import { IRequestInput } from "../Interface/IRequest";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { MethodEnum } from "../Enums/Method";

export class Revel {
  public static RevelSendRequest =  async (req: IRequestInput):Promise<any> => {
    const options = {
      method: req.method,
      url: req.url,
      headers: {
        "Content-Type": req.headers.contentType,
        "API-AUTHENTICATION": ` ${req.headers.token}`,
      },
      data: req.data,
    };

    try {
      console.log(`options ${JSON.stringify(options)}`)
      const result = await axios.request(options);
      console.log(`result ${result}`)

      return result.data;
    } catch (error) {
      return error;
    }
  };


}
