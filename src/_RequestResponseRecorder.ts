/*
import debugFactory from "debug";
import { promises as fsPromises } from "fs";
import RequestResponseLog, {
    IRequestLog,
    IResponseLog,
} from "./RequestResponseLog";

const debug = debugFactory("RequestResponseRecorder");

export default class RequestResponseRecorder {
    public static readonly defaultRecorderDirectory: string = "RequestResponseLog";

    public static getInstance(): RequestResponseRecorder {
        if (!RequestResponseRecorder.recorder) {
            RequestResponseRecorder.recorder = new RequestResponseRecorder();
        }
        return RequestResponseRecorder.recorder;
    }

    public static deleteInstance(): void {
        RequestResponseRecorder.recorder = null;
    }

    private static recorder: RequestResponseRecorder | null = null;
    private context: string = "";
    private baseDirectory: string = RequestResponseRecorder.defaultRecorderDirectory;
    private recordingCount: number = 1000;

    public isActive(): boolean {
        if ((process.env.TEST_RECORDING_ACTIVE &&
            (process.env.TEST_RECORDING_ACTIVE === "0" || process.env.TEST_RECORDING_ACTIVE === "false" || process.env.TEST_RECORDING_ACTIVE === "inactive")) ||
            !process.env.TEST_RECORDING_ACTIVE) {
            debug("test recording inactive");
            return false;
        }
        debug("test recording active");
        return true;
    }

    public async record(request: IRequestLog, response: IResponseLog) {
        debug("record");
        if (!this.isActive()) {
            return;
        }
        if (!this.context) {
            debug("Error while recording, context not set");
            throw new Error("Error while recording, context not set");
        }

        this.recordingCount++;
        const fileName = `${this.getDirectory()}/${this.recordingCount}.json`;

        const reqResLog: RequestResponseLog = new RequestResponseLog(request, response);
        await reqResLog.save(fileName);
    }

    public async getRecordedResponse(): Promise<IResponseLog> {
        debug("getRecordedResponse");
        if (!this.context) {
            debug("Error while getting recording request, context not set");
            throw new Error("Error while getting recording request, context not set");
        }

        this.recordingCount++;
        const fileName = `${this.getDirectory()}/${this.recordingCount}.json`;
        debug("Get fake response from " + fileName);
        const reqResLog: RequestResponseLog = await RequestResponseLog.getRequestResponseLogFromFile(fileName);
        return reqResLog.response;
    }

    public async setContext(context: string) {
        debug("setContext");
        this.context = context.replace(/ |:|\./g, "_");
        this.recordingCount = 1000;

        // create the directory
        await this.assertDirectory(this.getDirectory());
    }

    private getDirectory(): string {
        return `${RequestResponseRecorder.recorderDirectory}/${this.context}`;
    }

    private async assertDirectory(directory: string): Promise<void> {
        const pathArray: string[] = directory.split("/");
        let path: string = "";

        for (const dir of pathArray) {
            if (path === "") {
                path = dir;
            } else {
                path = path + "/" + dir;
            }

            try {
                await fsPromises.mkdir(path);
                debug(`directory "${path}" created`);
            } catch (e) {
                debug(`directory "${path}" already exists`);
            }

        }
    }
}

*/
