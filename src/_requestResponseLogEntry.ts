/*

import debugFactory from "debug";
import { promises as fsPromises } from "fs";

const debug = debugFactory("RequestResponseLogEntry");
export interface IRequestLogEntry {
    body?: string;
    description?: string;
    method: string;
    url: string;
}
export interface IResponseLogEntry {
    body?: string;
    contentType: string | null;
    contentLocation: string | null;
    status: number;
}

export default class RequestResponseLogEntry {
    public static async getRequestResponseLogFromFile(fileName: string): Promise<RequestResponseLogEntry> {
        debug("Get fake response from " + fileName);

        const RequestResponseLogString = await fsPromises.readFile(fileName, { encoding: "utf8" });
        debug("RequestResponseLogString: ");
        debug(RequestResponseLogString);
        const obj = JSON.parse(RequestResponseLogString);
        debug("response status " + obj.response.status);
        return new RequestResponseLogEntry(obj.request, obj.response);
    }

    public readonly request: IRequestLogEntry;
    public readonly response: IResponseLogEntry;

    public constructor(request: IRequestLogEntry, response: IResponseLogEntry) {
        this.response = response;
        this.request = request;
    }

    public async save(fileName: string) {
        const content = JSON.stringify({ request: this.request, response: this.response }, null, 4);
        debug("Save fake response");
        await fsPromises.writeFile(fileName, content);
    }
}

*/
