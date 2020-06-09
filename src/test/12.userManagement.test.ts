
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
    UserGroupDoesNotExistError,
    IUserOptionsQuota,
    IUserQuotaUserFriendly,
    User,
    UserNotFoundError,
    UserCreateError,
    UserAlreadyExistsError,
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

    it("01 delete non existing user", async () => {
        const userId: string = "testUser01";
        let error: Error | null = null;
        try {
            await client.deleteUser(userId);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("02 get non existing user", async () => {
        const userId: string = "testUser02";
        let error: Error | null = null;
        let user: User | null = null;
        try {
            user = await client.getUser(userId);
        } catch (e) {
            error = e;
        }

        expect(error).to.be.equal(null);
        expect(user).to.be.equal(null);
    });

    it("03 enable non existing user", async () => {
        const userId: string = "testUser03";
        let error: Error | null = null;
        try {
            await client.enableUser(userId);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("04 disable non existing user", async () => {
        const userId: string = "testUser04";
        let error: Error | null = null;
        try {
            await client.enableUser(userId);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("05 get user data of non existing user", async () => {
        const userId: string = "testUser05";
        let error: Error | null = null;
        try {
            await client.getUserData(userId);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("06 create user with errors should fail", async () => {
        const userId: string = "testUser06";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e) {
            // nop
        }

        try {
            user = await client.createUser({ id: userId, password: "123456" });
        } catch (e) {
            error = e;
        }
        // password is under the most common ones
        expect(error).to.be.instanceOf(UserCreateError);

        try {
            user = await client.createUser({ id: userId });
        } catch (e) {
            error = e;
        }
        // email address is missing
        expect(error).to.be.instanceOf(UserCreateError);

        try {
            user = await client.createUser({ id: userId, email: "This in an invalid @email.address" });
        } catch (e) {
            error = e;
        }
        // wrong email address
        expect(error).to.be.instanceOf(UserCreateError);

        error = null;
        try {
            user = await client.createUser({ id: userId, password: "This is a test password" });
        } catch (e) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        user = null;
        try {
            user = await client.createUser({ id: userId, password: "This is a test password 1" });
        } catch (e) {
            error = e;
        }
        // user already exists
        expect(error).to.be.instanceOf(UserAlreadyExistsError);
        expect(user!).to.be.equal(null);

        try {
            await client.deleteUser(userId);
        } catch (e) {
            // nop
        }

    });

    it("07 create user successfully", async () => {
        const userId: string = "testUser07";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e) {
            // nop
        }

        // create user with email address
        try {
            user = await client.createUser({ id: userId, email: "h.t.borstenson@gmail.com" });
        } catch (e) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        try {
            await client.deleteUser(userId);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.equal(null);

        // create user with email address and password
        error = null;
        try {
            user = await client.createUser({ id: userId, email: "h.t.borstenson@gmail.com", password: "this is a secure password" });
        } catch (e) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e) {
            // nop
        }

    });

    it("08 enable disable user", async () => {
        const userId: string = "testUser08";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e) {
            // nop
        }

        // create user with password
        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        let isEnabled: boolean = false;
        isEnabled = await user!.isEnabled();
        expect(isEnabled).to.be.equal(true);

        // disable user
        try {
            await user?.disable();
        } catch (e) {
            error = e;
        }
        expect(error).to.be.equal(null);

        isEnabled = true;
        isEnabled = await user!.isEnabled();
        expect(isEnabled).to.be.equal(false);

        // enable user
        try {
            await user?.enable();
        } catch (e) {
            error = e;
        }
        expect(error).to.be.equal(null);

        isEnabled = false;
        isEnabled = await user!.isEnabled();
        expect(isEnabled).to.be.equal(true);

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e) {
            // nop
        }

    });

    it("09 get users", async () => {

        let error: Error | null = null;
        const userCount: number = 5;
        const userIdPrefix: string = "testUser09-";
        const users: { id: string, user: User | null }[] = [];

        for (let i = 0; i < userCount; i++) {
            users.push({ id: userIdPrefix + (i + 1), user: null })
        }

        // delete the users first
        for (let i = 0; i < userCount; i++) {
            error = null;
            // delete user
            try {
                await client.deleteUser(users[i].id);
            } catch (e) {
                // nop
            }
        }

        for (let i = 0; i < userCount; i++) {
            error = null;
            // create user with password
            try {
                users[i].user = await client.createUser({ id: users[i].id, password: "this is a secure password" });
            } catch (e) {
                error = e;
            }
            expect(error).to.be.equal(null);
            expect(users[i].user).not.to.be.equal(null);
        }

        error = null;
        let result: User[] = [];
        // get users
        try {
            result = await client.getUsers(userIdPrefix)
        } catch (e) {
            error = e;
        }
        expect(error).to.be.equal(null);
        expect(result.length).to.be.equal(userCount);

        error = null;
        result = [];
        // get users
        try {
            result = await client.getUsers(userIdPrefix, 2)
        } catch (e) {
            error = e;
        }
        expect(error).to.be.equal(null);
        expect(result.length).to.be.equal(2);

        error = null;
        result = [];
        // get users
        try {
            result = await client.getUsers(userIdPrefix, 2, userCount - 1)
        } catch (e) {
            error = e;
        }
        expect(error).to.be.equal(null);
        expect(result.length).to.be.equal(1);

        for (let i = 0; i < userCount; i++) {
            error = null;
            // delete user
            try {
                await client.deleteUser(users[i].id);
            } catch (e) {
                // nop
            }
        }

    });


    it("10 get user", async () => {

        const userId: string = "testUser10";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e) {
            // nop
        }

        // create user with password
        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        let value: string = "";
        try {
            value = await user!.getDisplayName();
        } catch (e) {
            error = e;
        }

        expect(error, "User getDisplayName expect no error").to.be.equal(null);

        let quota: IUserOptionsQuota;
        try {
            quota = await user!.getQuota();

        } catch (e) {
            error = e;
        }
        expect(error, "User getQuota expect no error").to.be.equal(null);
        // @todo

        let quotaUF: IUserQuotaUserFriendly;
        try {
            quotaUF = await user!.getQuotaUserFriendly();
            // console.log(JSON.stringify(userData, null, 4));
        } catch (e) {
            error = e;
        }
        expect(error, "get getQuotaUserFriendly expect no error").to.be.equal(null);
        // @todo expect(quotaUF!).not.to.be.equal(quotaUF!);

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e) {
            // nop
        }

    });

    it("11 get users with wrong response", async () => {
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
            users = await lclient.getUsers();
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }
        expect(users).to.be.a("array");
        if (users) {
            expect(users.length, "expect an empty user list").to.be.equal(0);
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

    it("24 get subadmins of user group", async () => {

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
