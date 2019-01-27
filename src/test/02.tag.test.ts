import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    ICredentials,
    NCClient,
    NCFile,
    NCFolder,
} from "../ncClient";
import NCTag from "../ncTag";

// tslint:disable-next-line:only-arrow-functions
describe("NEXCLOUD-NODE-CLIENT-TAG", function() {
    this.timeout(1 * 60 * 1000);

    it("1 get tags", async () => {

        const client = await NCClient.clientFactory();

        const tags: NCTag[] = await client.getTags();

        for (const x of tags) {
            // tslint:disable-next-line:no-console
            //     console.log("--- " + x);
        }
        expect(tags, "expect tags to be an array").to.be.a("array");
    });

    it("2 create tag", async () => {

        const client = await NCClient.clientFactory();
        const tagName: string = "Tag1";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);

        // await client.deleteTag("/remote.php/dav/systemtags/11");

    });

    it("3 delete tag", async () => {

        const client = await NCClient.clientFactory();
        const tagName: string = "Tag-to-be-deleted";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);
        await tag.delete();

        const deletedTag: NCTag | null = await client.getTagByName(tagName);
        expect(deletedTag).to.be.equal(null);

    });

    it("4 get tag by name", async () => {

        const client = await NCClient.clientFactory();
        const tagName: string = "get-Tag-by-name";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);

        const getTag: NCTag | null = await client.getTagByName(tagName);
        expect(getTag).not.to.be.equal(null);
        expect(getTag!.name).to.be.equal(tagName);

        await tag.delete();

    });

    it("5 get tag by id", async () => {

        const client = await NCClient.clientFactory();
        const tagName: string = "get-Tag-by-id";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);

        const getTag: NCTag | null = await client.getTagById(tag.id);
        expect(getTag).not.to.be.equal(null);
        expect(getTag!.name).to.be.equal(tagName);

        await tag.delete();

    });

    it("6 add tag to file", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/fileTagging";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, new Buffer("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.getId();

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

        try {
            file!.addTag(`tag-${Math.floor(Math.random() * 100)}`);
            file!.addTag(`tag-${Math.floor(Math.random() * 100)}`);
        } catch (e) {
            expect(true, "we do not expect an exception adding tags").to.be.equal(false);
        }

    });

    it("7 get tags of file", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/fileTagging";
        const fileName1 = "fileWith3Tags1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, new Buffer("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.getId();

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

        const tagsCreated: string[] = [`tag-${Math.floor(Math.random() * 100)}`, `tag-${Math.floor(Math.random() * 100)}`, `tag-${Math.floor(Math.random() * 100)}`];

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

    });

    it("8 folder tags", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/folderTagging";

        const folder = await client.createFolder(dirName);

        const tagsCreated: string[] = [`tag-${Math.floor(Math.random() * 100)}`, `tag-${Math.floor(Math.random() * 100)}`, `tag-${Math.floor(Math.random() * 100)}`];

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
        await folder.delete();

    });

    it("9 remove tag of file", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/fileTagging";
        const fileName1 = "removeTagOfFile.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, new Buffer("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.getId();

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

        const tagsCreated: string[] = [`tag-${Math.floor(Math.random() * 100)}`, `tag-${Math.floor(Math.random() * 100)}`, `tag-${Math.floor(Math.random() * 100)}`];

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

    });

    it("98 delete all tags", async () => {
        const client = await NCClient.clientFactory();
        const tagName: string = "TagToBeDelete";
        await client.createTag(tagName);
        await client.deleteAllTags();
        const tag: NCTag | null = await client.getTagByName(tagName);

        expect(tag).to.be.equal(null);

    });

    it("99 delete directory", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test";

        let baseDir: NCFolder | null = await client.createFolder(dirName);
        if (baseDir) {
            await baseDir.delete();
        }
        baseDir = await client.getFolder(dirName);
        expect(baseDir, "expect directory to be null").to.be.equal(null);
    });
});
