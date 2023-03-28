
import { Header } from "./IHeader.interface";

export interface IRequestInput {
  method: string;
  url: string;
  headers: Header;
  data?: any;
}

