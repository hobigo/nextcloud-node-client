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
const share_1 = __importDefault(require("../share"));
const testUtils_1 = require("./testUtils");
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("13-NEXCLOUD-NODE-CLIENT-SHARE", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 1000);
    it("01 create public share", () => __awaiter(this, void 0, void 0, function* () {
        const fileName = "/ncncTest/share1/file3.txt";
        let file;
        file = yield client.createFile(fileName, Buffer.from("this is a test text"));
        // const createShare: ICreateShare = { fileSystemElement: file, password: "password 1", publicUpload: true };
        let createShare = { fileSystemElement: file, password: "password 1", publicUpload: false };
        let share;
        try {
            share = yield client.createShare(createShare);
            (0, chai_1.expect)(share.id).to.be.a("string");
            (0, chai_1.expect)(share.id.length).to.be.greaterThan(0);
            (0, chai_1.expect)(share.url).to.be.a("string");
            (0, chai_1.expect)(share.url.length).to.be.greaterThan(0);
            (0, chai_1.expect)(share.token).to.be.a("string");
            (0, chai_1.expect)(share.token.length).to.be.greaterThan(0);
            try {
                yield share.setPassword("some password");
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception setting password").to.be.equal(null);
            }
            (0, chai_1.expect)(share.note).to.be.equal("");
            try {
                const note = "This is a Note\nNew Line";
                yield share.setNote(note);
                (0, chai_1.expect)(share.note).to.be.equal(note);
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception setting note").to.be.equal(null);
            }
            try {
                yield share.setExpiration(new Date(2020, 11, 5));
                (0, chai_1.expect)(share.expiration).to.be.a("Date");
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception setting expiration").to.be.equal(null);
            }
            try {
                yield share.delete();
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception deleting share").to.be.equal(null);
            }
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal(null);
        }
        createShare = { fileSystemElement: file, publicUpload: true };
        try {
            share = yield client.createShare(createShare);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception 'publicUpload:true'").to.be.equal(null);
        }
        yield file.delete();
    }));
    it("02 invalid share responses", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "Share get",
                method: "GET",
                url: "/ocs/v2.php/apps/files_sharing/api/v1/shares/60",
            },
            response: {
                body: "{\"ocsXXX\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":[{\"id\":\"60\",\"share_type\":3,\"uid_owner\":\"htborstenson\",\"displayname_owner\":\"Horst-Thorsten Borstenson\",\"permissions\":1,\"can_edit\":true,\"can_delete\":true,\"stime\":1580171571,\"parent\":null,\"expiration\":null,\"token\":\"HMHbFqsKfxGjjKi\",\"uid_file_owner\":\"htborstenson\",\"note\":\"\",\"label\":\"\",\"displayname_file_owner\":\"Horst-Thorsten Borstenson\",\"path\":\"\\/ncncTest\\/share1\\/file3.txt\",\"item_type\":\"file\",\"mimetype\":\"text\\/plain\",\"storage_id\":\"home::htborstenson\",\"storage\":3,\"item_source\":107213,\"file_source\":107213,\"file_parent\":107191,\"file_target\":\"\\/file3.txt\",\"share_with\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"share_with_displayname\":\"(Shared link)\",\"password\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"send_password_by_talk\":false,\"url\":\"https:\\/\\/mo.hobigo.de\\/s\\/HMHbFqsKfxGjjKi\",\"mail_send\":0,\"hide_download\":0}]}}",
                contentType: "application/xml; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                description: "Share get",
                method: "GET",
                url: "/ocs/v2.php/apps/files_sharing/api/v1/shares/60",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":[{\"id\":\"60\",\"share_type\":3,\"uid_owner\":\"htborstenson\",\"displayname_owner\":\"Horst-Thorsten Borstenson\",\"permissions\":1,\"can_edit\":true,\"can_delete\":true,\"stime\":1580171571,\"parent\":null,\"expiration\":null,\"token\":\"HMHbFqsKfxGjjKi\",\"uid_file_owner\":\"htborstenson\",\"note\":\"\",\"label\":\"\",\"displayname_file_owner\":\"Horst-Thorsten Borstenson\",\"path\":\"\\/ncncTest\\/share1\\/file3.txt\",\"item_type\":\"file\",\"mimetype\":\"text\\/plain\",\"storage_id\":\"home::htborstenson\",\"storage\":3,\"item_source\":107213,\"file_source\":107213,\"file_parent\":107191,\"file_target\":\"\\/file3.txt\",\"share_with\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"share_with_displayname\":\"(Shared link)\",\"password\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"send_password_by_talk\":false,\"urlXXX\":\"https:\\/\\/mo.hobigo.de\\/s\\/HMHbFqsKfxGjjKi\",\"mail_send\":0,\"hide_download\":0}]}}",
                contentType: "application/xml; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                description: "Share get",
                method: "GET",
                url: "/ocs/v2.php/apps/files_sharing/api/v1/shares/60",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":[{\"id\":\"60\",\"share_type\":3,\"uid_owner\":\"htborstenson\",\"displayname_owner\":\"Horst-Thorsten Borstenson\",\"permissions\":1,\"can_edit\":true,\"can_delete\":true,\"stime\":1580171571,\"parent\":null,\"expiration\":null,\"XXXtoken\":\"HMHbFqsKfxGjjKi\",\"uid_file_owner\":\"htborstenson\",\"note\":\"\",\"label\":\"\",\"displayname_file_owner\":\"Horst-Thorsten Borstenson\",\"path\":\"\\/ncncTest\\/share1\\/file3.txt\",\"item_type\":\"file\",\"mimetype\":\"text\\/plain\",\"storage_id\":\"home::htborstenson\",\"storage\":3,\"item_source\":107213,\"file_source\":107213,\"file_parent\":107191,\"file_target\":\"\\/file3.txt\",\"share_with\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"share_with_displayname\":\"(Shared link)\",\"password\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"send_password_by_talk\":false,\"url\":\"https:\\/\\/mo.hobigo.de\\/s\\/HMHbFqsKfxGjjKi\",\"mail_send\":0,\"hide_download\":0}]}}",
                contentType: "application/xml; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                description: "Share get",
                method: "GET",
                url: "/ocs/v2.php/apps/files_sharing/api/v1/shares/60",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":[{\"id\":\"60\",\"share_type\":3,\"uid_owner\":\"htborstenson\",\"displayname_owner\":\"Horst-Thorsten Borstenson\",\"permissions\":1,\"can_edit\":true,\"can_delete\":true,\"stime\":1580171571,\"parent\":null,\"expiration\":null,\"token\":\"HMHbFqsKfxGjjKi\",\"uid_file_owner\":\"htborstenson\",\"note\":\"\",\"label\":\"\",\"displayname_file_owner\":\"Horst-Thorsten Borstenson\",\"path\":\"\\/ncncTest\\/share1\\/file3.txt\",\"XXXitem_type\":\"file\",\"mimetype\":\"text\\/plain\",\"storage_id\":\"home::htborstenson\",\"storage\":3,\"item_source\":107213,\"file_source\":107213,\"file_parent\":107191,\"file_target\":\"\\/file3.txt\",\"share_with\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"share_with_displayname\":\"(Shared link)\",\"password\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"send_password_by_talk\":false,\"url\":\"https:\\/\\/mo.hobigo.de\\/s\\/HMHbFqsKfxGjjKi\",\"mail_send\":0,\"hide_download\":0}]}}",
                contentType: "application/xml; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                description: "Share get",
                method: "GET",
                url: "/ocs/v2.php/apps/files_sharing/api/v1/shares/60",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":[{\"id\":\"60\",\"share_type\":3,\"uid_owner\":\"htborstenson\",\"displayname_owner\":\"Horst-Thorsten Borstenson\",\"permissions\":1,\"can_edit\":true,\"can_delete\":true,\"stime\":1580171571,\"parent\":null,\"expiration\":null,\"token\":\"HMHbFqsKfxGjjKi\",\"uid_file_owner\":\"htborstenson\",\"note\":\"\",\"label\":\"\",\"displayname_file_owner\":\"Horst-Thorsten Borstenson\",\"path\":\"\\/ncncTest\\/share1\\/file3.txt\",\"item_type\":\"folder\",\"mimetype\":\"text\\/plain\",\"storage_id\":\"home::htborstenson\",\"storage\":3,\"item_source\":107213,\"file_source\":107213,\"file_parent\":107191,\"file_target\":\"\\/file3.txt\",\"share_with\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"share_with_displayname\":\"(Shared link)\",\"password\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"send_password_by_talk\":false,\"url\":\"https:\\/\\/mo.hobigo.de\\/s\\/HMHbFqsKfxGjjKi\",\"mail_send\":0,\"hide_download\":0}]}}",
                contentType: "application/xml; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                description: "Share get",
                method: "GET",
                url: "/ocs/v2.php/apps/files_sharing/api/v1/shares/60",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":[{\"id\":\"60\",\"share_type\":3,\"uid_owner\":\"htborstenson\",\"displayname_owner\":\"Horst-Thorsten Borstenson\",\"permissions\":1,\"can_edit\":true,\"can_delete\":true,\"stime\":1580171571,\"parent\":null,\"expiration\":null,\"token\":\"HMHbFqsKfxGjjKi\",\"uid_file_owner\":\"htborstenson\",\"note\":\"\",\"label\":\"\",\"displayname_file_owner\":\"Horst-Thorsten Borstenson\",\"path\":\"\\/ncncTest\\/share1\\/file3.txt\",\"item_type\":\"file\",\"mimetype\":\"text\\/plain\",\"storage_id\":\"home::htborstenson\",\"storage\":3,\"item_source\":107213,\"file_source\":107213,\"file_parent\":107191,\"file_target\":\"\\/file3.txt\",\"share_with\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"share_with_displayname\":\"(Shared link)\",\"password\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"send_password_by_talk\":false,\"url\":\"https:\\/\\/mo.hobigo.de\\/s\\/HMHbFqsKfxGjjKi\",\"mail_send\":0,\"hide_download\":0}]}}",
                contentType: "application/xml; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                description: "Share get",
                method: "GET",
                url: "/ocs/v2.php/apps/files_sharing/api/v1/shares/60",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":[{\"id\":\"60\",\"share_type\":3,\"uid_owner\":\"htborstenson\",\"displayname_owner\":\"Horst-Thorsten Borstenson\",\"permissions\":1,\"can_edit\":true,\"can_delete\":true,\"stime\":1580171571,\"parent\":null,\"expiration\":\"2020-12-04\",\"token\":\"HMHbFqsKfxGjjKi\",\"uid_file_owner\":\"htborstenson\",\"note\":\"\",\"label\":\"\",\"displayname_file_owner\":\"Horst-Thorsten Borstenson\",\"path\":\"\\/ncncTest\\/share1\\/file3.txt\",\"item_type\":\"file\",\"mimetype\":\"text\\/plain\",\"storage_id\":\"home::htborstenson\",\"storage\":3,\"item_source\":107213,\"file_source\":107213,\"file_parent\":107191,\"file_target\":\"\\/file3.txt\",\"share_with\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"share_with_displayname\":\"(Shared link)\",\"password\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"send_password_by_talk\":false,\"url\":\"https:\\/\\/mo.hobigo.de\\/s\\/HMHbFqsKfxGjjKi\",\"mail_send\":0,\"hide_download\":0}]}}",
                contentType: "application/xml; charset=utf-8",
                status: 200,
            },
        });
        entries.push({
            request: {
                description: "Share get",
                method: "GET",
                url: "/ocs/v2.php/apps/files_sharing/api/v1/shares/60",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":[{\"id\":\"60\",\"share_type\":3,\"uid_owner\":\"htborstenson\",\"displayname_owner\":\"Horst-Thorsten Borstenson\",\"permissions\":1,\"can_edit\":true,\"can_delete\":true,\"stime\":1580171571,\"parent\":null,\"expiration\":\"2020-12-04\",\"token\":\"HMHbFqsKfxGjjKi\",\"uid_file_owner\":\"htborstenson\",\"note\":\"note test\",\"label\":\"\",\"displayname_file_owner\":\"Horst-Thorsten Borstenson\",\"path\":\"\\/ncncTest\\/share1\\/file3.txt\",\"item_type\":\"file\",\"mimetype\":\"text\\/plain\",\"storage_id\":\"home::htborstenson\",\"storage\":3,\"item_source\":107213,\"file_source\":107213,\"file_parent\":107191,\"file_target\":\"\\/file3.txt\",\"share_with\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"share_with_displayname\":\"(Shared link)\",\"password\":\"2|$argon2i$v=19$m=65536,t=4,p=1$SHd0ckwyeG1ieUcubThIRQ$+rO5YJNYmQAdrptAJFQAjq00QnfpTmkikZet\\/PKv3ZY\",\"send_password_by_talk\":false,\"url\":\"https:\\/\\/mo.hobigo.de\\/s\\/HMHbFqsKfxGjjKi\",\"mail_send\":0,\"hide_download\":0}]}}",
                contentType: "application/xml; charset=utf-8",
                status: 200,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let errorCode = "noError";
        try {
            yield share_1.default.getShare(lclient, "60");
        }
        catch (e) {
            errorCode = e.code;
        }
        (0, chai_1.expect)(errorCode, "expect an exception").to.be.equal("ERR_INVALID_SHARE_RESPONSE");
        errorCode = "noError";
        try {
            yield share_1.default.getShare(lclient, "60");
        }
        catch (e) {
            errorCode = e.code;
        }
        (0, chai_1.expect)(errorCode, "expect an exception").to.be.equal("ERR_INVALID_SHARE_RESPONSE");
        errorCode = "noError";
        try {
            yield share_1.default.getShare(lclient, "60");
        }
        catch (e) {
            errorCode = e.code;
        }
        (0, chai_1.expect)(errorCode, "expect an exception").to.be.equal("ERR_INVALID_SHARE_RESPONSE");
        errorCode = "noError";
        try {
            yield share_1.default.getShare(lclient, "60");
        }
        catch (e) {
            errorCode = e.code;
        }
        (0, chai_1.expect)(errorCode, "expect an exception").to.be.equal("ERR_INVALID_SHARE_RESPONSE");
        errorCode = "noError";
        try {
            yield share_1.default.getShare(lclient, "60");
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        errorCode = "noError";
        try {
            yield share_1.default.getShare(lclient, "60");
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        errorCode = "noError";
        try {
            yield share_1.default.getShare(lclient, "60");
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        errorCode = "noError";
        try {
            yield share_1.default.getShare(lclient, "60");
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
    }));
    it("03 create public share for folder", () => __awaiter(this, void 0, void 0, function* () {
        const folderName = "/ncncTest/share/03/publicUploadFolder";
        const folder = yield client.createFolder(folderName);
        const createShare = { fileSystemElement: folder, publicUpload: true };
        let share;
        let error = null;
        try {
            share = yield client.createShare(createShare);
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(share.publicUpload).to.be.equal(true);
        yield folder.delete();
    }));
});
