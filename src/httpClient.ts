import httpProxyAgent from "http-proxy-agent";
import { HttpProxyAgentOptions } from "http-proxy-agent";
import fetch from "node-fetch";
import { Headers, RequestInit, Response } from "node-fetch";
import ClientError from "./error";
import RequestResponseLog from "./requestResponseLog";
import RequestResponseLogEntry, {
  RequestLogEntry,
  ResponseLogEntry
} from "./requestResponseLogEntry";
import Logger from "./logger";
const log: Logger = new Logger();

export interface IRequestContext {
  description?: string;
}

export interface IProxy {
  host: string;
  port: string;
  protocol: string;
  secureProxy: boolean;
  proxyAuthorizationHeader?: string;
}

export interface IHttpClientOptions {
  authorizationHeader?: string;
  logRequestResponse?: boolean;
  proxy?: IProxy;
  origin?: string;
}
export class HttpClient {
  private proxy?: IProxy;
  private authorizationHeader?: string;
  private logRequestResponse: boolean;
  private origin: string;

  public constructor(options: IHttpClientOptions) {
    log.debug("constructor");
    this.authorizationHeader = options.authorizationHeader;
    this.proxy = options.proxy;
    this.logRequestResponse = options.logRequestResponse || false;
    this.origin = options.origin || "";
  }
  public async getHttpResponse(
    url: string,
    requestInit: RequestInit,
    expectedHttpStatusCode: number[],
    context: IRequestContext
  ): Promise<Response> {
    if (!requestInit.headers) {
      requestInit.headers = new Headers();
    }

    if (!requestInit.method) {
      requestInit.method = "UNDEFINED";
    }

    if (!context.description) {
      context.description = "";
    }

    if (this.authorizationHeader) {
      (requestInit.headers as Headers).append(
        "Authorization",
        this.authorizationHeader
      );
    }
    (requestInit.headers as Headers).append(
      "User-Agent",
      "nextcloud-node-client"
    );

    // set the proxy
    if (this.proxy) {
      log.debug("proxy agent used");
      const options: HttpProxyAgentOptions = {
        host: this.proxy.host,
        port: this.proxy.port,
        protocol: this.proxy.protocol
      };

      requestInit.agent = httpProxyAgent(options);

      if (this.proxy.proxyAuthorizationHeader) {
        (requestInit.headers as Headers).append(
          "Proxy-Authorization",
          this.proxy.proxyAuthorizationHeader
        );
      }
    }

    log.debug("getHttpResponse request header:", requestInit.headers);
    log.debug("getHttpResponse url", url, requestInit);

    const response: Response = await fetch(url, requestInit);

    if (this.logRequestResponse) {
      const responseText = await response.text();

      // overwrite response functions as the body uses a stearm object...
      response.text = () => {
        return Promise.resolve(responseText);
      };

      if (response.body) {
        response.body.pipe = (
          destination: NodeJS.WritableStream,
          options?: { end?: boolean }
        ): any => {
          destination.write(responseText);
        };
      }

      response.json = () => {
        return Promise.resolve(JSON.parse(responseText));
      };

      response.arrayBuffer = () => {
        return Promise.resolve(Buffer.from(responseText));
      };

      let body = `<Body is ${typeof requestInit.body}>`;
      if (requestInit.body && requestInit.body instanceof Buffer) {
        body = `<Body is Buffer ${requestInit.body.length}>`;
      }

      if (typeof requestInit.body === "string") {
        body = requestInit.body;
      }

      const reqLogEntry: RequestLogEntry = new RequestLogEntry(
        url.replace(this.origin, ""),
        requestInit.method,
        context.description,
        body
      );

      const resLogEntry: ResponseLogEntry = new ResponseLogEntry(
        response.status,
        await response.text(),
        response.headers.get("Content-Type") as string,
        response.headers.get("Content-Location") || ""
      );

      const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
      await rrLog.addEntry(
        new RequestResponseLogEntry(reqLogEntry, resLogEntry)
      );
    }

    // const responseContentType: string | null = response.headers.get("content-type");

    if (expectedHttpStatusCode.indexOf(response.status) === -1) {
      log.debug(
        `getHttpResponse unexpected status response ${response.status} ${response.statusText}`
      );
      log.debug("getHttpResponse description " + context.description);
      log.debug("getHttpResponse expected " + expectedHttpStatusCode.join(","));
      log.debug(
        "getHttpResponse headers ",
        JSON.stringify(response.headers, null, 4)
      );
      log.debug("getHttpResponse request body ", requestInit.body);
      log.debug("getHttpResponse text:", await response.text());
      throw new ClientError(
        `HTTP response status ${
          response.status
        } not expected. Expected status: ${expectedHttpStatusCode.join(
          ","
        )} - status text: ${response.statusText}`,
        "ERR_UNEXPECTED_HTTP_STATUS",
        {
          expectedHttpStatusCodes: expectedHttpStatusCode,
          responseStatus: response.status,
          responseStatusText: response.statusText
        }
      );
    }
    return response;
  }
}
