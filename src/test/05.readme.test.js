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
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
require("mocha");
const client_1 = require("../client");
const server_1 = __importDefault(require("../server"));
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("05-NEXCLOUD-NODE-CLIENT-README", function () {
    this.timeout(1 * 60 * 1000);
    it.skip("01 readme", () => __awaiter(this, void 0, void 0, function* () {
        // service instance name from VCAP_SERVICES environment - "user-provided" section
        try {
            const server = new server_1.default({ url: "http:/test.test", basicAuth: { username: "user", password: "password" } });
            const client = new client_1.Client(server);
            const folder = yield client.createFolder("test");
            const file = yield folder.createFile("myFile.txt", Buffer.from("My file content"));
            yield file.addTag("MyTag");
            yield file.addTag("myComment");
            yield folder.delete();
            const content = yield file.getContent();
        }
        catch (e) {
            // some error handling
        }
    }));
});
