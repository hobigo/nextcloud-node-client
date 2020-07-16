import { IProxy } from "./httpClient";
import Logger from "./logger";
const log: Logger = new Logger();

export interface IBasicAuth {
    "username": string;
    "password": string;
}

/**
 * The options of a server constructor
 */
export interface IServerOptions {
    /**
     * the url of the nextcloud server like https://nextcloud.mydomain.com
     */
    "url": string;
    /**
     * basic authentication informatin to access the nextcloud server
     */
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
        log.debug("constructor");
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
