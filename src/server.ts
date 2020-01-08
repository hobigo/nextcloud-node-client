import debugFactory from "debug";
import { IProxy } from "./httpClient";

const debug = debugFactory("NCServer");

export interface IBasicAuth {
    "username": string;
    "password": string;
}

export interface IServerOptions {
    "url": string;
    "basicAuth": IBasicAuth;
    "proxy"?: IProxy;
    "logRequestResponse"?: boolean;
}

// tslint:disable-next-line: max-classes-per-file
export default class Server {
    public url: string;
    public basicAuth: IBasicAuth;
    public proxy?: IProxy;
    public logRequestResponse: boolean;
    //    public constructor(url: string, basicAuth: IBasicAuth, proxy?: IProxy, logRequestResponse: boolean = false) {
    public constructor(options: IServerOptions) {
        debug("constructor");
        this.url = options.url;
        this.basicAuth = options.basicAuth;
        this.proxy = options.proxy;
        if (options.logRequestResponse) {
            this.logRequestResponse = true;
        } else {
            this.logRequestResponse = false;
        }
    }
}
