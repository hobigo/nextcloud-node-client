import {
    RequestInit,
    Response,
    ResponseInit,
} from "node-fetch";
import { IRequestContext } from "./httpClient";
import RequestResponseLogEntry from "./requestResponseLogEntry";
import Logger from "./logger";
const log: Logger = new Logger();

export default class FakeServer {
    public fakeResponses: RequestResponseLogEntry[] = [];
    public constructor(fakeResponses: RequestResponseLogEntry[]) {
        this.fakeResponses = fakeResponses;
    }
    public async getFakeHttpResponse(url: string, requestInit: RequestInit, expectedHttpStatusCode: number[], context: IRequestContext): Promise<Response> {
        log.debug("getFakeHttpResponse");
        if (!requestInit.method) {
            requestInit.method = "UNDEFINED";
        }

        const rrEntry: RequestResponseLogEntry | undefined = this.fakeResponses.shift();
        if (!rrEntry) {
            throw new Error(`error providing fake http response. No fake response available`);
        }
        const responseInit: ResponseInit = {
            status: rrEntry.response.status,
        };

        const response: Response = new Response(rrEntry.response.body, responseInit);

        if (rrEntry.response.contentType) {
            response.headers.append("Content-Type", rrEntry.response.contentType);
        }

        if (rrEntry.response.contentLocation) {
            response.headers.append("Content-Location", rrEntry.response.contentLocation);
        }

        if (expectedHttpStatusCode.indexOf(response.status) === -1) {
            log.debug("getHttpResponse unexpected status response ", response.status + " " + response.statusText);
            log.debug("getHttpResponse description ", context.description);
            log.debug("getHttpResponse expected ", expectedHttpStatusCode.join(","));
            log.debug("getHttpResponse headers ", JSON.stringify(response.headers, null, 4));
            log.debug("getHttpResponse request body ", requestInit.body);
            log.debug("getHttpResponse text ", await response.text());
            throw new Error(`HTTP response status ${response.status} not expected. Expected status: ${expectedHttpStatusCode.join(",")} - status text: ${response.statusText}`);
        }
        return response;
    }
}
