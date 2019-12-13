
import debugFactory from "debug";
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
    private active: boolean = false;
    private context: string = "";
    private entries: requestResponseLogEntry[] = [];
    /*
        public isActive(): boolean {
            return this.active;

                if ((process.env.TEST_RECORDING_ACTIVE &&
                    (process.env.TEST_RECORDING_ACTIVE === "0" || process.env.TEST_RECORDING_ACTIVE === "false" || process.env.TEST_RECORDING_ACTIVE === "inactive")) ||
                    !process.env.TEST_RECORDING_ACTIVE) {
                    debug("test recording inactive");
                    return false;
                }
                debug("test recording active");
                return true;

        }

        public activate() {
            this.active = true;
        }

        public deactivate() {
            this.active = false;
        }
    */
    public async addEntry(logEntry: requestResponseLogEntry) {
        debug("addEntry");
        /*
        if (!this.isActive()) {
            return;
        }
        */
        if (!this.context) {
            debug("Error while recording, context not set");
            throw new Error("Error while recording, context not set");
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
        this.context = context.replace(/ |:|\./g, "_");
        this.entries = [];

        // create the directory
        await this.assertDirectory(this.getFileName());
    }

    private getFileName(): string {
        return `${this.baseDirectory}${this.context}.json`;
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
