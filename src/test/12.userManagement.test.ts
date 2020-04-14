
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

    it("02 get users with wrong response", async () => {
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "Users get",
                method: "GET",
                url: "/ocs/v1.php/cloud/users",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"usersXXX\":[\"holger\",\"htborstenson\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));

        let users;
        try {
            users = await lclient.getUserIDs();
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }
        expect(users).to.be.a("array");
        if (users) {
            expect(users.length, "expect an empty user list").to.be.equal(0);
        }

    });

    it.skip("03 create user", async () => {

        try {
            await client.createUser({ userId: "ncnc-test-user-id-1", password: "This is a Password #2#3", displayName: "Petra Huber" });
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }
    });
});
