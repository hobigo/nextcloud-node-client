
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Headers,
    RequestInit,
    Response,
    ResponseInit,
} from "node-fetch";
import { HttpClient, IHttpClientOptions, IProxy, IRequestContext } from "../httpClient";
import RequestResponseLog from "../requestResponseLog";

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("20-NEXCLOUD-NODE-CLIENT-HTTP-CLIENT", function () {

    this.timeout(1 * 60 * 1000);

    it("01 timeout unkonwn server", async () => {

        const proxy: IProxy = {
            host: "host",
            port: "1234",
            protocol: "https",
            proxyAuthorizationHeader: "some header",
            secureProxy: true,
        };

        const options: IHttpClientOptions = {
            authorizationHeader: "basic 12343",
            logRequestResponse: true,
            origin: "origin",
            proxy,
        };

        const httpClient: HttpClient = new HttpClient(options);

        const requestInit: RequestInit = {
            method: "GET",
            timeout: 1,
        };
        const url: string = "https://this.server.does.not.exist:1234/root";

        let response: Response;
        let exceptionOccurred: boolean = false;

        try {
            response = await httpClient.getHttpResponse(
                url,
                requestInit,
                [200],
                { description: "test Call" });
        } catch (e) {
            exceptionOccurred = true;
        }
        expect(exceptionOccurred, "expect an exception").to.be.equal(true);
    });

    it("02 post with basic auth", async () => {

        const options: IHttpClientOptions = {
            authorizationHeader: "Basic dGVzdDp0ZXN0", // test test
            logRequestResponse: false,
            origin: "https://ptsv2.com",
        };

        const httpClient: HttpClient = new HttpClient(options);

        const requestInit: RequestInit = {
            headers: new Headers(),
            method: "POST",
        };
        const url: string = "https://ptsv2.com/t/jb6te-1577116991/post";

        let response: Response;

        try {
            response = await httpClient.getHttpResponse(
                url,
                requestInit,
                [200],
                { description: "test Call" });

            const body = await response.text();
            expect(body).to.be.equal("Thank you for this dump. I hope you have a lovely day!");
        } catch (e) {
            expect(true, "expect no exception").to.be.equal(e.message);
        }

    });

    it("03 post without credentials", async () => {

        const options: IHttpClientOptions = {
            logRequestResponse: false,
            origin: "https://ptsv2.com",
        };

        const httpClient: HttpClient = new HttpClient(options);

        const requestInit: RequestInit = {
            method: "POST",
        };
        const url: string = "https://ptsv2.com/t/jb6te-1577116991/post";

        let exceptionMessage: string = "";

        try {
            await httpClient.getHttpResponse(
                url,
                requestInit,
                [200],
                { description: "test Call" });
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
            exceptionMessage = e.message;
        }

        expect(exceptionMessage, "expect an exception").to.be.not.equal("");
    });

    it("04 post without credentials recording mode", async () => {

        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        await rrLog.setContext("04 post without credentials recording mode");

        const options: IHttpClientOptions = {
            logRequestResponse: true,
            origin: "https://ptsv2.com",
        };

        const httpClient: HttpClient = new HttpClient(options);

        const requestInit: RequestInit = {
            method: "POST",
        };
        const url: string = "https://ptsv2.com/t/rdztk-1577118815/post";

        let response: Response;

        try {
            response = await httpClient.getHttpResponse(
                url,
                requestInit,
                [200],
                { description: "test Call" });

            const body: string = await response.text();
            expect(body).to.be.equal(`{"test":true}`);
            const body2: any = await response.json();
            expect(body2).to.be.have.property("test");
            expect(body2.test).to.be.equal(true);
            const body3: Buffer = await response.buffer();
            expect(body3).to.be.not.equal(null);

        } catch (e) {
            expect(true, "expect no exception").to.be.equal(e.message);
        }

    });

    it("05 post only absolute urls are supported", async () => {

        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        await rrLog.setContext("04 post without credentials recording mode");

        const options: IHttpClientOptions = {
            logRequestResponse: true,
            origin: "https://ptsv2.com",
        };

        const httpClient: HttpClient = new HttpClient(options);

        const requestInit: RequestInit = {
            method: "POST",
        };
        const url: string = "/t/rdztk-1577118815/post";

        try {
            await httpClient.getHttpResponse(
                url,
                requestInit,
                [200],
                { description: "test Call" });

        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }

    });

    it("06 without proxy auth header, origin, description and method", async () => {

        // no proxyAuthorizationHeader
        const proxy: IProxy = {
            host: "host",
            port: "1234",
            protocol: "https",
            secureProxy: true,
        };

        const options: IHttpClientOptions = {
            authorizationHeader: "basic 12343",
            logRequestResponse: true,
            // origin: "origin",
            proxy,
        };

        const httpClient: HttpClient = new HttpClient(options);

        const requestInit: RequestInit = {
            timeout: 1,
        };
        const url: string = "https://this.server.does.not.exist:1234/root";

        let response: Response;
        let exceptionOccurred: boolean = false;
        try {
            response = await httpClient.getHttpResponse(
                url,
                requestInit,
                [200],
                {});
        } catch (e) {
            exceptionOccurred = true;
        }
        expect(exceptionOccurred).to.be.equal(true);
    });

});
