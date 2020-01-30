
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    ISystemInfo,
} from "../client";
import FakeServer from "../fakeServer";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("12-NEXCLOUD-NODE-CLIENT-USER-MANAGEMENT", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 get users", async () => {

        let users;
        try {
            users = await client.getUserIDs();
            // console.log(JSON.stringify(users, null, 4));
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }

    });

    it.skip("02 create users", async () => {

        try {
            await client.createUser({ userId: "ncnc-test-user-id-1", password: "This is a Password #2#3", displayName: "Petra Huber" });
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }
    });
});
