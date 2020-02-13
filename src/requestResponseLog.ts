
import debugFactory from "debug";
import parser from "fast-xml-parser";
import { promises as fsPromises } from "fs";
import path from "path";
import requestResponseLogEntry from "./requestResponseLogEntry";

const debug = debugFactory("RequestResponseLog");

export default class RequestResponseLog {
    public static readonly defaultLogDirectory: string = "RequestResponseLog/";

    public static deleteInstance(): void {
        RequestResponseLog.log = null;
    }
    public static getInstance(): RequestResponseLog {
        if (!RequestResponseLog.log) {
            RequestResponseLog.log = new RequestResponseLog();
        }
        return RequestResponseLog.log;
    }
    private static log: RequestResponseLog | null = null;

    public baseDirectory: string = RequestResponseLog.defaultLogDirectory;
    private context: string;
    private entries: requestResponseLogEntry[] = [];
    private constructor() {
        this.baseDirectory = RequestResponseLog.defaultLogDirectory;
        this.context = "";
    }

    public async addEntry(logEntry: requestResponseLogEntry) {
        debug("addEntry");
        if (!this.context) {
            debug("Error while recording, context not set");
            throw new Error("Error while recording, context not set");
        }
        if (logEntry.response.body && logEntry.response.contentType) {
            if (logEntry.response.contentType.indexOf("application/xml") !== -1) {
                logEntry.response.jsonBody = this.xmlToJson(logEntry.response.body);
            }
            if (logEntry.response.contentType.indexOf("application/json") !== -1) {
                logEntry.response.jsonBody = JSON.parse(logEntry.response.body);
            }
        }

        if (logEntry.request.body) {
            if (logEntry.request.body.indexOf && logEntry.request.body.indexOf("<?xml version") !== -1) {
                logEntry.request.jsonBody = this.xmlToJson(logEntry.request.body);
            }
        }

        this.entries.push(logEntry);
        await fsPromises.writeFile(this.getFileName(), JSON.stringify(this.entries, null, 4));
    }

    public async getEntries(): Promise<requestResponseLogEntry[]> {
        debug("getEntries");
        if (!this.context) {
            debug("Error while getting recording request, context not set");
            throw new Error("Error while getting recording request, context not set");
        }

        const entries: string = await fsPromises.readFile(this.getFileName(), { encoding: "utf8" });
        return JSON.parse(entries);
    }

    public async setContext(context: string) {
        debug("setContext");
        const newContext: string = context.replace(/ |:|\./g, "_");
        // if (this.context !== newContext) {
        this.context = newContext;
        this.entries = [];
        // }
        // create the directory
        await this.assertDirectory(this.getFileName());
    }

    public getFileName(): string {
        return `${this.baseDirectory}${this.context}.json`;
    }

    private xmlToJson(xml: string): any {
        if (parser.validate(xml) === true) {
            return parser.parse(xml, { ignoreNameSpace: true });
        }
        return { info: "invalid xml" };
    }

    private async assertDirectory(filename: string): Promise<void> {
        const directory = path.dirname(filename);
        const pathArray: string[] = directory.split("/");
        let p: string = "";

        for (const dir of pathArray) {
            if (p === "") {
                p = dir;
            } else {
                p = p + "/" + dir;
            }

            try {
                await fsPromises.mkdir(p);
                debug(`directory "${p}" created`);
            } catch (e) {
                debug(`directory "${p}" already exists`);
            }
        }
    }
}
