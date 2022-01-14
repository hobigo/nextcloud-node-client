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
describe("02-NEXCLOUD-NODE-CLIENT-TAG", function () {
    this.timeout(1 * 60 * 1000);
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    it("01 get tags", () => __awaiter(this, void 0, void 0, function* () {
        const tags = yield client.getTags();
        for (const x of tags) {
            // tslint:disable-next-line:no-console
            //     console.log("--- " + x);
        }
        (0, chai_1.expect)(tags, "expect tags to be an array").to.be.a("array");
    }));
    it("02 create tag", () => __awaiter(this, void 0, void 0, function* () {
        const tagName = "Tag1";
        const tag = yield client.createTag(tagName);
        (0, chai_1.expect)(tag, "expect tag to be an object").to.be.a("object");
        (0, chai_1.expect)(tag.name).to.be.equal(tagName);
        // await client.deleteTag("/remote.php/dav/systemtags/11");
    }));
    it("03 delete tag", () => __awaiter(this, void 0, void 0, function* () {
        const tagName = "Tag-to-be-deleted";
        const tag = yield client.createTag(tagName);
        (0, chai_1.expect)(tag, "expect tag to be an object").to.be.a("object");
        (0, chai_1.expect)(tag.name).to.be.equal(tagName);
        yield tag.delete();
        const deletedTag = yield client.getTagByName(tagName);
        (0, chai_1.expect)(deletedTag).to.be.equal(null);
    }));
    it("04 get tag by name", () => __awaiter(this, void 0, void 0, function* () {
        const tagName = "get-Tag-by-name";
        const tag = yield client.createTag(tagName);
        (0, chai_1.expect)(tag, "expect tag to be an object").to.be.a("object");
        (0, chai_1.expect)(tag.name).to.be.equal(tagName);
        const getTag = yield client.getTagByName(tagName);
        (0, chai_1.expect)(getTag).not.to.be.equal(null);
        (0, chai_1.expect)(getTag.name).to.be.equal(tagName);
        if (getTag) {
            const str = getTag.toString();
            (0, chai_1.expect)(str).to.be.a("string");
        }
        yield tag.delete();
    }));
    it("05 get tag by id", () => __awaiter(this, void 0, void 0, function* () {
        const tagName = "get-Tag-by-id";
        const tag = yield client.createTag(tagName);
        (0, chai_1.expect)(tag, "expect tag to be an object").to.be.a("object");
        (0, chai_1.expect)(tag.name).to.be.equal(tagName);
        const getTag = yield client.getTagById(tag.id);
        (0, chai_1.expect)(getTag).not.to.be.equal(null);
        (0, chai_1.expect)(getTag.name).to.be.equal(tagName);
        const getTag2 = yield client.getTagById(11223344);
        (0, chai_1.expect)(getTag2).to.be.equal(null);
        yield tag.delete();
    }));
    it("06 add tag to file", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileTagging";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        const id = yield file.id;
        (0, chai_1.expect)(id, "expect id to be a number").to.be.a("number");
        (0, chai_1.expect)(id, "expect id to be not -1").to.be.not.equal(-1);
        try {
            yield file.addTag(`tag-61`);
            yield file.addTag(`tag-62`);
        }
        catch (e) {
            (0, chai_1.expect)(true, "we do not expect an exception adding tags").to.be.equal(false);
        }
        let tag = yield client.getTagByName(`tag-61`);
        if (tag) {
            yield tag.delete();
        }
        tag = yield client.getTagByName(`tag-62`);
        if (tag) {
            yield tag.delete();
        }
        yield baseDir.delete();
    }));
    it("07 get tags of file", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileTagging";
        const fileName1 = "fileWith3Tags1.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        const id = yield file.id;
        (0, chai_1.expect)(id, "expect id to be a number").to.be.a("number");
        (0, chai_1.expect)(id, "expect id to be not -1").to.be.not.equal(-1);
        const tagsCreated = [`tag-71`, `tag-72`, `tag-73`];
        try {
            for (const tagName of tagsCreated) {
                yield file.addTag(tagName);
            }
        }
        catch (e) {
            (0, chai_1.expect)(true, "we do not expect an exception adding tags").to.be.equal(false);
        }
        const tagNames = yield file.getTags();
        tagNames.sort();
        tagsCreated.sort();
        // expect(tagNames, "Tag has value").to.be.equal(tagsCreated);
        (0, chai_1.expect)(tagNames[0], "Tag has value").to.be.equal(tagsCreated[0]);
        (0, chai_1.expect)(tagNames[1], "Tag has value").to.be.equal(tagsCreated[1]);
        (0, chai_1.expect)(tagNames[2], "Tag has value").to.be.equal(tagsCreated[2]);
        yield file.delete();
        let tag = yield client.getTagByName(tagsCreated[0]);
        if (tag) {
            yield tag.delete();
        }
        tag = yield client.getTagByName(tagsCreated[1]);
        if (tag) {
            yield tag.delete();
        }
        tag = yield client.getTagByName(tagsCreated[2]);
        if (tag) {
            yield tag.delete();
        }
        yield baseDir.delete();
    }));
    it("08 folder tags", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/folderTagging";
        const folder = yield client.createFolder(dirName);
        const tagsCreated = [`tag-81`, `tag-82`, `tag-83`];
        try {
            for (const tagName of tagsCreated) {
                yield folder.addTag(tagName);
            }
        }
        catch (e) {
            (0, chai_1.expect)(true, "we do not expect an exception adding tags").to.be.equal(false);
        }
        const tagNames = yield folder.getTags();
        tagNames.sort();
        tagsCreated.sort();
        // expect(tagNames, "Tag has value").to.be.equal(tagsCreated);
        (0, chai_1.expect)(tagNames[0], "Tag has value").to.be.equal(tagsCreated[0]);
        (0, chai_1.expect)(tagNames[1], "Tag has value").to.be.equal(tagsCreated[1]);
        (0, chai_1.expect)(tagNames[2], "Tag has value").to.be.equal(tagsCreated[2]);
        // remove a tag
        yield folder.removeTag(tagNames[0]);
        const tagNames2 = yield folder.getTags();
        (0, chai_1.expect)(tagNames2.length).to.be.equal(2);
        yield folder.delete();
        let tag = yield client.getTagByName(tagsCreated[0]);
        if (tag) {
            yield tag.delete();
        }
        tag = yield client.getTagByName(tagsCreated[1]);
        if (tag) {
            yield tag.delete();
        }
        tag = yield client.getTagByName(tagsCreated[2]);
        if (tag) {
            yield tag.delete();
        }
    }));
    it("09 remove tag of file", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileTagging";
        const fileName1 = "removeTagOfFile.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        const id = yield file.id;
        (0, chai_1.expect)(id, "expect id to be a number").to.be.a("number");
        (0, chai_1.expect)(id, "expect id to be not -1").to.be.not.equal(-1);
        const tagsCreated = [`tag-91`, `tag-92`, `tag-93`];
        try {
            for (const tagName of tagsCreated) {
                yield file.addTag(tagName);
            }
        }
        catch (e) {
            (0, chai_1.expect)(true, "we do not expect an exception adding tags").to.be.equal(false);
        }
        tagsCreated.sort();
        yield file.removeTag(tagsCreated[0]);
        const tagNames = yield file.getTags();
        (0, chai_1.expect)(tagNames.length, "only two tags should exist").to.be.equal(2);
        yield file.delete();
        let tag = yield client.getTagByName(tagsCreated[0]);
        if (tag) {
            yield tag.delete();
        }
        tag = yield client.getTagByName(tagsCreated[1]);
        if (tag) {
            yield tag.delete();
        }
        tag = yield client.getTagByName(tagsCreated[2]);
        if (tag) {
            yield tag.delete();
        }
        yield baseDir.delete();
    }));
    it("10 create a tag twice", () => __awaiter(this, void 0, void 0, function* () {
        const tagName = "Tag10";
        const tag = yield client.createTag(tagName);
        (0, chai_1.expect)(tag, "expect tag to be an object").to.be.a("object");
        (0, chai_1.expect)(tag.name).to.be.equal(tagName);
        // the second tag should be like the first tag
        const tag2 = yield client.createTag(tagName);
        (0, chai_1.expect)(tag2, "expect tag to be an object").to.be.a("object");
        (0, chai_1.expect)(tag2.name).to.be.equal(tagName);
        yield tag.delete();
        yield tag2.delete();
    }));
    it("11 remove non existing file tag should not cause an error", () => __awaiter(this, void 0, void 0, function* () {
        const tagName = "Tag-non-existing";
        const dirName = "/test/fileTagging";
        const fileName1 = "fileWithoutTags.txt";
        const baseDir = yield client.createFolder(dirName);
        const file1 = yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        (0, chai_1.expect)(file1, "Expect that the file cloud be created").not.to.be.equal(null);
        if (file1) {
            try {
                // tslint:disable-next-line:no-unused-expression
                yield file1.removeTag(tagName);
            }
            catch (e) {
                (0, chai_1.expect)(false, "Expect no exception when removing a non existing tag from a file").to.be.equal(true);
            }
            finally {
                yield file1.delete();
            }
        }
    }));
    it("12 remove non existing folder tag should not cause an error", () => __awaiter(this, void 0, void 0, function* () {
        const tagName = "Tag-non-existing";
        const dirName = "/test/folderTagging";
        const baseDir = yield client.createFolder(dirName);
        try {
            // tslint:disable-next-line:no-unused-expression
            yield baseDir.removeTag(tagName);
        }
        catch (e) {
            (0, chai_1.expect)(false, "Expect no exception when removing a non existing tag from a folder").to.be.equal(true);
        }
        finally {
            yield baseDir.delete();
        }
    }));
    it("13 get tags of a new file and expect none", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileTagging";
        const fileName1 = "fileWithoutTags2.txt";
        const baseDir = yield client.createFolder(dirName);
        const file1 = yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        (0, chai_1.expect)(file1, "Expect that the file cloud be created").not.to.be.equal(null);
        if (file1) {
            const tags = yield file1.getTags();
            (0, chai_1.expect)(tags.length, "Expect new file not to have any tags").to.be.equal(0);
            yield file1.delete();
        }
    }));
    it("14 create tag returning no content location", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "Tags get",
                method: "PROPFIND",
                url: "/remote.php/dav/systemtags/",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\" xmlns:s=\"http://sabredav.org/ns\" xmlns:oc=\"http://owncloud.org/ns\" xmlns:nc=\"http://nextcloud.org/ns\"><d:response><d:href>/remote.php/dav/systemtags/</d:href><d:propstat><d:prop><oc:id/><oc:display-name/><oc:user-visible/><oc:user-assignable/><oc:can-assign/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });
        entries.push({
            request: {
                description: "Tag Create",
                method: "POST",
                url: "/remote.php/dav/systemtags/",
            },
            response: {
                contentType: "text/html; charset=UTF-8",
                // no content location!
                status: 201,
            },
        });
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        const tagName = "tag-14";
        try {
            const tag = yield lclient.createTag(tagName);
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
    }));
    it("15 add tag to file permission fails", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
        entries.push({
            request: {
                description: "Tags get",
                method: "PROPFIND",
                url: "/remote.php/dav/systemtags/",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\" xmlns:s=\"http://sabredav.org/ns\" xmlns:oc=\"http://owncloud.org/ns\" xmlns:nc=\"http://nextcloud.org/ns\"><d:response><d:href>/remote.php/dav/systemtags/</d:href><d:propstat><d:prop><oc:id/><oc:display-name/><oc:user-visible/><oc:user-assignable/><oc:can-assign/></d:prop><d:status>HTTP/1.1 404 Not Found</d:status></d:propstat></d:response><d:response><d:href>/remote.php/dav/systemtags/644</d:href><d:propstat><d:prop><oc:id>644</oc:id><oc:display-name>tag-15</oc:display-name><oc:user-visible>true</oc:user-visible><oc:user-assignable>false</oc:user-assignable><oc:can-assign>false</oc:can-assign></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        const tagName = "tag-15";
        try {
            yield lclient.addTagToFile(123, tagName);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal('Error: No permission to assign tag "tag-15" to file. Tag is not assignable');
        }
    }));
    it("98 delete all tags", () => __awaiter(this, void 0, void 0, function* () {
        const tagName = "TagToBeDelete";
        yield client.createTag(tagName);
        yield client.deleteAllTags();
        const tag = yield client.getTagByName(tagName);
        (0, chai_1.expect)(tag).to.be.equal(null);
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
