
import debugFactory from "debug";
import { promises as fsPromises } from "fs";

const debug = debugFactory("TestRecorder");
export interface IRecordingRequest {
    body?: string;
    description?: string;
    headers?: { [key: string]: string };
    method: string;
    url: string;
}
export interface IRecordingResponse {
    body?: string;
    contentType: string | null;
    contentLocation: string | null;
    status: number;
}

export default class TestRecorder {
    public static recorderDirectory: string = "src/test/recordings";

    public static getInstance(): TestRecorder {
        if (!TestRecorder.recorder) {
            TestRecorder.recorder = new TestRecorder();
        }
        return TestRecorder.recorder;
    }

    public static deleteInstance(): void {
        TestRecorder.recorder = null;
    }

    private static recorder: TestRecorder | null = null;
    private context: string = "";
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

    public async record(request: IRecordingRequest, response: (IRecordingResponse)) {
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

        const content = JSON.stringify({ request, response }, null, 4);
        await fsPromises.writeFile(fileName, content);
    }

    public async getRecordedResponse(): Promise<IRecordingResponse> {
        debug("getRecordedResponse");
        if (!this.context) {
            debug("Error while getting recording request, context not set");
            throw new Error("Error while getting recording request, context not set");
        }

        this.recordingCount++;
        const fileName = `${this.getDirectory()}/${this.recordingCount}.json`;

        debug("Get fake response from " + fileName);

        const fakeResponseString = await fsPromises.readFile(fileName, { encoding: "utf8" });
        debug("fakeResponseString");
        debug(fakeResponseString);
        debug("response status " + JSON.parse(fakeResponseString).response.status);
        return JSON.parse(fakeResponseString).response;
    }

    public async setContext(context: string) {
        debug("setContext");
        this.context = context.replace(/ |:|\./g, "_");
        this.recordingCount = 1000;

        // create the directory
        await this.assertDirectory(this.getDirectory());
    }

    private getDirectory(): string {
        return `${TestRecorder.recorderDirectory}/${this.context}`;
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
