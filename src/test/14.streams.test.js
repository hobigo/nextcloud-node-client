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
const fs_1 = __importDefault(require("fs"));
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
require("mocha");
const path_1 = __importDefault(require("path"));
const testUtils_1 = require("./testUtils");
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("14-NEXCLOUD-NODE-CLIENT-STREAMS", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 1000);
    it.skip("01 create file from stream", () => __awaiter(this, void 0, void 0, function* () {
        const rStream = fs_1.default.createReadStream(__filename);
        const fileName = "/ncncTest/streams/" + path_1.default.basename(__filename);
        console.log(fileName);
        let file;
        file = yield client.createFile(fileName, rStream);
        /*
            try {
                await share.setPassword("some password");
            } catch (e) {
                expect(e.message, "expect no exception setting password").to.be.equal(null);
            }
*/
        yield file.delete();
    }));
    it.skip("02 pipe file content stream", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFileName = "./src/test/data/text1.txt";
        const rStream = fs_1.default.createReadStream(sourceFileName);
        const fileName = "/ncncTest/streams/" + path_1.default.basename(sourceFileName);
        console.log(fileName);
        let file;
        file = yield client.createFile(fileName, rStream);
        /*
            try {
                await share.setPassword("some password");
            } catch (e) {
                expect(e.message, "expect no exception setting password").to.be.equal(null);
            }
        */
        const dest = fs_1.default.createWriteStream("./tmp/" + path_1.default.basename(sourceFileName));
        yield client.pipeContentStream(fileName, dest);
        yield file.delete();
    }));
});
