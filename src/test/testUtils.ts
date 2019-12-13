import NCClient, { FakeServer, NextcloudServer } from "../ncClient";
import RequestResponseLog from "../requestResponseLog";

export const getNextcloudClient = async (context: string): Promise<NCClient> => {

    const ncserver: NextcloudServer = NCClient.getCredentialsFromEnv();
    const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
    await rrLog.setContext(context);

    if (ncserver.logRequestResponse) {
        return new NCClient(ncserver);
    } else {
        const fncserver: FakeServer = new FakeServer(await rrLog.getEntries());
        return new NCClient(fncserver);
    }
};
