import { AxiosHeaders, AxiosRequestConfig } from "axios";
import { IsEnum, IsString } from "class-validator";
import { MethodEnum } from "../Common/Enums/Method.enum";

export interface Header {
  contentType: string;
  token: string;
}
