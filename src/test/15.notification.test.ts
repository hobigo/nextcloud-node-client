
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
import Share from "../share";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("15-NEXCLOUD-NODE-CLIENT-NOTIFICATION", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 client get notifications", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "Notifications get",
                method: "GET",
                url: "/ocs/v2.php/apps/notifications/api/v2/notification",
            },
            response: {
                body: "{\"ocs\":{\"data\":[{\"n1\":1},{\"n2\":2}]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        let notifications: object[] = [];
        const lclient: Client = new Client(new FakeServer(entries));
        try {
            notifications = await lclient.getNotifications();
            //            console.log(notifications);
        } catch (e) {
            expect(e.message, "expect an array and no exception").to.be.equal("no exception");
        }
        expect(notifications).to.be.a("array");
        expect(notifications.length).to.be.equal(2);

    });

    it("02 client get notifications no entries", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "Notifications get",
                method: "GET",
                url: "/ocs/v2.php/apps/notifications/api/v2/notification",
            },
            response: {
                body: "",
                contentType: "text/html; charset=UTF-8",
                status: 404,
            },
        });

        let notifications: object[] = [];
        const lclient: Client = new Client(new FakeServer(entries));
        try {
            notifications = await lclient.getNotifications();
            //            console.log(notifications);
        } catch (e) {
            expect(e.message, "expect an empty array and no exception").to.be.equal("no exception");
        }
        expect(notifications).to.be.a("array");
        expect(notifications.length).to.be.equal(0);

    });

    it("03 client get notifications invalid response", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "Notifications get",
                method: "GET",
                url: "/ocs/v2.php/apps/notifications/api/v2/notification",
            },
            response: {
                body: "{\"ocs\":{\"NOTFOUND-data\":[{\"n1\":1},{\"n2\":2}]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        let error;
        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getNotifications();
        } catch (e) {
            error = e;
        }
        // expect(error).to.be.a("object");
        expect(error).to.have.property("message");
        expect(error.message).to.be.equal("Fatal Error: nextcloud notifications data missing");

    });
});
