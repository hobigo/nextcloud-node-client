import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    NCClient,
    NCFakeServer,
    NCFile,
    NCFolder,
} from "../ncClient";
import NCTag from "../ncTag";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import { getNextcloudClient } from "./testUtils";

let client: NCClient;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("02-NEXCLOUD-NODE-CLIENT-TAG", function () {
    this.timeout(1 * 60 * 1000);

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    it("01 get tags", async () => {

        const tags: NCTag[] = await client.getTags();

        for (const x of tags) {
            // tslint:disable-next-line:no-console
            //     console.log("--- " + x);
        }
        expect(tags, "expect tags to be an array").to.be.a("array");
    });

    it("02 create tag", async () => {

        const tagName: string = "Tag1";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);

        // await client.deleteTag("/remote.php/dav/systemtags/11");

    });

    it("03 delete tag", async () => {

        const tagName: string = "Tag-to-be-deleted";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);
        await tag.delete();

        const deletedTag: NCTag | null = await client.getTagByName(tagName);
        expect(deletedTag).to.be.equal(null);

    });

    it("04 get tag by name", async () => {

        const tagName: string = "get-Tag-by-name";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);

        const getTag: NCTag | null = await client.getTagByName(tagName);
        expect(getTag).not.to.be.equal(null);
        expect(getTag!.name).to.be.equal(tagName);
        if (getTag) {
            const str: string = getTag.toString();
            expect(str).to.be.a("string");
        }

        await tag.delete();

    });

    it("05 get tag by id", async () => {

        const tagName: string = "get-Tag-by-id";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);

        const getTag: NCTag | null = await client.getTagById(tag.id);
        expect(getTag).not.to.be.equal(null);
        expect(getTag!.name).to.be.equal(tagName);

        const getTag2: NCTag | null = await client.getTagById(11223344);
        expect(getTag2).to.be.equal(null);

        await tag.delete();

    });

    it("06 add tag to file", async () => {

        const dirName = "/test/fileTagging";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.id;

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

        try {
            await file!.addTag(`tag-61`);
            await file!.addTag(`tag-62`);
        } catch (e) {
            expect(true, "we do not expect an exception adding tags").to.be.equal(false);
        }

        let tag: NCTag | null = await client.getTagByName(`tag-61`);
        if (tag) {
            await tag.delete();
        }

        tag = await client.getTagByName(`tag-62`);
        if (tag) {
            await tag.delete();
        }

        await baseDir.delete();

    });

    it("07 get tags of file", async () => {

        const dirName = "/test/fileTagging";
        const fileName1 = "fileWith3Tags1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.id;

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

        const tagsCreated: string[] = [`tag-71`, `tag-72`, `tag-73`];

        try {
            for (const tagName of tagsCreated) {
                await file!.addTag(tagName);
            }
        } catch (e) {
            expect(true, "we do not expect an exception adding tags").to.be.equal(false);
        }

        const tagNames: string[] = await file!.getTags();
        tagNames.sort();
        tagsCreated.sort();
        // expect(tagNames, "Tag has value").to.be.equal(tagsCreated);
        expect(tagNames[0], "Tag has value").to.be.equal(tagsCreated[0]);
        expect(tagNames[1], "Tag has value").to.be.equal(tagsCreated[1]);
        expect(tagNames[2], "Tag has value").to.be.equal(tagsCreated[2]);
        await file!.delete();

        let tag: NCTag | null = await client.getTagByName(tagsCreated[0]);
        if (tag) {
            await tag.delete();
        }

        tag = await client.getTagByName(tagsCreated[1]);
        if (tag) {
            await tag.delete();
        }

        tag = await client.getTagByName(tagsCreated[2]);
        if (tag) {
            await tag.delete();
        }

        await baseDir.delete();
    });

    it("08 folder tags", async () => {

        const dirName = "/test/folderTagging";

        const folder = await client.createFolder(dirName);

        const tagsCreated: string[] = [`tag-81`, `tag-82`, `tag-83`];

        try {
            for (const tagName of tagsCreated) {
                await folder!.addTag(tagName);
            }
        } catch (e) {
            expect(true, "we do not expect an exception adding tags").to.be.equal(false);
        }

        const tagNames: string[] = await folder.getTags();
        tagNames.sort();
        tagsCreated.sort();
        // expect(tagNames, "Tag has value").to.be.equal(tagsCreated);
        expect(tagNames[0], "Tag has value").to.be.equal(tagsCreated[0]);
        expect(tagNames[1], "Tag has value").to.be.equal(tagsCreated[1]);
        expect(tagNames[2], "Tag has value").to.be.equal(tagsCreated[2]);

        // remove a tag
        await folder.removeTag(tagNames[0]);
        const tagNames2: string[] = await folder.getTags();
        expect(tagNames2.length).to.be.equal(2);

        await folder.delete();
        let tag: NCTag | null = await client.getTagByName(tagsCreated[0]);
        if (tag) {
            await tag.delete();
        }

        tag = await client.getTagByName(tagsCreated[1]);
        if (tag) {
            await tag.delete();
        }

        tag = await client.getTagByName(tagsCreated[2]);
        if (tag) {
            await tag.delete();
        }

    });

    it("09 remove tag of file", async () => {

        const dirName = "/test/fileTagging";
        const fileName1 = "removeTagOfFile.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.id;

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

        const tagsCreated: string[] = [`tag-91`, `tag-92`, `tag-93`];

        try {
            for (const tagName of tagsCreated) {
                await file!.addTag(tagName);
            }
        } catch (e) {
            expect(true, "we do not expect an exception adding tags").to.be.equal(false);
        }
        tagsCreated.sort();
        await file!.removeTag(tagsCreated[0]);

        const tagNames: string[] = await file!.getTags();

        expect(tagNames.length, "only two tags should exist").to.be.equal(2);
        await file!.delete();

        let tag: NCTag | null = await client.getTagByName(tagsCreated[0]);
        if (tag) {
            await tag.delete();
        }

        tag = await client.getTagByName(tagsCreated[1]);
        if (tag) {
            await tag.delete();
        }

        tag = await client.getTagByName(tagsCreated[2]);
        if (tag) {
            await tag.delete();
        }

        await baseDir.delete();
    });

    it("10 create a tag twice", async () => {

        const tagName: string = "Tag10";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);

        // the second tag should be like the first tag
        const tag2: NCTag = await client.createTag(tagName);
        expect(tag2, "expect tag to be an object").to.be.a("object");
        expect(tag2.name).to.be.equal(tagName);
        await tag.delete();
        await tag2.delete();
    });

    it("11 remove non existing file tag should not cause an error", async () => {

        const tagName: string = "Tag-non-existing";
        const dirName = "/test/fileTagging";
        const fileName1 = "fileWithoutTags.txt";

        const baseDir = await client.createFolder(dirName);
        const file1: NCFile | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));

        expect(file1, "Expect that the file cloud be created").not.to.be.equal(null);

        if (file1) {
            try {
                // tslint:disable-next-line:no-unused-expression
                await file1.removeTag(tagName);
            } catch (e) {
                expect(false, "Expect no exception when removing a non existing tag from a file").to.be.equal(true);
            } finally {
                await file1.delete();
            }
        }

    });

    it("12 remove non existing folder tag should not cause an error", async () => {

        const tagName: string = "Tag-non-existing";
        const dirName = "/test/folderTagging";

        const baseDir = await client.createFolder(dirName);

        try {
            // tslint:disable-next-line:no-unused-expression
            await baseDir.removeTag(tagName);
        } catch (e) {
            expect(false, "Expect no exception when removing a non existing tag from a folder").to.be.equal(true);
        } finally {
            await baseDir.delete();
        }

    });

    it("13 get tags of a new file and expect none", async () => {

        const dirName = "/test/fileTagging";
        const fileName1 = "fileWithoutTags2.txt";

        const baseDir = await client.createFolder(dirName);
        const file1: NCFile | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));

        expect(file1, "Expect that the file cloud be created").not.to.be.equal(null);

        if (file1) {
            const tags: string[] = await file1.getTags();
            expect(tags.length, "Expect new file not to have any tags").to.be.equal(0);
            await file1.delete();
        }
    });

    it("14 create tag returning no content location", async () => {

        const entries: RequestResponseLogEntry[] = [];

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

        const lclient: NCClient = new NCClient(new NCFakeServer(entries));

        const tagName: string = "tag-14";
        try {
            const tag: NCTag = await lclient.createTag(tagName);
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }

    });

    it("15 add tag to file permission fails", async () => {

        const entries: RequestResponseLogEntry[] = [];

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

        const lclient: NCClient = new NCClient(new NCFakeServer(entries));

        const tagName: string = "tag-15";
        try {
            await lclient.addTagToFile(123, tagName);
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal('Error: No permission to assign tag "tag-15" to file. Tag is not assignable');
        }

    });

    it("98 delete all tags", async () => {
        const tagName: string = "TagToBeDelete";
        await client.createTag(tagName);
        await client.deleteAllTags();
        const tag: NCTag | null = await client.getTagByName(tagName);

        expect(tag).to.be.equal(null);

    });

    it("99 delete directory", async () => {

        const dirName = "/test";

        let baseDir: NCFolder | null = await client.createFolder(dirName);
        if (baseDir) {
            await baseDir.delete();
        }
        baseDir = await client.getFolder(dirName);
        expect(baseDir, "expect directory to be null").to.be.equal(null);
    });
});
