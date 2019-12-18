
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    FakeServer,
    NCClient,
} from "../ncClient";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import { getNextcloudClient } from "./testUtils";

let client: NCClient;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("10-NEXCLOUD-NODE-CLIENT-QUOTA", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 get quota", async () => {

        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = await client.getQuota();
        } catch (e) {
            expect(e, "expect no exception").to.be.equal(null);
        }
        expect(q, "quota to have property used").to.have.property("used");
        expect(q, "quota to have property available").to.have.property("available");

    });
    it("02 get quota with wrong xml response - no multistatus", async () => {

        const entries: RequestResponseLogEntry[] = [];
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

        const lclient: NCClient = new NCClient(new FakeServer(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }

    });

    it("03 get quota with wrong xml response - no quota-used-bytes", async () => {

        const entries: RequestResponseLogEntry[] = [];
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

        const lclient: NCClient = new NCClient(new FakeServer(entries));

        let q;
        try {
            q = await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }

    });

    it("04 get quota quota-available-bytes > 0", async () => {

        const entries: RequestResponseLogEntry[] = [];
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

        const lclient: NCClient = new NCClient(new FakeServer(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = await lclient.getQuota();
        } catch (e) {
            expect(true, "expect no exception").to.be.equal(e.message);
        }

    });

    it("05 get quota missing quota-available-bytes", async () => {

        const entries: RequestResponseLogEntry[] = [];
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

        const lclient: NCClient = new NCClient(new FakeServer(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);

        }

    });

});
