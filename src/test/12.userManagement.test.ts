
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    QueryLimitError,
    QueryOffsetError,
    UserGroup,
    UserGroupAlreadyExistsError,
    UserGroupDeletionFailedError,
    UserGroupDoesNotExistError
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
            await client.createUser({ userId: "ncnc-test-user-id-1", password: "This is a Password #2#3" });
            await client.createUser({ userId: "ncnc-test-user-id-1", email: "test@test.de" });
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }
    });

    it("20 get user groups", async () => {

        let exception;
        try {
            await client.getUserGroups("", -10);
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(QueryLimitError);

        try {
            await client.getUserGroups("", 10, -1);
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(QueryOffsetError);

        exception = null;
        let userGroups: UserGroup[];
        try {
            userGroups = await client.getUserGroups("no group should ever match this string", 0, 0);
        } catch (e) {
            exception = e;
        }

        expect(exception).to.be.equal(null);
        expect(userGroups!).not.to.be.equal(undefined);
        expect(userGroups!.length).to.be.equal(0);

        try {
            userGroups = await client.getUserGroups();
        } catch (e) {
            exception = e;
        }

        expect(exception).to.be.equal(null);
        expect(userGroups!).not.to.be.equal(undefined);

    });

    it("21 get create delete user group", async () => {

        const userGroupId = "test 11"
        let userGroup: UserGroup | null = null;
        let exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);

        if (userGroup) {
            try {
                await userGroup.delete();
            } catch (e) {
                exception = e;
            }
        }

        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        // now the user group is deleted
        try {
            await client.createUserGroup(userGroupId);
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        try {
            await client.createUserGroup(userGroupId);
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(UserGroupAlreadyExistsError);

        exception = null;
        try {
            userGroup = await client.getUserGroup(userGroupId + " this group should never exist")
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(userGroup).to.be.equal(null);

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroup).not.to.be.equal(null);

        try {
            await userGroup!.delete();
        } catch (e) {
            exception = e;
        }
        expect(exception, "delete user should not raise an exception").to.be.equal(null);

    });

    it("22 delete admin user group fails", async () => {

        const userGroupId = "admin"
        let userGroup: UserGroup | null = null;
        let exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);

        if (userGroup) {
            try {
                await userGroup.delete();
            } catch (e) {
                exception = e;
            }
        }

        expect(exception).to.be.instanceOf(UserGroupDeletionFailedError);

    });

    it("23 get members of user group", async () => {

        const userGroupId = "admin"
        let userGroupMembers: string[] = [];
        let exception = null;

        try {
            userGroupMembers = await client.getUserGroupMembers(userGroupId)
        } catch (e) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroupMembers!.length).to.be.greaterThan(0);

        try {
            await client.getUserGroupMembers(userGroupId + " this group should never exist")
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(UserGroupDoesNotExistError);

        let userGroup: UserGroup | null = null;
        exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroup, "get user group admin is always there").not.to.be.equal(null);

        try {
            await userGroup!.getMemberUserIds();
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
    });

    it.only("24 get subadmins of user group", async () => {

        const userGroupId = "admin"
        let userGroupSubadamins: string[] = [];
        let exception = null;

        try {
            userGroupSubadamins = await client.getUserGroupSubadmins(userGroupId)
        } catch (e) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroupSubadamins!.length).to.be.greaterThan(-1);

        try {
            await client.getUserGroupSubadmins(userGroupId + " this group should never exist")
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(UserGroupDoesNotExistError);

        let userGroup: UserGroup | null = null;
        exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroup, "get user group admin is always there").not.to.be.equal(null);

        try {
            await userGroup!.getSubadminUserIds();
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
    });

});
