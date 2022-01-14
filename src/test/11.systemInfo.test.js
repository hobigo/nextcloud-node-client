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
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("11-NEXCLOUD-NODE-CLIENT-SYSTEM-INFO", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 1000);
    it("01 get system info", () => __awaiter(this, void 0, void 0, function* () {
        let sysInfo;
        try {
            sysInfo = yield client.getSystemInfo();
            (0, chai_1.expect)(sysInfo).to.have.property("nextcloud");
            (0, chai_1.expect)(sysInfo.nextcloud).to.have.property("system");
            (0, chai_1.expect)(sysInfo.nextcloud.system).to.be.a("object");
            (0, chai_1.expect)(sysInfo.nextcloud).to.have.property("storage");
            (0, chai_1.expect)(sysInfo.nextcloud.storage).to.be.a("object");
            (0, chai_1.expect)(sysInfo.nextcloud).to.have.property("shares");
            (0, chai_1.expect)(sysInfo.nextcloud.shares).to.be.a("object");
            (0, chai_1.expect)(sysInfo).to.have.property("server");
            (0, chai_1.expect)(sysInfo.server).to.be.a("object");
            (0, chai_1.expect)(sysInfo).to.have.property("activeUsers");
            (0, chai_1.expect)(sysInfo.activeUsers).to.be.a("object");
            (0, chai_1.expect)(sysInfo).to.have.property("nextcloudClient");
            (0, chai_1.expect)(sysInfo.nextcloudClient).to.have.property("version");
            (0, chai_1.expect)(sysInfo.nextcloudClient.version).to.be.a("string");
        }
        catch (e) {
            (0, chai_1.expect)(e, "expect no exception").to.be.equal(null);
        }
    }));
    it("02 get system info fails", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"NOTFOUNDocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemInfo();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("03 get system info fails - nextcloud-system missing", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"NOTFOUND-system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemInfo();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("04 get system info fails - nextcloud-storage missing", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"NOTFOUND-storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemInfo();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("05 get system info fails - nextcloud-shares missing", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"NOTFOUND-shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemInfo();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("06 get system info fails - nextcloud-data-server missing", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"NOTFOUND-server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemInfo();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("07 get system info fails - data-activeUsers missing", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"NOTFOUND-activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemInfo();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("08 get system info fails - data-nextcloud missing", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"NOTFOUND-nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemInfo();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("10 get system basic data", () => __awaiter(this, void 0, void 0, function* () {
        let sysInfo;
        try {
            sysInfo = yield client.getSystemBasicData();
            (0, chai_1.expect)(sysInfo).to.have.property("serverTimeString");
            (0, chai_1.expect)(sysInfo.serverTimeString).to.be.a("string");
            (0, chai_1.expect)(sysInfo).to.have.property("uptimeString");
            (0, chai_1.expect)(sysInfo.uptimeString).to.be.a("string");
            (0, chai_1.expect)(sysInfo).to.have.property("timeServersString");
            (0, chai_1.expect)(sysInfo.timeServersString).to.be.a("string");
        }
        catch (e) {
            (0, chai_1.expect)(e, "expect no exception").to.be.equal(null);
        }
    }));
    it("11 get system basic data fails - servertime", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/basicdata",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"NOTFOUND-servertime\":\"Tue Apr 14 12:45:28 CEST 2020\\n\",\"uptime\":\"up 9 weeks, 5 days, 23 hours, 41 minutes\\n\",\"timeservers\":\" \"}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemBasicData();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("12 get system basic data fails - uptime", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/basicdata",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"servertime\":\"Tue Apr 14 12:45:28 CEST 2020\\n\",\"NOTFOUND-uptime\":\"up 9 weeks, 5 days, 23 hours, 41 minutes\\n\",\"timeservers\":\" \"}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemBasicData();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
    it("13 get system basic data fails - timeservers", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/basicdata",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"servertime\":\"Tue Apr 14 12:45:28 CEST 2020\\n\",\"uptime\":\"up 9 weeks, 5 days, 23 hours, 41 minutes\\n\",\"NOTFOUND-timeservers\":\" \"}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "";
        try {
            yield lclient.getSystemBasicData();
        }
        catch (e) {
            errorCode = e.code || e.message;
        }
        (0, chai_1.expect)(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    }));
});
