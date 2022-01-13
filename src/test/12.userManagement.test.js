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
const chai_1 = require("chai");
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
require("mocha");
const client_1 = require("../client");
const fakeServer_1 = __importDefault(require("../fakeServer"));
const testUtils_1 = require("./testUtils");
const environment_1 = __importDefault(require("../environment"));
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("12-NEXCLOUD-NODE-CLIENT-USER-MANAGEMENT", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 1000);
    it("01 delete non existing user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser01";
        let error = null;
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserNotFoundError);
    }));
    it("02 get non existing user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser02";
        let error = null;
        let user = null;
        try {
            user = yield client.getUser(userId);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(user).to.be.equal(null);
    }));
    it("03 enable non existing user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser03";
        let error = null;
        try {
            yield client.enableUser(userId);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserNotFoundError);
    }));
    it("04 disable non existing user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser04";
        let error = null;
        try {
            yield client.disableUser(userId);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserNotFoundError);
    }));
    it("05 get user data of non existing user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser05";
        let error = null;
        try {
            yield client.getUserData(userId);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserNotFoundError);
    }));
    it("06 create user with errors should fail", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser06";
        let error = null;
        let user = null;
        // ensure that the user is not available
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
        try {
            user = yield client.createUser({ id: userId, password: "123456" });
        }
        catch (e) {
            error = e;
        }
        // password is under the most common ones
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserCreateError);
        try {
            user = yield client.createUser({ id: userId });
        }
        catch (e) {
            error = e;
        }
        // email address is missing
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserCreateError);
        try {
            user = yield client.createUser({ id: userId, email: "This in an invalid @email.address" });
        }
        catch (e) {
            error = e;
        }
        // wrong email address
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserCreateError);
        error = null;
        try {
            user = yield client.createUser({ id: userId, password: "This is a test password" });
        }
        catch (e) {
            error = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(null);
        let user2 = null;
        try {
            user2 = yield client.createUser({ id: userId, password: "This is a test password 1" });
        }
        catch (e) {
            error = e;
        }
        // user already exists
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserAlreadyExistsError);
        (0, chai_1.expect)(user2).to.be.equal(null);
        try {
            yield user.delete();
        }
        catch (e) {
            // nop
        }
    }));
    it("07 create user successfully", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser07";
        let error = null;
        let user = null;
        // ensure that the user is not available
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
        // create user with email address
        try {
            user = yield client.createUser({ id: userId, email: "h.t.borstenson@gmail.com" });
        }
        catch (e) {
            error = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(null);
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        // create user with email address and password
        error = null;
        try {
            user = yield client.createUser({ id: userId, email: "h.t.borstenson@gmail.com", password: "this is a secure password" });
        }
        catch (e) {
            error = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(null);
        // ensure that the user is not available
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
    }));
    it("08 enable disable user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser08";
        let error = null;
        let user = null;
        // ensure that the user is not available
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
        // create user with password
        try {
            user = yield client.createUser({ id: userId, password: "this is a secure password" });
        }
        catch (e) {
            error = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(null);
        let isEnabled = false;
        isEnabled = yield user.isEnabled();
        (0, chai_1.expect)(isEnabled).to.be.equal(true);
        // disable user
        try {
            yield (user === null || user === void 0 ? void 0 : user.disable());
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        isEnabled = true;
        isEnabled = yield user.isEnabled();
        (0, chai_1.expect)(isEnabled).to.be.equal(false);
        // enable user
        try {
            yield (user === null || user === void 0 ? void 0 : user.enable());
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        isEnabled = false;
        isEnabled = yield user.isEnabled();
        (0, chai_1.expect)(isEnabled).to.be.equal(true);
        // ensure that the user is not available
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
    }));
    it("09 get users", () => __awaiter(this, void 0, void 0, function* () {
        let error = null;
        const userCount = 5;
        const userIdPrefix = "testUser09-";
        const users = [];
        for (let i = 0; i < userCount; i++) {
            users.push({ id: userIdPrefix + (i + 1), user: null });
        }
        // delete the users first
        for (let i = 0; i < userCount; i++) {
            error = null;
            // delete user
            try {
                yield client.deleteUser(users[i].id);
            }
            catch (e) {
                // nop
            }
        }
        for (let i = 0; i < userCount; i++) {
            error = null;
            // create user with password
            try {
                users[i].user = yield client.createUser({ id: users[i].id, password: "this is a secure password" });
            }
            catch (e) {
                error = e;
            }
            (0, chai_1.expect)(error).to.be.equal(null);
            (0, chai_1.expect)(users[i].user).not.to.be.equal(null);
        }
        error = null;
        let result = [];
        // get users
        try {
            result = yield client.getUsers(userIdPrefix);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(result.length).to.be.equal(userCount);
        error = null;
        result = [];
        // get users
        try {
            result = yield client.getUsers(userIdPrefix, 2);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(result.length).to.be.equal(2);
        error = null;
        result = [];
        // get users
        try {
            result = yield client.getUsers(userIdPrefix, 2, userCount - 1);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(result.length).to.be.equal(1);
        // get users with wrong limit
        try {
            yield client.getUsers(userIdPrefix, -2);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.QueryLimitError);
        // get users with wrong offset
        error = null;
        try {
            yield client.getUsers(userIdPrefix, 1, -1);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.QueryOffsetError);
        for (let i = 0; i < userCount; i++) {
            error = null;
            // delete user
            try {
                yield client.deleteUser(users[i].id);
            }
            catch (e) {
                // nop
            }
        }
    }));
    it("10 get and update user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser10";
        let error = null;
        let user = null;
        // ensure that the user is not available
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
        // create user with password
        try {
            user = yield client.createUser({ id: userId, password: "this is a secure password" });
        }
        catch (e) {
            error = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(null);
        // ***********************
        // quota
        // ***********************
        let quota;
        try {
            quota = yield user.getQuota();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getQuota expect no error").to.be.equal(null);
        (0, chai_1.expect)(quota.quota).to.be.equal(0);
        (0, chai_1.expect)(quota.relative).to.be.equal(0);
        (0, chai_1.expect)(quota.used).to.be.equal(0);
        let setValue = "1GB";
        error = null;
        try {
            yield user.setQuota(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            quota = yield user.getQuota();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getQuota expect no error").to.be.equal(null);
        (0, chai_1.expect)(quota.quota).to.be.equal(1024 * 1024 * 1024);
        setValue = "100MB";
        error = null;
        try {
            yield user.setQuota(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            quota = yield user.getQuota();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getQuota expect no error").to.be.equal(null);
        (0, chai_1.expect)(quota.quota).to.be.equal(1024 * 1024 * 100);
        let quotaUF;
        try {
            quotaUF = yield user.getQuotaUserFriendly();
            // console.log(JSON.stringify(quotaUF, null, 4));
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "get getQuotaUserFriendly expect no error").to.be.equal(null);
        (0, chai_1.expect)(quotaUF.quota).to.be.equal("100 MB");
        // ***********************
        // last login
        // ***********************
        let lastlogin = null;
        try {
            lastlogin = yield user.getLastLogin();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getLastLogin expect no error").to.be.equal(null);
        (0, chai_1.expect)(lastlogin).to.be.equal(null);
        // ***********************
        // display name
        // ***********************
        setValue = "Horst-Thorsten Borstenson";
        let value = "";
        error = null;
        try {
            yield user.setDisplayName(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            value = yield user.getDisplayName();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getDisplayName expect no error").to.be.equal(null);
        (0, chai_1.expect)(value).to.be.equal(setValue);
        // ***********************
        // phone
        // ***********************
        setValue = "+49 1234 567";
        value = "";
        error = null;
        try {
            yield user.setPhone(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            value = yield user.getPhone();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getPhone expect no error").to.be.equal(null);
        (0, chai_1.expect)(value).to.be.equal(setValue);
        // ***********************
        // website
        // ***********************
        setValue = "http://borstenson.com";
        value = "";
        error = null;
        try {
            yield user.setWebsite(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            value = yield user.getWebsite();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getWebsite expect no error").to.be.equal(null);
        (0, chai_1.expect)(value).to.be.equal(setValue);
        // ***********************
        // twitter
        // ***********************
        setValue = "@real.h.t.borstenson";
        value = "";
        error = null;
        try {
            yield user.setTwitter(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            value = yield user.getTwitter();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getTwitter expect no error").to.be.equal(null);
        (0, chai_1.expect)(value).to.be.equal(setValue);
        // ***********************
        // address
        // ***********************
        setValue = "Fürst-Franz-Josef-Strasse 398\n9490 Vaduz\nLiechtenstein";
        value = "";
        error = null;
        try {
            yield user.setAddress(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            value = yield user.getAddress();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getAddress expect no error").to.be.equal(null);
        (0, chai_1.expect)(value).to.be.equal(setValue);
        // ***********************
        // language
        // ***********************
        setValue = "de";
        value = "";
        error = null;
        try {
            yield user.setLanguage(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            value = yield user.getLanguage();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getLanguage expect no error").to.be.equal(null);
        (0, chai_1.expect)(value).to.be.equal(setValue);
        // invalid language
        error = null;
        try {
            yield user.setLanguage("This Language is invalid");
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserUpdateError);
        // ***********************
        // locale
        // ***********************
        setValue = "de";
        value = "";
        error = null;
        try {
            yield user.setLocale(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            value = yield user.getLocale();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getLocale expect no error").to.be.equal(null);
        (0, chai_1.expect)(value).to.be.equal(setValue);
        // invalid locale
        error = null;
        try {
            yield user.setLocale("This locale is invalid");
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserUpdateError);
        // ***********************
        // password
        // ***********************
        setValue = "This is a secure password 1#99#!man1";
        value = "";
        error = null;
        try {
            yield user.setPassword(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        setValue = "xx";
        value = "";
        error = null;
        try {
            yield user.setPassword(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserUpdateError);
        // ***********************
        // resend welcome email should fail
        // ***********************
        error = null;
        try {
            yield user.resendWelcomeEmail();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserResendWelcomeEmailError);
        // ***********************
        // email
        // ***********************
        setValue = "h.t.borstenson@gmail.com";
        value = "";
        error = null;
        try {
            yield user.setEmail(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        try {
            value = yield user.getEmail();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "User getEmail expect no error").to.be.equal(null);
        (0, chai_1.expect)(value).to.be.equal(setValue);
        // invalid email address
        setValue = "invaid email address";
        value = "";
        try {
            yield user.setEmail(setValue);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserUpdateError);
        // ***********************
        // resend welcome email
        // ***********************
        error = null;
        try {
            yield user.resendWelcomeEmail();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        // clean up user
        try {
            yield user.delete();
        }
        catch (e) {
            // nop
        }
    }));
    it("11 get users with wrong response", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let users;
        try {
            users = yield lclient.getUsers();
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal(null);
        }
        (0, chai_1.expect)(users).to.be.a("array");
        if (users) {
            (0, chai_1.expect)(users.length, "expect an empty user list").to.be.equal(0);
        }
    }));
    it("12 update non existing user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser12";
        let error = null;
        try {
            yield client.updateUserProperty(userId, client_1.UserProperty.displayName, "Some Display Name");
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserNotFoundError);
    }));
    it("13 login with new user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser13";
        const password = "testUser13-password";
        let error = null;
        let user = null;
        // ensure that the user is not available
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
        // create user with password
        try {
            user = yield client.createUser({ id: userId, password });
        }
        catch (e) {
            error = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(null);
        let quota = yield user.getQuota();
        // console.log(quota);
        (0, chai_1.expect)(quota.quota).to.be.equal(0);
        (0, chai_1.expect)(quota.relative).to.be.equal(0);
        (0, chai_1.expect)(quota.used).to.be.equal(0);
        try {
            yield user.setQuota("100MB");
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        quota = yield user.getQuota();
        // console.log(quota);
        (0, chai_1.expect)(quota.quota).to.be.equal(1024 * 1024 * 100);
        (0, chai_1.expect)(quota.relative).to.be.equal(0);
        (0, chai_1.expect)(quota.used).to.be.equal(0);
        if ((0, testUtils_1.recordingModeActive)()) {
            const serverOptions = {
                url: environment_1.default.getNextcloudUrl(),
                basicAuth: {
                    username: environment_1.default.getUserName(),
                    password: environment_1.default.getPassword(),
                },
                logRequestResponse: environment_1.default.getRecordingActiveIndicator(),
            };
            const ncserver = new client_1.Server(serverOptions);
            ncserver.basicAuth.username = userId;
            ncserver.basicAuth.password = password;
            // login with the new user
            const newUserClient = new client_1.Client(ncserver);
            // this will issue the first login
            try {
                yield newUserClient.getQuota();
                // console.log(await newUserClient.getQuota());
            }
            catch (e) {
                error = e;
            }
            (0, chai_1.expect)(error).to.be.equal(null);
        }
        // the quota values change after the first login
        user = yield client.getUser(userId);
        quota = yield user.getQuota();
        // console.log(quota);
        (0, chai_1.expect)(quota.quota).to.be.equal(1024 * 1024 * 100);
        (0, chai_1.expect)(quota.relative).to.be.greaterThan(0);
        (0, chai_1.expect)(quota.used).to.be.greaterThan(0);
        (0, chai_1.expect)(quota.free).to.be.greaterThan(0);
        (0, chai_1.expect)(quota.total).to.be.greaterThan(0);
        // for code coverage
        yield user.getQuotaUserFriendly();
        const lastLogin = yield user.getLastLogin();
        // console.log(lastLogin);
        (0, chai_1.expect)(lastLogin).not.to.be.equal(null);
        // clean up user
        try {
            yield user.delete();
        }
        catch (e) {
            // nop
        }
    }));
    it("14 resend welcome email to non existing user", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser04";
        let error = null;
        try {
            yield client.resendWelcomeEmail(userId);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.instanceOf(client_1.UserResendWelcomeEmailError);
    }));
    it("20 get user groups", () => __awaiter(this, void 0, void 0, function* () {
        let exception;
        try {
            yield client.getUserGroups("", -10);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.QueryLimitError);
        try {
            yield client.getUserGroups("", 10, -1);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.QueryOffsetError);
        exception = null;
        let userGroups;
        try {
            userGroups = yield client.getUserGroups("no group should ever match this string", 0, 1);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(userGroups).not.to.be.equal(undefined);
        (0, chai_1.expect)(userGroups.length).to.be.equal(0);
        try {
            userGroups = yield client.getUserGroups();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(userGroups).not.to.be.equal(undefined);
    }));
    it("21 get create delete user group", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "test 11";
        let userGroup = null;
        let exception = null;
        try {
            userGroup = yield client.getUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        if (userGroup) {
            try {
                yield userGroup.delete();
            }
            catch (e) {
                exception = e;
            }
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
        // now the user group is deleted
        try {
            yield client.createUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        try {
            yield client.createUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserGroupAlreadyExistsError);
        exception = null;
        try {
            userGroup = yield client.getUserGroup(userGroupId + " this group should never exist");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(userGroup).to.be.equal(null);
        try {
            userGroup = yield client.getUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup).not.to.be.equal(null);
        try {
            yield userGroup.delete();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
    }));
    it("22 delete admin user group fails", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "admin";
        let userGroup = null;
        let exception = null;
        try {
            userGroup = yield client.getUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        if (userGroup) {
            try {
                yield userGroup.delete();
            }
            catch (e) {
                exception = e;
            }
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserGroupDeletionFailedError);
    }));
    it("23 get members of user group", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "admin";
        let userGroupMembers = [];
        let exception = null;
        try {
            userGroupMembers = yield client.getUserGroupMembers(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroupMembers.length).to.be.greaterThan(0);
        try {
            yield client.getUserGroupMembers(userGroupId + " this group should never exist");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserGroupDoesNotExistError);
        let userGroup = null;
        exception = null;
        try {
            userGroup = yield client.getUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup, "get user group admin is always there").not.to.be.equal(null);
        try {
            yield userGroup.getMemberUserIds();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
    }));
    it("24 get subadmins of user group", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "admin";
        let userGroupSubadamins = [];
        let exception = null;
        try {
            userGroupSubadamins = yield client.getUserGroupSubadmins(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroupSubadamins.length).to.be.greaterThan(-1);
        try {
            yield client.getUserGroupSubadmins(userGroupId + " this group should never exist");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserGroupDoesNotExistError);
        let userGroup = null;
        exception = null;
        try {
            userGroup = yield client.getUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup, "get user group admin is always there").not.to.be.equal(null);
        try {
            yield userGroup.getSubadminUserIds();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
    }));
    it("25 delete non existing user group should fail", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "UserGroup25";
        let userGroup = null;
        let userGroup1 = null;
        let exception = null;
        try {
            userGroup = yield client.getUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        if (userGroup) {
            try {
                yield userGroup.delete();
            }
            catch (e) {
                exception = e;
            }
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
        // now the user group is deleted
        try {
            yield client.createUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        try {
            userGroup = yield client.getUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup).not.to.be.equal(null);
        try {
            userGroup1 = yield client.getUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "get user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup1).not.to.be.equal(null);
        try {
            yield userGroup.delete();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        try {
            yield userGroup1.delete();
        }
        catch (e) {
            exception = e;
        }
        // even if the user group has been deleted previously, the delete should not fail
        (0, chai_1.expect)(exception).to.be.equal(null);
    }));
    it("30 add user to user group and get user Groups", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId1 = "UserGroup30a";
        const userGroupId2 = "UserGroup30b";
        const userId = "TestUser30";
        let userGroup1;
        let userGroup2;
        let user;
        let exception = null;
        // cleanup and setup
        try {
            yield client.deleteUserGroup(userGroupId1);
            yield client.deleteUserGroup(userGroupId2);
        }
        catch (e) {
            // ignore
        }
        try {
            userGroup1 = yield client.createUserGroup(userGroupId1);
            userGroup2 = yield client.createUserGroup(userGroupId2);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "create user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup1).not.to.be.equal(undefined);
        (0, chai_1.expect)(userGroup2).not.to.be.equal(undefined);
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // ignore
        }
        try {
            user = yield client.createUser({ id: userId, password: "this is a secure password" });
        }
        catch (e) {
            exception = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(undefined);
        // the test:
        try {
            yield user.addToMemberUserGroup(userGroup1);
            yield user.addToMemberUserGroup(userGroup2);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "adding a user to a user group should not raise an exception").to.be.equal(null);
        let userGroups = [];
        try {
            userGroups = yield user.getMemberUserGroups();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(userGroups.length).to.be.equal(2);
        // cleanup
        try {
            yield user.delete();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
        try {
            yield client.deleteUserGroup(userGroupId1);
            yield client.deleteUserGroup(userGroupId2);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user group should not raise an exception").to.be.equal(null);
    }));
    it("31 add non existing user to non existing user group", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "UserGroup31";
        const userId = "TestUser31";
        let userGroup;
        let user;
        let exception = null;
        // cleanup and setup
        try {
            yield client.deleteUserGroup(userGroupId);
        }
        catch (e) {
            // ignore
        }
        try {
            userGroup = yield client.createUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "create user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup).not.to.be.equal(undefined);
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // ignore
        }
        try {
            user = yield client.createUser({ id: userId, password: "this is a secure password" });
        }
        catch (e) {
            exception = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(undefined);
        // the test:
        try {
            yield client.addUserToMemberUserGroup(userId, "ThisGroupDoesNotExist");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserGroupDoesNotExistError);
        exception = null;
        try {
            yield client.addUserToMemberUserGroup("ThisUserNotExist", userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserNotFoundError);
        exception = null;
        // cleanup
        try {
            yield user.delete();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
        try {
            yield client.deleteUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user group should not raise an exception").to.be.equal(null);
    }));
    it("32 add user to user group with insufficient privileges", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":104,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.addUserToMemberUserGroup("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.InsufficientPrivilegesError);
    }));
    it("33 add user to user group with unkonwn error", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":999,\"message\":\"Some unknown error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.addUserToMemberUserGroup("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.OperationFailedError);
    }));
    it("34 remove user from user group", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "UserGroup34";
        const userId = "TestUser34";
        let userGroup;
        let user;
        let exception = null;
        // cleanup and setup
        try {
            yield client.deleteUserGroup(userGroupId);
        }
        catch (e) {
            // ignore
        }
        try {
            userGroup = yield client.createUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "create user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup).not.to.be.equal(undefined);
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // ignore
        }
        try {
            user = yield client.createUser({ id: userId, password: "this is a secure password" });
        }
        catch (e) {
            exception = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(undefined);
        // the test:
        try {
            yield user.addToMemberUserGroup(userGroup);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "adding a user to a user group should not raise an exception").to.be.equal(null);
        let userGroups = [];
        try {
            userGroups = yield user.getMemberUserGroups();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        try {
            yield user.removeFromMemberUserGroup(userGroup);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        userGroups = [];
        try {
            userGroups = yield user.getMemberUserGroups();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(userGroups.length).to.be.equal(0);
        // remove non existing user from user group
        try {
            yield client.removeUserFromMemberUserGroup("nonExistingUser", userGroup.id);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserNotFoundError);
        // remove non existing user group from user
        exception = null;
        try {
            yield client.removeUserFromMemberUserGroup(user.id, "nonExistingUserGroup");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserGroupDoesNotExistError);
        exception = null;
        try {
            yield user.removeFromMemberUserGroup(userGroup);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        // cleanup
        try {
            yield user.delete();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
        try {
            yield client.deleteUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user group should not raise an exception").to.be.equal(null);
    }));
    it("35 remove user from user group with insufficient privileges", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "DELETE",
                description: "Remove User someUserId from user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":104,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.removeUserFromMemberUserGroup("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.InsufficientPrivilegesError);
    }));
    it("36 remove user from user group with unkonwn error", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "DELETE",
                description: "Remove user someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":999,\"message\":\"Some unknown error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.removeUserFromMemberUserGroup("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.OperationFailedError);
    }));
    it("37 get user group ids fails", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups",
                method: "GET",
                description: "User Groups get",
            },
            response: {
                "body": "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"INVALIDgroups\":[]}}}",
                "contentType": "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let userGroups = [new client_1.UserGroup(client, "g1")];
        try {
            userGroups = yield lclient.getUserGroups();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(userGroups.length).to.be.equal(0);
    }));
    it("38 get user group members fails", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups/admin",
                method: "GET",
                description: "User group get members"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"INVALIDusers\":[\"holger\",\"horst\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let member = ["u1"];
        try {
            member = yield lclient.getUserGroupMembers("admin");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(member.length).to.be.equal(0);
    }));
    it("40 promote user to user group admin and get subadmin user groups", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId1 = "UserGroup40a";
        const userGroupId2 = "UserGroup40b";
        const userId = "TestUser40";
        let userGroup1;
        let userGroup2;
        let user;
        let exception = null;
        // cleanup and setup
        try {
            yield client.deleteUserGroup(userGroupId1);
            yield client.deleteUserGroup(userGroupId2);
        }
        catch (e) {
            // ignore
        }
        try {
            userGroup1 = yield client.createUserGroup(userGroupId1);
            userGroup2 = yield client.createUserGroup(userGroupId2);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "create user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup1).not.to.be.equal(undefined);
        (0, chai_1.expect)(userGroup2).not.to.be.equal(undefined);
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // ignore
        }
        try {
            user = yield client.createUser({ id: userId, password: "this is a secure password" });
        }
        catch (e) {
            exception = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(undefined);
        // the test:
        try {
            yield user.promoteToUserGroupSubadmin(userGroup1);
            yield user.promoteToUserGroupSubadmin(userGroup2);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "adding a user to a user group should not raise an exception").to.be.equal(null);
        let userGroups = [];
        try {
            userGroups = yield user.getSubadminUserGroups();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(userGroups.length).to.be.equal(2);
        try {
            yield client.getUserGroupSubadmins(userGroupId1);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        // cleanup
        try {
            yield user.delete();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
        try {
            yield client.deleteUserGroup(userGroupId1);
            yield client.deleteUserGroup(userGroupId2);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user group should not raise an exception").to.be.equal(null);
    }));
    it("41 promote non existing user to subadmin of non existing user group", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "UserGroup41";
        const userId = "TestUser41";
        let userGroup;
        let user;
        let exception = null;
        // cleanup and setup
        try {
            yield client.deleteUserGroup(userGroupId);
        }
        catch (e) {
            // ignore
        }
        try {
            userGroup = yield client.createUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "create user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup).not.to.be.equal(undefined);
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // ignore
        }
        try {
            user = yield client.createUser({ id: userId, password: "this is a secure password" });
        }
        catch (e) {
            exception = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(undefined);
        // the test:
        try {
            yield client.promoteUserToUserGroupSubadmin(userId, "ThisGroupDoesNotExist");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserGroupDoesNotExistError);
        exception = null;
        try {
            yield client.promoteUserToUserGroupSubadmin("ThisUserNotExist", userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.UserNotFoundError);
        exception = null;
        // cleanup
        try {
            yield user.delete();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
        try {
            yield client.deleteUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user group should not raise an exception").to.be.equal(null);
    }));
    it("42 promote user to subadmin of user group with unkown error", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/subadmins",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":103,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.promoteUserToUserGroupSubadmin("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.OperationFailedError);
    }));
    it("43 promote user to subadmin of user group with insufficient privileges", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/subadmins",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":104,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.promoteUserToUserGroupSubadmin("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.InsufficientPrivilegesError);
    }));
    it("44 demote user from subadmin user group", () => __awaiter(this, void 0, void 0, function* () {
        const userGroupId = "UserGroup44";
        const userId = "TestUser44";
        let userGroup;
        let user;
        let exception = null;
        // cleanup and setup
        try {
            yield client.deleteUserGroup(userGroupId);
        }
        catch (e) {
            // ignore
        }
        try {
            userGroup = yield client.createUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "create user group should not raise an exception").to.be.equal(null);
        (0, chai_1.expect)(userGroup).not.to.be.equal(undefined);
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // ignore
        }
        try {
            user = yield client.createUser({ id: userId, password: "this is a secure password" });
        }
        catch (e) {
            exception = e;
        }
        // user should be created successfully
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(user).not.to.be.equal(undefined);
        // the test:
        try {
            yield user.promoteToUserGroupSubadmin(userGroup);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "promoting a user to as a subadmin user group should not raise an exception").to.be.equal(null);
        let userGroups = [];
        try {
            userGroups = yield user.getSubadminUserGroups();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        try {
            yield user.demoteFromSubadminUserGroup(userGroup);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        userGroups = [];
        try {
            userGroups = yield user.getSubadminUserGroups();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(userGroups.length).to.be.equal(0);
        // demote from non existing user from user group
        try {
            yield client.demoteUserFromSubadminUserGroup("nonExistingUser", userGroup.id);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.OperationFailedError);
        // demote from non existing user group from user
        exception = null;
        try {
            yield client.demoteUserFromSubadminUserGroup(user.id, "nonExistingUserGroup");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.OperationFailedError);
        exception = null;
        try {
            yield user.demoteFromSubadminUserGroup(userGroup);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.OperationFailedError);
        exception = null;
        // cleanup
        try {
            yield user.delete();
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user should not raise an exception").to.be.equal(null);
        try {
            yield client.deleteUserGroup(userGroupId);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception, "delete user group should not raise an exception").to.be.equal(null);
    }));
    it("45 demotes user from subadmin user group with insufficient privileges", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "DELETE",
                description: "Demotes  user someUserId from user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":104,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.demoteUserFromSubadminUserGroup("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.InsufficientPrivilegesError);
    }));
    it("46 demote user from subadmin user group with unkonwn error", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "DELETE",
                description: "Remote user someUserId from subadmin user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":999,\"message\":\"Some unknown error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.demoteUserFromSubadminUserGroup("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.OperationFailedError);
    }));
    it("48 get user group subadmins fails", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups/admin/subadmins",
                method: "GET",
                description: "User group get subadmins"
            },
            response: {
                "body": "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"dataINVALID\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let member = ["u1"];
        try {
            member = yield lclient.getUserGroupSubadmins("admin");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(member.length).to.be.equal(0);
    }));
    it("50 invalid service response", () => __awaiter(this, void 0, void 0, function* () {
        let exception = null;
        const entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"INVALIDstatuscode\":999,\"message\":\"Some unknown error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        try {
            yield lclient.addUserToMemberUserGroup("someUserId", "someGroupId");
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.instanceOf(client_1.InvalidServiceResponseFormatError);
    }));
    it("60 User upsert", () => __awaiter(this, void 0, void 0, function* () {
        const userId = "testUser60";
        const userGroupId1 = "testUserGroup1";
        const userGroupId2 = "testUserGroup2";
        const userGroupId3 = "testUserGroup3";
        const userGroupId4 = "testUserGroup4";
        // cleanup
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
        try {
            yield client.deleteUserGroup(userGroupId1);
            yield client.deleteUserGroup(userGroupId2);
            yield client.deleteUserGroup(userGroupId3);
            yield client.deleteUserGroup(userGroupId4);
        }
        catch (e) {
            // nop
        }
        const userUpsertOptions = [
            {
                id: userId,
            },
            {
                id: userId,
                password: "ThisIsASecurePassword",
                displayName: "Horst-Thorsten Borstenson",
                email: "h.t.borstenson@gmail.com",
                enabled: false,
                resendWelcomeEmail: false,
                address: "at home",
                language: "en",
                locale: "de",
                phone: "+49 1234 567",
                twitter: "@borsti",
                website: "http://borstenson.com",
                quota: "3 GB",
                superAdmin: true,
                memberGroups: [userGroupId1, userGroupId2],
                subadminGroups: [userGroupId1, userGroupId2],
            },
            {
                id: userId,
                password: "ThisIsASecurePassword",
                displayName: "Horst-Thorsten Borstenson",
                email: "h.t.borstenson@gmail.com",
                enabled: true,
                resendWelcomeEmail: false,
                address: "at home",
                language: "en",
                locale: "de",
                phone: "+49 1234 567",
                twitter: "@borsti",
                website: "http://borstenson.com",
                quota: "3 GB",
                superAdmin: false,
                memberGroups: [userGroupId1, userGroupId2, "admin"],
                subadminGroups: [userGroupId1, userGroupId2],
            },
            {
                id: userId,
                password: "ThisIsASecurePassword",
                displayName: "Horst-Thorsten Borstenson",
                email: "h.t.borstenson@gmail.com",
                enabled: false,
                resendWelcomeEmail: true,
                address: "at home",
                language: "en",
                locale: "de",
                phone: "+49 1234 5678",
                twitter: "@borsti",
                website: "http://borstenson.com",
                quota: "3 GB",
                superAdmin: true,
                memberGroups: [userGroupId2, userGroupId3, "admin"],
                subadminGroups: [userGroupId2, userGroupId3],
            },
            {
                id: userId,
            },
            {
                id: userId,
                password: "",
                displayName: "",
                email: "",
                enabled: false,
                resendWelcomeEmail: false,
                address: "",
                language: "",
                locale: "",
                phone: "",
                twitter: "",
                website: "",
                quota: "",
                superAdmin: false,
                memberGroups: [],
                subadminGroups: [],
            },
            {
                id: userId,
                password: "",
                displayName: "",
                email: "",
                enabled: false,
                resendWelcomeEmail: false,
                address: "",
                language: "",
                locale: "",
                phone: "",
                twitter: "",
                website: "",
                quota: "",
                memberGroups: [userGroupId2],
                subadminGroups: [userGroupId2, userGroupId4],
            }
        ];
        const report = yield client.upsertUsers(userUpsertOptions);
        // @todo check some values
        // console.log(JSON.stringify(report, null, 4));
        // cleanup
        try {
            yield client.deleteUser(userId);
        }
        catch (e) {
            // nop
        }
        try {
            yield client.deleteUserGroup(userGroupId1);
            yield client.deleteUserGroup(userGroupId2);
            yield client.deleteUserGroup(userGroupId3);
            yield client.deleteUserGroup(userGroupId4);
        }
        catch (e) {
            // nop
        }
    }));
    it("61 User upsert fails", () => __awaiter(this, void 0, void 0, function* () {
        // only for code coverage
        const userId = "TestUser61";
        // disable fails ------------------------------
        let entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/disable",
                method: "PUT",
                description: "User ... disable"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        let lclient = new client_1.Client(new fakeServer_1.default(entries));
        let userUpsertOptions = [
            {
                id: userId,
                enabled: false,
            },
        ];
        let report = yield lclient.upsertUsers(userUpsertOptions);
        // enable fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/enable",
                method: "PUT",
                description: "User ... disable"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                enabled: true,
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // demote from superadmin ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"admin\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/groups",
                method: "DELETE",
                description: "Demote user from superadmin"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                superAdmin: false,
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // promote to superadmin ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"NOadmin\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/groups",
                method: "POST",
                description: "Promote user to superadmin"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                superAdmin: true,
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // remove group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"NOadmin\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups",
                method: "POST",
                description: "UserGroup create",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                memberGroups: ["newGroup"],
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // create user group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups",
                method: "POST",
                description: "UserGroup create",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"some error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                memberGroups: ["newGroup"],
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // add group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"g1\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[\"newGroup\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/groups",
                method: "POST",
                description: "add user tp group",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                memberGroups: ["newGroup"],
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // demote from subadmin group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[\"subadminGroup\"],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"NOadmin\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                subadminGroups: [],
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // create subadmin user group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups",
                method: "POST",
                description: "UserGroup create",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"some error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                subadminGroups: ["newGroup"],
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // add subadmin group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"g1\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[\"newGroup\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/groups",
                method: "POST",
                description: "add user tp group",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                subadminGroups: ["newGroup"],
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
        // display name fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"g1\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        lclient = new client_1.Client(new fakeServer_1.default(entries));
        userUpsertOptions = [
            {
                id: userId,
                displayName: "someValue",
                email: "someValue",
                twitter: "someValue",
                phone: "someValue",
                address: "someValue",
                website: "someValue",
                resendWelcomeEmail: true,
            },
        ];
        report = yield lclient.upsertUsers(userUpsertOptions);
    }));
});
