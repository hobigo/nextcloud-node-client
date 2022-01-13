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
const node_fetch_1 = require("node-fetch");
const httpClient_1 = require("../httpClient");
const requestResponseLog_1 = __importDefault(require("../requestResponseLog"));
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("20-NEXCLOUD-NODE-CLIENT-HTTP-CLIENT", function () {
    this.timeout(1 * 60 * 1000);
    it("01 timeout unkonwn server", () => __awaiter(this, void 0, void 0, function* () {
        const proxy = {
            host: "host",
            port: "1234",
            protocol: "https",
            proxyAuthorizationHeader: "some header",
            secureProxy: true,
        };
        const options = {
            authorizationHeader: "basic 12343",
            logRequestResponse: true,
            origin: "origin",
            proxy,
        };
        const httpClient = new httpClient_1.HttpClient(options);
        const requestInit = {
            method: "GET",
            // timeout: 1,
        };
        const url = "https://this.server.does.not.exist:1234/root";
        let response;
        let exceptionOccurred = false;
        try {
            response = yield httpClient.getHttpResponse(url, requestInit, [200], { description: "test Call" });
        }
        catch (e) {
            exceptionOccurred = true;
        }
        (0, chai_1.expect)(exceptionOccurred, "expect an exception").to.be.equal(true);
    }));
    it("02 post with basic auth", () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            authorizationHeader: "Basic dGVzdDp0ZXN0",
            logRequestResponse: false,
            origin: "https://ptsv2.com",
        };
        const httpClient = new httpClient_1.HttpClient(options);
        const requestInit = {
            headers: new node_fetch_1.Headers(),
            method: "POST",
        };
        const url = "https://ptsv2.com/t/jb6te-1577116991/post";
        let response;
        try {
            response = yield httpClient.getHttpResponse(url, requestInit, [200], { description: "test Call" });
            const body = yield response.text();
            (0, chai_1.expect)(body).to.be.equal("Thank you for this dump. I hope you have a lovely day!");
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(e.message);
        }
    }));
    it("03 post without credentials", () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            logRequestResponse: false,
            origin: "https://ptsv2.com",
        };
        const httpClient = new httpClient_1.HttpClient(options);
        const requestInit = {
            method: "POST",
        };
        const url = "https://ptsv2.com/t/jb6te-1577116991/post";
        let exceptionMessage = "";
        try {
            yield httpClient.getHttpResponse(url, requestInit, [200], { description: "test Call" });
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
            exceptionMessage = e.message;
        }
        (0, chai_1.expect)(exceptionMessage, "expect an exception").to.be.not.equal("");
    }));
    it("04 post without credentials recording mode", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        yield rrLog.setContext("04 post without credentials recording mode");
        const options = {
            logRequestResponse: true,
            origin: "https://ptsv2.com",
        };
        const httpClient = new httpClient_1.HttpClient(options);
        const requestInit = {
            method: "POST",
        };
        const url = "https://ptsv2.com/t/rdztk-1577118815/post";
        let response;
        try {
            response = yield httpClient.getHttpResponse(url, requestInit, [200], { description: "test Call" });
            const body = yield response.text();
            (0, chai_1.expect)(body).to.be.equal(`{"test":true}`);
            const body2 = yield response.json();
            (0, chai_1.expect)(body2).to.be.have.property("test");
            (0, chai_1.expect)(body2.test).to.be.equal(true);
            const body3 = yield response.buffer();
            (0, chai_1.expect)(body3).to.be.not.equal(null);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(e.message);
        }
    }));
    it("05 post only absolute urls are supported", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        yield rrLog.setContext("04 post without credentials recording mode");
        const options = {
            logRequestResponse: true,
            origin: "https://ptsv2.com",
        };
        const httpClient = new httpClient_1.HttpClient(options);
        const requestInit = {
            method: "POST",
        };
        const url = "/t/rdztk-1577118815/post";
        try {
            yield httpClient.getHttpResponse(url, requestInit, [200], { description: "test Call" });
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
    }));
    it("06 without proxy auth header, origin, description and method", () => __awaiter(this, void 0, void 0, function* () {
        // no proxyAuthorizationHeader
        const proxy = {
            host: "host",
            port: "1234",
            protocol: "https",
            secureProxy: true,
        };
        const options = {
            authorizationHeader: "basic 12343",
            logRequestResponse: true,
            // origin: "origin",
            proxy,
        };
        const httpClient = new httpClient_1.HttpClient(options);
        const requestInit = {
        // timeout: 1,
        };
        const url = "https://this.server.does.not.exist:1234/root";
        let response;
        let exceptionOccurred = false;
        try {
            response = yield httpClient.getHttpResponse(url, requestInit, [200], {});
        }
        catch (e) {
            exceptionOccurred = true;
        }
        (0, chai_1.expect)(exceptionOccurred).to.be.equal(true);
    }));
});
