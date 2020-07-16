// this must be the first
import { config } from "dotenv";
config();

import Client from "../client";
import Environment from "../environment";
import FakeServer from "../fakeServer";
import RequestResponseLog from "../requestResponseLog";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import Server from "../server";
import Logger from "../logger";
const log: Logger = new Logger();

export const recordingModeActive = (): boolean => {
    if (process.argv.find((element) => element === "--record")) {
        return true;
    }
    return false;
}

export const getNextcloudClient = async (context: string): Promise<Client> => {

    const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
    rrLog.baseDirectory = "src/test/recordings/";
    await rrLog.setContext(context);

    // use command line parameter to override recording settings
    if (recordingModeActive()) {
        const ncserver: Server = new Environment().getServer();
        ncserver.logRequestResponse = true;
        // tslint:disable-next-line:no-console
        log.info("Test recording: " + rrLog.getFileName());
        return new Client(ncserver);
    } else {
        let entries: RequestResponseLogEntry[];
        try {
            entries = await rrLog.getEntries();
        } catch (e) {
            // throw new Error(`Error: recording does not exist for '${context}' file name; '${rrLog.getFileName()}'`);
            // tslint:disable-next-line:no-console
            // console.log(`recording does not exist for '${context}' file name; '${rrLog.getFileName()}'`);
            entries = [];
        }
        const fncserver: FakeServer = new FakeServer(entries);
        return new Client(fncserver);
    }
};
