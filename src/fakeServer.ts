// tslint:disable-next-line:no-var-requires
require("dotenv").config();

import debugFactory from "debug";
import {
    RequestInit,
    Response,
    ResponseInit,
} from "node-fetch";
import { IRequestContext } from "./ncHttpClient";
import RequestResponseLogEntry from "./requestResponseLogEntry";

const debug = debugFactory("FakeServer");

export default class FakeServer {
    public fakeResponses: RequestResponseLogEntry[] = [];
    public constructor(fakeResponses: RequestResponseLogEntry[]) {
        this.fakeResponses = fakeResponses;
    }
    public async getFakeHttpResponse(url: string, requestInit: RequestInit, expectedHttpStatusCode: number[], context: IRequestContext): Promise<Response> {
        debug("getFakeHttpResponse");
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
            debug("getHttpResponse unexpected status response %s", response.status + " " + response.statusText);
            debug("getHttpResponse description %s", context.description);
            debug("getHttpResponse expected %s", expectedHttpStatusCode.join(","));
            debug("getHttpResponse headers %s", JSON.stringify(response.headers, null, 4));
            debug("getHttpResponse request body %s", requestInit.body);
            debug("getHttpResponse text %s", await response.text());
            throw new Error(`HTTP response status ${response.status} not expected. Expected status: ${expectedHttpStatusCode.join(",")} - status text: ${response.statusText}`);
        }
        return response;
    }
}
