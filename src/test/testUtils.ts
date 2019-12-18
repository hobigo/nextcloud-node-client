// tslint:disable-next-line:no-var-requires
require("dotenv").config();

import debugFactory from "debug";
import NCClient, { FakeServer, NextcloudServer } from "../ncClient";
import RequestResponseLog from "../requestResponseLog";
import RequestResponseLogEntry from "../requestResponseLogEntry";

export const debug = debugFactory("Test");
// console.log(process.env);

export const getNextcloudClient = async (context: string): Promise<NCClient> => {

    const ncserver: NextcloudServer = NCClient.getCredentialsFromEnv();
    const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
    rrLog.baseDirectory = "testRecordings/";
    await rrLog.setContext(context);

    // use command line parameter to override recording settings
    if (process.argv.find((element) => element === "--record")) {
        ncserver.logRequestResponse = true;
    }

    if (ncserver.logRequestResponse) {
        // tslint:disable-next-line:no-console
        console.log("Test recording: " + rrLog.getFileName());
        return new NCClient(ncserver);
    } else {
        let entries: RequestResponseLogEntry[];
        try {
            entries = await rrLog.getEntries();
        } catch (e) {
            // throw new Error(`Error: recording does not exist for '${context}' file name; '${rrLog.getFileName()}'`);
            // tslint:disable-next-line:no-console
            console.log(`recording does not exist for '${context}' file name; '${rrLog.getFileName()}'`);
            entries = [];
        }
        const fncserver: FakeServer = new FakeServer(entries);
        return new NCClient(fncserver);
    }
};
