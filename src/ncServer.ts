import debugFactory from "debug";
import { IProxy } from "./ncHttpClient";

const debug = debugFactory("NCServer");

export interface IBasicAuth {
    "username": string;
    "password": string;
}

// tslint:disable-next-line: max-classes-per-file
export class NCServer {
    public url: string;
    public basicAuth: IBasicAuth;
    public proxy?: IProxy;
    public logRequestResponse: boolean;
    public constructor(url: string, basicAuth: IBasicAuth, proxy?: IProxy, logRequestResponse: boolean = false) {
        debug("constructor");
        this.url = url;
        this.basicAuth = basicAuth;
        this.proxy = proxy;
        this.logRequestResponse = logRequestResponse;
    }
}
