
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    File,
    Folder,
    ICreateShare,
} from "../client";
import FakeServer from "../fakeServer";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import Share from "../share";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("13-NEXCLOUD-NODE-CLIENT-SHARE", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 create public share", async () => {

        const fileName = "/ncncTest/share1/file3.txt";

        let file: File;

        file = await client.createFile(fileName, Buffer.from("this is a test text"));

        // const createShare: ICreateShare = { fileSystemElement: file, password: "password 1", publicUpload: true };
        let createShare: ICreateShare = { fileSystemElement: file, password: "password 1", publicUpload: false };

        let share: Share;

        try {
            share = await client.createShare(createShare);

            expect(share.id).to.be.a("string");
            expect(share.id.length).to.be.greaterThan(0);
            expect(share.url).to.be.a("string");
            expect(share.url.length).to.be.greaterThan(0);
            expect(share.token).to.be.a("string");
            expect(share.token.length).to.be.greaterThan(0);

            try {
                await share.setPassword("some password");
            } catch (e) {
                expect(e.message, "expect no exception setting password").to.be.equal(null);
            }

            expect(share.note).to.be.equal("");
            try {
                const note: string = "This is a Note\nNew Line";
                await share.setNote(note);
                expect(share.note).to.be.equal(note);
            } catch (e) {
                expect(e.message, "expect no exception setting note").to.be.equal(null);
            }

            try {
                await share.setExpiration(new Date(2020, 11, 5));
                expect(share.expiration).to.be.a("Date");
            } catch (e) {
                expect(e.message, "expect no exception setting expiration").to.be.equal(null);
            }

            try {
                await share.delete();
            } catch (e) {
                expect(e.message, "expect no exception deleting share").to.be.equal(null);
            }

        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }

        createShare = { fileSystemElement: file, publicUpload: true };
        try {
            share = await client.createShare(createShare);
        } catch (e) {
            expect(e.message, "expect no exception 'publicUpload:true'").to.be.equal(null);
        }

        await file.delete();
    });

    it("02 invalid share responses", async () => {

        const entries: RequestResponseLogEntry[] = [];
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

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode: string = "noError";
        try {
            await Share.getShare(lclient, "60");
        } catch (e) {
            errorCode = e.code;
        }
        expect(errorCode, "expect an exception").to.be.equal("ERR_INVALID_SHARE_RESPONSE");

        errorCode = "noError";
        try {
            await Share.getShare(lclient, "60");
        } catch (e) {
            errorCode = e.code;
        }
        expect(errorCode, "expect an exception").to.be.equal("ERR_INVALID_SHARE_RESPONSE");

        errorCode = "noError";
        try {
            await Share.getShare(lclient, "60");
        } catch (e) {
            errorCode = e.code;
        }
        expect(errorCode, "expect an exception").to.be.equal("ERR_INVALID_SHARE_RESPONSE");

        errorCode = "noError";
        try {
            await Share.getShare(lclient, "60");
        } catch (e) {
            errorCode = e.code;
        }
        expect(errorCode, "expect an exception").to.be.equal("ERR_INVALID_SHARE_RESPONSE");

        errorCode = "noError";
        try {
            await Share.getShare(lclient, "60");
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        errorCode = "noError";
        try {
            await Share.getShare(lclient, "60");
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        errorCode = "noError";
        try {
            await Share.getShare(lclient, "60");
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        errorCode = "noError";
        try {
            await Share.getShare(lclient, "60");
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

    });

    it("03 create public share for folder", async () => {

        const folderName = "/ncncTest/share/03/publicUploadFolder";

        const folder: Folder = await client.createFolder(folderName);

        const createShare: ICreateShare = { fileSystemElement: folder, publicUpload: true };

        let share: Share;

        let error: Error | null = null;
        try {
            share = await client.createShare(createShare);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.equal(null);
        expect(share!.publicUpload).to.be.equal(true);

        await folder.delete();
    });

});
