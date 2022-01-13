"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs_1 = require("fs");
require("mocha");
const requestResponseLog_1 = __importDefault(require("../requestResponseLog"));
const requestResponseLogEntry_1 = __importStar(require("../requestResponseLogEntry"));
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("05-NEXCLOUD-NODE-CLIENT-REQUEST-RESPONSE-LOG", function () {
    this.timeout(1 * 60 * 1000);
    const baseDirName = "tmp/testresults/";
    const testContextName = "requestResponseLogTest/d1/d2";
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.rmdir(baseDirName, { recursive: true });
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
    }));
    it("01 get request response log instance", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        (0, chai_1.expect)(rrLog, "expect request response log to a object").to.be.a("object").that.is.instanceOf(requestResponseLog_1.default);
        // get the recorder a second time
        const rrLog2 = requestResponseLog_1.default.getInstance();
        (0, chai_1.expect)(rrLog2, "expect request response log to a object").to.be.a("object").that.is.instanceOf(requestResponseLog_1.default);
        requestResponseLog_1.default.deleteInstance();
    }));
    it("02 set request response log context", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        rrLog.baseDirectory = baseDirName;
        try {
            yield rrLog.setContext(testContextName);
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(true);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("no exception");
        }
        requestResponseLog_1.default.deleteInstance();
    }));
    it("03 request response logging", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        rrLog.baseDirectory = baseDirName;
        const requestLogEntry = new requestResponseLogEntry_1.RequestLogEntry("https://my.url.com", "method", "This is a description", "<?xml version=\"1.0\"?><body>This is a xml request body</body>");
        const responseLogEntry = new requestResponseLogEntry_1.ResponseLogEntry(200, "<?xml version=\"1.0\"?><body>This is a xml response body</body>", "application/xml; charset=utf-8", "location header");
        try {
            yield rrLog.setContext(testContextName);
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(true);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        const rrLogEntries = yield rrLog.getEntries();
        (0, chai_1.expect)(rrLogEntries).to.be.an("Array");
        (0, chai_1.expect)(rrLogEntries.length).to.be.equal(2);
        requestResponseLog_1.default.deleteInstance();
    }));
    it("04 request response logging without context", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        rrLog.baseDirectory = baseDirName;
        const requestLogEntry = new requestResponseLogEntry_1.RequestLogEntry("https://my.url.com", "method", "This is a description", "test request body");
        const responseLogEntry = new requestResponseLogEntry_1.ResponseLogEntry(200, "some response text", "content type", "location header");
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
            (0, chai_1.expect)(true, "expect an exception when adding an entry without context").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect exception").to.be.equal("Error while recording, context not set");
        }
        try {
            const rrLogEntries = yield rrLog.getEntries();
            (0, chai_1.expect)(true, "expect an exception when getting the entries without context").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect exception").to.be.equal("Error while getting recording request, context not set");
        }
        requestResponseLog_1.default.deleteInstance();
    }));
    it("05 invalid xml body", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        rrLog.baseDirectory = baseDirName;
        const requestLogEntry = new requestResponseLogEntry_1.RequestLogEntry("https://my.url.com", "method", "This is a description", "<?xml version=\"1.0\"?><XXXXbody>This is invalid xml request body");
        const responseLogEntry = new requestResponseLogEntry_1.ResponseLogEntry(200, "<?xml version=\"1.0\"?><body>This is a xml response body</body>", "application/xml; charset=utf-8", "location header");
        try {
            yield rrLog.setContext(testContextName);
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(true);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        const rrLogEntries = yield rrLog.getEntries();
        (0, chai_1.expect)(rrLogEntries).to.be.an("Array");
        (0, chai_1.expect)(rrLogEntries.length).to.be.equal(2);
        requestResponseLog_1.default.deleteInstance();
    }));
    it("06 no body in request and response", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        rrLog.baseDirectory = baseDirName;
        const requestLogEntry = new requestResponseLogEntry_1.RequestLogEntry("https://my.url.com", "method", "This is a description");
        const responseLogEntry = new requestResponseLogEntry_1.ResponseLogEntry(200, undefined, "application/xml; charset=utf-8", "location header");
        try {
            yield rrLog.setContext(testContextName);
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(true);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        const rrLogEntries = yield rrLog.getEntries();
        (0, chai_1.expect)(rrLogEntries).to.be.an("Array");
        (0, chai_1.expect)(rrLogEntries.length).to.be.equal(2);
        requestResponseLog_1.default.deleteInstance();
    }));
    it("07 response content type not xml", () => __awaiter(this, void 0, void 0, function* () {
        const rrLog = requestResponseLog_1.default.getInstance();
        rrLog.baseDirectory = baseDirName;
        const requestLogEntry = new requestResponseLogEntry_1.RequestLogEntry("https://my.url.com", "method", "This is a description", "text request body");
        const responseLogEntry = new requestResponseLogEntry_1.ResponseLogEntry(200, "plain text body response", "text/plain", "location header");
        try {
            yield rrLog.setContext(testContextName);
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(true);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        const rrLogEntries = yield rrLog.getEntries();
        (0, chai_1.expect)(rrLogEntries).to.be.an("Array");
        (0, chai_1.expect)(rrLogEntries.length).to.be.equal(2);
        requestResponseLog_1.default.deleteInstance();
    }));
    it("08 response content type json", () => __awaiter(this, void 0, void 0, function* () {
        // add a json response to the json body
        const rrLog = requestResponseLog_1.default.getInstance();
        rrLog.baseDirectory = baseDirName;
        const requestLogEntry = new requestResponseLogEntry_1.RequestLogEntry("https://my.url.com", "method", "This is a description", "text request body");
        const responseLogEntry = new requestResponseLogEntry_1.ResponseLogEntry(200, "{\"jsonProperty\":42}", "application/json", "location header");
        try {
            yield rrLog.setContext(testContextName);
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(true);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("no exception");
        }
        try {
            yield rrLog.addEntry(new requestResponseLogEntry_1.default(requestLogEntry, responseLogEntry));
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("expect no exception");
        }
        const rrLogEntries = yield rrLog.getEntries();
        (0, chai_1.expect)(rrLogEntries).to.be.an("Array");
        (0, chai_1.expect)(rrLogEntries.length).to.be.equal(1);
        (0, chai_1.expect)(rrLogEntries[0]).to.have.property("response");
        (0, chai_1.expect)(rrLogEntries[0].response).to.have.property("jsonBody");
        // console.log(rrLogEntries[0].response.jsonBody);
        (0, chai_1.expect)(rrLogEntries[0].response.jsonBody).to.be.an("object");
        (0, chai_1.expect)(rrLogEntries[0].response.jsonBody).to.have.property("jsonProperty");
        (0, chai_1.expect)(rrLogEntries[0].response.jsonBody.jsonProperty).to.be.equal(42);
        requestResponseLog_1.default.deleteInstance();
    }));
});
