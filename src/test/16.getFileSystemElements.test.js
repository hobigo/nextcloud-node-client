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
// this must be the first
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const chai_1 = require("chai");
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
require("mocha");
const client_1 = require("../client");
const testUtils_1 = require("./testUtils");
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("16-NEXCLOUD-NODE-CLIENT-GET-FILESYSTEMELEMENTS", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 1000);
    it("01 get file system elements by tags", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/getFileSystemElementsByTags";
        const tag1 = yield client.createTag("tag-16-1");
        const tag2 = yield client.createTag("tag-16-2");
        const tag3 = yield client.createTag("tag-16-3");
        const tag4 = yield client.createTag("tag-16-4");
        const baseFolder = yield client.createFolder(dirName);
        for (let c = 1; c < 1000; c++) {
            // const file: File = await baseFolder.createFile("testFile" + c + ".txt", Buffer.from("file " + c));
            // file.addTag(tag1.name);
        }
        const folder1 = yield client.createFolder(dirName + "/folder1");
        yield folder1.addTag(tag1.name);
        const folder2 = yield client.createFolder(dirName + "/folder2");
        yield folder2.addTag(tag1.name);
        yield folder2.addTag(tag2.name);
        const folder3 = yield client.createFolder(dirName + "/folder3");
        yield folder3.addTag(tag1.name);
        yield folder3.addTag(tag2.name);
        yield folder3.addTag(tag3.name);
        const file1 = yield client.createFile(dirName + "/file1.txt", Buffer.from("file 1"));
        yield file1.addTag(tag1.name);
        const file2 = yield client.createFile(dirName + "/file2.txt", Buffer.from("file 2"));
        yield file2.addTag(tag1.name);
        yield file2.addTag(tag2.name);
        const file3 = yield client.createFile(dirName + "/file3.txt", Buffer.from("file 3"));
        yield file3.addTag(tag1.name);
        yield file3.addTag(tag2.name);
        yield file3.addTag(tag3.name);
        let fse = [];
        let exception = null;
        try {
            fse = yield client.getFileSystemElementByTags([tag1, tag2, tag3]);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(fse, "expect file to an array").to.be.a("array");
        (0, chai_1.expect)(fse.length).to.be.equal(2);
        (0, chai_1.expect)(fse[0]).is.instanceOf(client_1.Folder);
        (0, chai_1.expect)(fse[0].name).to.be.equal(folder3.name);
        (0, chai_1.expect)(fse[1]).is.instanceOf(client_1.File);
        (0, chai_1.expect)(fse[1].name).to.be.equal(file3.name);
        try {
            fse = yield client.getFileSystemElementByTags([tag1, tag2]);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(fse, "expect file to an array").to.be.a("array");
        (0, chai_1.expect)(fse.length).to.be.equal(4);
        (0, chai_1.expect)(fse[0]).is.instanceOf(client_1.Folder);
        (0, chai_1.expect)(fse[0].name).to.be.equal(folder2.name);
        (0, chai_1.expect)(fse[1]).is.instanceOf(client_1.Folder);
        (0, chai_1.expect)(fse[1].name).to.be.equal(folder3.name);
        (0, chai_1.expect)(fse[2]).is.instanceOf(client_1.File);
        (0, chai_1.expect)(fse[2].name).to.be.equal(file2.name);
        (0, chai_1.expect)(fse[3]).is.instanceOf(client_1.File);
        (0, chai_1.expect)(fse[3].name).to.be.equal(file3.name);
        try {
            fse = yield client.getFileSystemElementByTags([tag1]);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(fse, "expect file to an array").to.be.a("array");
        (0, chai_1.expect)(fse.length).to.be.equal(6);
        (0, chai_1.expect)(fse[0]).is.instanceOf(client_1.Folder);
        (0, chai_1.expect)(fse[0].name).to.be.equal(folder1.name);
        (0, chai_1.expect)(fse[1]).is.instanceOf(client_1.Folder);
        (0, chai_1.expect)(fse[1].name).to.be.equal(folder2.name);
        (0, chai_1.expect)(fse[2]).is.instanceOf(client_1.Folder);
        (0, chai_1.expect)(fse[2].name).to.be.equal(folder3.name);
        (0, chai_1.expect)(fse[3]).is.instanceOf(client_1.File);
        (0, chai_1.expect)(fse[3].name).to.be.equal(file1.name);
        (0, chai_1.expect)(fse[4]).is.instanceOf(client_1.File);
        (0, chai_1.expect)(fse[4].name).to.be.equal(file2.name);
        (0, chai_1.expect)(fse[5]).is.instanceOf(client_1.File);
        (0, chai_1.expect)(fse[5].name).to.be.equal(file3.name);
        try {
            fse = yield client.getFileSystemElementByTags([tag4]);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).to.be.equal(null);
        (0, chai_1.expect)(fse, "expect file to an array").to.be.a("array");
        (0, chai_1.expect)(fse.length).to.be.equal(0);
        try {
            fse = yield client.getFileSystemElementByTags([]);
        }
        catch (e) {
            exception = e;
        }
        (0, chai_1.expect)(exception).not.to.be.equal(null);
        yield tag1.delete();
        yield tag2.delete();
        yield tag3.delete();
        yield tag4.delete();
        yield baseFolder.delete();
    }));
});
