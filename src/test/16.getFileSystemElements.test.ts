// this must be the first
import { config } from "dotenv";
config();

import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    File,
    Folder,
    Tag,
    FileSystemElement,
} from "../client";
import FakeServer from "../fakeServer";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import Share from "../share";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("16-NEXCLOUD-NODE-CLIENT-GET-FILESYSTEMELEMENTS", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 get file system elements by tags", async () => {

        const dirName = "/test/getFileSystemElementsByTags";
        const tag1: Tag = await client.createTag("tag-16-1");
        const tag2: Tag = await client.createTag("tag-16-2");
        const tag3: Tag = await client.createTag("tag-16-3");
        const tag4: Tag = await client.createTag("tag-16-4");

        const baseFolder: Folder = await client.createFolder(dirName);
        for (let c = 1; c < 1000; c++) {
            // const file: File = await baseFolder.createFile("testFile" + c + ".txt", Buffer.from("file " + c));
            // file.addTag(tag1.name);
        }

        const folder1: Folder = await client.createFolder(dirName + "/folder1");
        await folder1.addTag(tag1.name);

        const folder2: Folder = await client.createFolder(dirName + "/folder2");
        await folder2.addTag(tag1.name);
        await folder2.addTag(tag2.name);
        const folder3: Folder = await client.createFolder(dirName + "/folder3");
        await folder3.addTag(tag1.name);
        await folder3.addTag(tag2.name);
        await folder3.addTag(tag3.name);

        const file1: File = await client.createFile(dirName + "/file1.txt", Buffer.from("file 1"));
        await file1.addTag(tag1.name);
        const file2: File = await client.createFile(dirName + "/file2.txt", Buffer.from("file 2"));
        await file2.addTag(tag1.name);
        await file2.addTag(tag2.name);
        const file3: File = await client.createFile(dirName + "/file3.txt", Buffer.from("file 3"));
        await file3.addTag(tag1.name);
        await file3.addTag(tag2.name);
        await file3.addTag(tag3.name);

        let fse: FileSystemElement[] = [];
        let exception: Error | null = null;

        try {
            fse = await client.getFileSystemElementByTags([tag1, tag2, tag3]);
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(fse, "expect file to an array").to.be.a("array");
        expect(fse.length).to.be.equal(2);
        expect(fse[0]).is.instanceOf(Folder);
        expect(fse[0].name).to.be.equal(folder3.name);
        expect(fse[1]).is.instanceOf(File);
        expect(fse[1].name).to.be.equal(file3.name);

        try {
            fse = await client.getFileSystemElementByTags([tag1, tag2]);
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(fse, "expect file to an array").to.be.a("array");
        expect(fse.length).to.be.equal(4);
        expect(fse[0]).is.instanceOf(Folder);
        expect(fse[0].name).to.be.equal(folder2.name);
        expect(fse[1]).is.instanceOf(Folder);
        expect(fse[1].name).to.be.equal(folder3.name);

        expect(fse[2]).is.instanceOf(File);
        expect(fse[2].name).to.be.equal(file2.name);
        expect(fse[3]).is.instanceOf(File);
        expect(fse[3].name).to.be.equal(file3.name);

        try {
            fse = await client.getFileSystemElementByTags([tag1]);
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(fse, "expect file to an array").to.be.a("array");
        expect(fse.length).to.be.equal(6);
        expect(fse[0]).is.instanceOf(Folder);
        expect(fse[0].name).to.be.equal(folder1.name);
        expect(fse[1]).is.instanceOf(Folder);
        expect(fse[1].name).to.be.equal(folder2.name);
        expect(fse[2]).is.instanceOf(Folder);
        expect(fse[2].name).to.be.equal(folder3.name);

        expect(fse[3]).is.instanceOf(File);
        expect(fse[3].name).to.be.equal(file1.name);
        expect(fse[4]).is.instanceOf(File);
        expect(fse[4].name).to.be.equal(file2.name);
        expect(fse[5]).is.instanceOf(File);
        expect(fse[5].name).to.be.equal(file3.name);

        try {
            fse = await client.getFileSystemElementByTags([tag4]);
        } catch (e) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(fse, "expect file to an array").to.be.a("array");
        expect(fse.length).to.be.equal(0);

        try {
            fse = await client.getFileSystemElementByTags([]);
        } catch (e) {
            exception = e;
        }
        expect(exception).not.to.be.equal(null);

        await tag1.delete();
        await tag2.delete();
        await tag3.delete();
        await tag4.delete();
        await baseFolder.delete();

    });
});
