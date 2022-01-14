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
describe("10-NEXCLOUD-NODE-CLIENT-QUOTA", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 1000);
    it("01 get quota", () => __awaiter(this, void 0, void 0, function* () {
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = yield client.getQuota();
        }
        catch (e) {
            (0, chai_1.expect)(e, "expect no exception").to.be.equal(null);
        }
        (0, chai_1.expect)(q, "quota to have property used").to.have.property("used");
        (0, chai_1.expect)(q, "quota to have property available").to.have.property("available");
    }));
    it("02 get quota with wrong xml response - no multistatus", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "Client get quota",
                method: "PROPFIND",
                url: "/remote.php/webdav/",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:NOmultistatus xmlns:d=\"DAV:\" xmlns:s=\"http://sabredav.org/ns\" xmlns:oc=\"http://owncloud.org/ns\" xmlns:nc=\"http://nextcloud.org/ns\"><d:response><d:href>/remote.php/webdav/</d:href><d:propstat><d:prop><d:getlastmodified>Tue, 17 Dec 2019 23:21:39 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4710416497</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5df9630302376&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/Donnerwetter.md</d:href><d:propstat><d:prop><d:getlastmodified>Mon, 25 Nov 2019 07:56:30 GMT</d:getlastmodified><d:getcontentlength>99</d:getcontentlength><d:resourcetype/><d:getetag>&quot;200fe307b08fcbedb5606bba4ba5354d&quot;</d:getetag><d:getcontenttype>text/markdown</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:quota-used-bytes/><d:quota-available-bytes/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/SofortUpload/</d:href><d:propstat><d:prop><d:getlastmodified>Sun, 15 Dec 2019 13:39:03 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>476863281</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5df637777669d&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/bestellung%20buch%20caro.pdf</d:href><d:propstat><d:prop><d:getlastmodified>Wed, 11 Dec 2019 07:55:54 GMT</d:getlastmodified><d:getcontentlength>63320</d:getcontentlength><d:resourcetype/><d:getetag>&quot;cbb8508498c886ff53e4e0f378f9bc49&quot;</d:getetag><d:getcontenttype>application/pdf</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:quota-used-bytes/><d:quota-available-bytes/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/katze/</d:href><d:propstat><d:prop><d:getlastmodified>Tue, 03 Dec 2019 17:19:49 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4233489797</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5de69935b3309&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response></d:NOmultistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
    }));
    it("03 get quota with wrong xml response - no quota-used-bytes", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "Client get quota",
                method: "PROPFIND",
                url: "/remote.php/webdav/",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\" xmlns:s=\"http://sabredav.org/ns\" xmlns:oc=\"http://owncloud.org/ns\" xmlns:nc=\"http://nextcloud.org/ns\"><d:response><d:href>/remote.php/webdav/</d:href><d:propstat><d:prop><d:getlastmodified>Wed, 18 Dec 2019 07:11:01 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4710416532</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5df9d1058812d&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/Donnerwetter.md</d:href><d:propstat><d:prop><d:getlastmodified>Mon, 25 Nov 2019 07:56:30 GMT</d:getlastmodified><d:getcontentlength>99</d:getcontentlength><d:resourcetype/><d:getetag>&quot;200fe307b08fcbedb5606bba4ba5354d&quot;</d:getetag><d:getcontenttype>text/markdown</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:quota-used-bytes/><d:quota-available-bytes/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/SofortUpload/</d:href><d:propstat><d:prop><d:getlastmodified>Sun, 15 Dec 2019 13:39:03 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>476863281</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5df637777669d&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/bestellung%20buch%20caro.pdf</d:href><d:propstat><d:prop><d:getlastmodified>Wed, 11 Dec 2019 07:55:54 GMT</d:getlastmodified><d:getcontentlength>63320</d:getcontentlength><d:resourcetype/><d:getetag>&quot;cbb8508498c886ff53e4e0f378f9bc49&quot;</d:getetag><d:getcontenttype>application/pdf</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:quota-used-bytes/><d:quota-available-bytes/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/katze/</d:href><d:propstat><d:prop><d:getlastmodified>Tue, 03 Dec 2019 17:19:49 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4233489797</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5de69935b3309&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/test/</d:href><d:propstat><d:prop><d:getlastmodified>Wed, 18 Dec 2019 07:11:01 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>35</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5df9d1058812d&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        let q;
        try {
            q = yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
    }));
    it("04 get quota quota-available-bytes > 0", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "Client get quota",
                method: "PROPFIND",
                url: "/remote.php/webdav/",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\" xmlns:s=\"http://sabredav.org/ns\" xmlns:oc=\"http://owncloud.org/ns\" xmlns:nc=\"http://nextcloud.org/ns\"><d:response><d:href>/remote.php/webdav/</d:href><d:propstat><d:prop><d:getlastmodified>Tue, 17 Dec 2019 23:21:39 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4710416497</d:quota-used-bytes><d:quota-available-bytes>42</d:quota-available-bytes><d:getetag>&quot;5df9630302376&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/Donnerwetter.md</d:href><d:propstat><d:prop><d:getlastmodified>Mon, 25 Nov 2019 07:56:30 GMT</d:getlastmodified><d:getcontentlength>99</d:getcontentlength><d:resourcetype/><d:getetag>&quot;200fe307b08fcbedb5606bba4ba5354d&quot;</d:getetag><d:getcontenttype>text/markdown</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:quota-used-bytes/><d:quota-available-bytes/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/SofortUpload/</d:href><d:propstat><d:prop><d:getlastmodified>Sun, 15 Dec 2019 13:39:03 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>476863281</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5df637777669d&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/bestellung%20buch%20caro.pdf</d:href><d:propstat><d:prop><d:getlastmodified>Wed, 11 Dec 2019 07:55:54 GMT</d:getlastmodified><d:getcontentlength>63320</d:getcontentlength><d:resourcetype/><d:getetag>&quot;cbb8508498c886ff53e4e0f378f9bc49&quot;</d:getetag><d:getcontenttype>application/pdf</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:quota-used-bytes/><d:quota-available-bytes/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/katze/</d:href><d:propstat><d:prop><d:getlastmodified>Tue, 03 Dec 2019 17:19:49 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4233489797</d:quota-used-bytes><d:quota-available-bytes>-3</d:quota-available-bytes><d:getetag>&quot;5de69935b3309&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = yield lclient.getQuota();
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(e.message);
        }
    }));
    it("05 get quota missing quota-available-bytes", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "Client get quota",
                method: "PROPFIND",
                url: "/remote.php/webdav/",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\" xmlns:s=\"http://sabredav.org/ns\" xmlns:oc=\"http://owncloud.org/ns\" xmlns:nc=\"http://nextcloud.org/ns\"><d:response><d:href>/remote.php/webdav/</d:href><d:propstat><d:prop><d:getlastmodified>Tue, 17 Dec 2019 23:21:39 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4710416497</d:quota-used-bytes><d:MISSINGquota-available-bytes>42</d:MISSINGquota-available-bytes><d:getetag>&quot;5df9630302376&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/Donnerwetter.md</d:href><d:propstat><d:prop><d:getlastmodified>Mon, 25 Nov 2019 07:56:30 GMT</d:getlastmodified><d:getcontentlength>99</d:getcontentlength><d:resourcetype/><d:getetag>&quot;200fe307b08fcbedb5606bba4ba5354d&quot;</d:getetag><d:getcontenttype>text/markdown</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:quota-used-bytes/><d:MISSINGquota-available-bytes/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/SofortUpload/</d:href><d:propstat><d:prop><d:getlastmodified>Sun, 15 Dec 2019 13:39:03 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>476863281</d:quota-used-bytes><d:MISSINGquota-available-bytes>-3</d:MISSINGquota-available-bytes><d:getetag>&quot;5df637777669d&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/bestellung%20buch%20caro.pdf</d:href><d:propstat><d:prop><d:getlastmodified>Wed, 11 Dec 2019 07:55:54 GMT</d:getlastmodified><d:getcontentlength>63320</d:getcontentlength><d:resourcetype/><d:getetag>&quot;cbb8508498c886ff53e4e0f378f9bc49&quot;</d:getetag><d:getcontenttype>application/pdf</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:quota-used-bytes/><d:MISSINGquota-available-bytes/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/katze/</d:href><d:propstat><d:prop><d:getlastmodified>Tue, 03 Dec 2019 17:19:49 GMT</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4233489797</d:quota-used-bytes><d:MISSINGquota-available-bytes>-3</d:MISSINGquota-available-bytes><d:getetag>&quot;5de69935b3309&quot;</d:getetag></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat><d:propstat><d:prop><d:getcontentlength/><d:getcontenttype/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });
        const lclient = new client_1.Client(new fakeServer_1.default(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
    }));
});
