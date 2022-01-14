"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// this must be the first
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const chai_1 = require("chai");
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
require("mocha");
const client_1 = require("../client");
const fakeServer_1 = __importDefault(require("../fakeServer"));
const testUtils_1 = require("./testUtils");
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("15-NEXCLOUD-NODE-CLIENT-NOTIFICATION", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 1000);
    it("01 client get notifications", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        let notifications = [];
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            notifications = yield lclient.getNotifications();
            //            console.log(notifications);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an array and no exception").to.be.equal("no exception");
        }
        (0, chai_1.expect)(notifications).to.be.a("array");
        (0, chai_1.expect)(notifications.length).to.be.equal(2);
    }));
    it("02 client get notifications no entries", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        let notifications = [];
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            notifications = yield lclient.getNotifications();
            //            console.log(notifications);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an empty array and no exception").to.be.equal("no exception");
        }
        (0, chai_1.expect)(notifications).to.be.a("array");
        (0, chai_1.expect)(notifications.length).to.be.equal(0);
    }));
    it("03 client get notifications invalid response", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.getNotifications();
        }
        catch (e) {
            error = e;
        }
        // expect(error).to.be.a("object");
        (0, chai_1.expect)(error).to.have.property("message");
        (0, chai_1.expect)(error.message).to.be.equal("Fatal Error: nextcloud notifications data missing");
    }));
    it.skip("04 send notification to user", () => __awaiter(this, void 0, void 0, function* () {
        let error;
        try {
            yield client.sendNotificationToUser("test", "Donnerwetter", "This is a real long Message");
        }
        catch (e) {
            error = e;
        }
        // expect(error).to.be.a("object");
        (0, chai_1.expect)(error).to.have.property("message");
        (0, chai_1.expect)(error.message).to.be.equal("Fatal Error: nextcloud notifications data missing");
    }));
});
