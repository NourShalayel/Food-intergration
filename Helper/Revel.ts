import axios from "axios";
import { IRequestInput } from "../Interface/IRequest.interface";

export class Revel {
  public static RevelSendRequest =  async (req: IRequestInput):Promise<any> => {
    const options = {
      method: req.method,
      url: req.url,
      headers: {
        "Content-Type": req.headers.contentType,
        "API-AUTHENTICATION": `Bearer ${req.headers.token}`,
      },
      data: req.data,
    };

    try {
      const result = await axios.request(options);
      return result.data;
    } catch (error) {
      return error;
    }
  };
}
