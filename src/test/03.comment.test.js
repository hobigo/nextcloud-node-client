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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
require("mocha");
const client_1 = require("../client");
const testUtils_1 = require("./testUtils");
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("03-NEXCLOUD-NODE-CLIENT-COMMENT", function () {
    this.timeout(1 * 60 * 1000);
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    it("01 add comment to file", () => __awaiter(this, void 0, void 0, function* () {
        let errorOccurred;
        const fileName = "/test/comments/fileComments.txt";
        let file = null;
        try {
            file = yield client.createFile(fileName, Buffer.from("file with comments"));
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(errorOccurred, "expect no exception").to.be.equal(false);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        if (file) {
            try {
                yield file.addComment("C1");
                yield file.addComment("C2");
                yield file.addComment("C3");
                yield file.addComment("C4");
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("");
            }
            try {
                const comments = yield file.getComments(1, 1);
                (0, chai_1.expect)(comments[0]).to.be.equal("C3");
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("");
            }
        }
    }));
    it("02 add comment to folder", () => __awaiter(this, void 0, void 0, function* () {
        let errorOccurred;
        const folderName = "/test/folder/comments";
        let folder = null;
        try {
            folder = yield client.createFolder(folderName);
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(errorOccurred, "expect no exception").to.be.equal(false);
        (0, chai_1.expect)(folder, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.Folder);
        if (folder) {
            try {
                yield folder.addComment("C1");
                yield folder.addComment("C2");
                yield folder.addComment("C3");
                yield folder.addComment("C4");
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("");
            }
            try {
                const comments = yield folder.getComments(1, 1);
                (0, chai_1.expect)(comments[0]).to.be.equal("C3");
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("");
            }
            try {
                const comments = yield folder.getComments();
                (0, chai_1.expect)(comments[0]).to.be.equal("C4");
            }
            catch (e) {
                (0, chai_1.expect)(e.message, "expect no exception").to.be.equal("");
            }
            yield folder.delete();
        }
    }));
    it("99 delete directory", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test";
        let baseDir = yield client.createFolder(dirName);
        if (baseDir) {
            yield baseDir.delete();
        }
        baseDir = yield client.getFolder(dirName);
        (0, chai_1.expect)(baseDir, "expect directory to be null").to.be.equal(null);
    }));
});
