
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    File,
    ICreateShare,
} from "../client";
import FakeServer from "../fakeServer";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("13-NEXCLOUD-NODE-CLIENT-SHARE", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it.skip("01 create public share", async () => {

        const fileName = "/test/share1/file2.txt";

        let file: File;

        file = await client.createFile(fileName, Buffer.from("this is a test text"));

        const createShare: ICreateShare = { resource: file };

        try {
            await client.createShare(createShare);
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }
        await file.delete();
    });

});
