
import { expect } from "chai";
import fs from "fs";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import path from "path";
import {
    Client,
    File,
    ICreateShare,
} from "../client";
import FakeServer from "../fakeServer";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import Share from "../share";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("14-NEXCLOUD-NODE-CLIENT-STREAMS", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 create file from stream", async () => {

        const rStream: NodeJS.ReadableStream = fs.createReadStream(__filename);

        const fileName = "/ncncTest/streams/" + path.basename(__filename);
        console.log(fileName);

        let file: File;

        file = await client.createFile(fileName, rStream);
        /*
            try {
                await share.setPassword("some password");
            } catch (e) {
                expect(e.message, "expect no exception setting password").to.be.equal(null);
            }
*/
        await file.delete();
    });

    it.skip("02 pipe file content stream", async () => {

        const sourceFileName = "./src/test/data/text1.txt";
        const rStream: NodeJS.ReadableStream = fs.createReadStream(sourceFileName);

        const fileName = "/ncncTest/streams/" + path.basename(sourceFileName);
        console.log(fileName);

        let file: File;

        file = await client.createFile(fileName, rStream);
        /*
            try {
                await share.setPassword("some password");
            } catch (e) {
                expect(e.message, "expect no exception setting password").to.be.equal(null);
            }
        */

        const dest = fs.createWriteStream("./tmp/" + path.basename(sourceFileName));
        await client.pipeContentStream(fileName, dest);

        await file.delete();
    });

});
