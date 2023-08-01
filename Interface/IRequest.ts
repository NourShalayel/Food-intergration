import { Header } from "./IHeader";

export interface IRequestInput {
  method: string;
  url: string;
  headers: Header;
  data?: any;
}

