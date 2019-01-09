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
describe("NEXCLOUD-NODE-CLIENT", function() {
    this.timeout(1 * 60 * 1000);
    it("01 create client", async () => {

        let exceptionOccurred;

        try {
            await NCClient.clientFactory();
            exceptionOccurred = false;
        } catch (e) {
            exceptionOccurred = true;
            expect(exceptionOccurred, "expect that no exception occures when creating a nextcloud client").to.be.equal(false);
        }
    });

    it("02 get quota", async () => {

        const client = await NCClient.clientFactory();
        let q;
        try {
            q = await client.getQuota();
        } catch (e) {
            expect(e, "expect no exception").to.be.equal(null);
        }
        expect(q, "quota to have property used").to.have.property("used");
        expect(q, "quota to have property available").to.have.property("available");

    });

    it("03 get and create directory", async () => {

        const client = await NCClient.clientFactory();

        let errorOccurred;
        let directory: NCFolder | null = null;
        const dirName = "/test/a/b/c/d/xx";

        directory = await client.createFolder(dirName);

        try {
            directory = await client.getFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(directory, "expect directory to a object").to.be.a("object");
        expect(directory, "expect directory to be a NCFolder").to.be.instanceOf(NCFolder);

    });

    it("04 delete directory", async () => {

        const client = await NCClient.clientFactory();

        let errorOccurred;
        let directory: NCFolder | null = null;
        const dirName = "/test/deleteme";

        try {
            directory = await client.createFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(directory, "expect directory to an object").to.be.a("object");
        expect(directory, "expect directory to be a NCFolder").to.be.instanceOf(NCFolder);

        try {
            directory = await client.getFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(directory, "expect directory to an object").to.be.a("object");
        expect(directory, "expect directory to be a NCFolder").to.be.instanceOf(NCFolder);

        let deleteResponse: any;
        try {
            deleteResponse = await client.deleteFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        try {
            directory = await client.getFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(directory, "expect directory to null").to.be.equal(null);

    });

    it("05 get root directory", async () => {

        const client = await NCClient.clientFactory();

        let errorOccurred;
        let directory: NCFolder | null = null;
        const dirName = "";

        directory = await client.createFolder(dirName);

        try {
            directory = await client.getFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(directory, "expect directory to a object").to.be.a("object");
        expect(directory, "expect directory to be a NCFolder").to.be.instanceOf(NCFolder);

    });

    it("06 create . directory", async () => {

        const client = await NCClient.clientFactory();

        let errorOccurred;
        let directory: NCFolder | null = null;
        const dirName = ".";

        try {
            directory = await client.createFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }
        expect(directory, "expect directory to a null").to.be.equal(null);

    });

    it("07 create file", async () => {

        const client = await NCClient.clientFactory();

        let errorOccurred;
        const fileName = "/test/test2/file1.txt";

        let file: NCFile | null = null;

        try {
            file = await client.createFile(fileName, new Buffer("this is a test text"));
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(errorOccurred, "expect no exception").to.be.equal(false);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);

        // expect(file, "expect file to be a NCFolder").to.be.instanceOf(NCFile);

        expect(file, "expect file to a object").to.be.a("object");
        expect(file, "expect file to be a NCFolder").to.be.instanceOf(NCFile);

    });

    it("08 get sub directories of non existsing directory", async () => {

        const client = await NCClient.clientFactory();

        const directories = await client.getSubFolders("/non/existing/directory");

        expect(directories, "expect directories to be an array").to.be.a("array");
        expect(directories.length, "expect directories to be empty").to.be.equal(0);

    });

    it("09 get sub directories", async () => {

        const client = await NCClient.clientFactory();

        const baseName = "/test/base";
        const subDirName1 = "subdir1";
        const subDirName2 = "subdir2";

        const baseDir = await client.createFolder(baseName);
        await client.createFolder(baseName + "/" + subDirName1);
        await client.createFolder(baseName + "/" + subDirName2);

        const directories = await client.getSubFolders(baseName);

        expect(directories, "expect directories to be an array").to.be.a("array");
        expect(directories.length, "expect directories to be empty").to.be.equal(2);

    });

    it("10 get sub directories with directory object", async () => {

        const client = await NCClient.clientFactory();

        const baseName = "/test/base";
        const subDirName1 = "subdir1";
        const subDirName2 = "subdir2";

        const baseDir = await client.createFolder(baseName);
        await client.createFolder(baseName + "/" + subDirName1);
        await client.createFolder(baseName + "/" + subDirName2);

        const directories = await baseDir.getSubFolders();

        expect(directories, "expect directories to be an array").to.be.a("array");
        expect(directories.length, "expect directories to have 2 sub directories").to.be.equal(2);

    });

    it("11 get files of an empty directory", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/files/empty";

        const baseDir = await client.createFolder(dirName);

        const files = await baseDir.getFiles();

        expect(files, "expect files to be an array").to.be.a("array");
        expect(files.length, "expect files to be empty").to.be.equal(0);

    });

    it("12 get files of a directory", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/files";
        const fileName1 = "file1.txt";
        const fileName2 = "file2.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, new Buffer("File 1"));
        await baseDir.createFile(fileName2, new Buffer("File 2"));

        const files = await baseDir.getFiles();

        expect(files, "expect files to be an array").to.be.a("array");
        expect(files.length, "expect files to be empty").to.be.equal(2);

    });

    it("13 get file content", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/fileContent";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, new Buffer("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);

        const content: Buffer = await file!.getContent();
        expect(content.toString(), "expect file content to be 'File 1'").to.be.equal("File 1");
    });

    it("14 delete file", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/fileDelete";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, new Buffer("File 1"));

        let file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);

        await file!.delete();
        file = await baseDir.getFile(fileName1);

        expect(file, "expect file to be null").to.be.equal(null);
    });

    it("15 get link of file", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/fileLink";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, new Buffer("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const url = file!.getUrl();

        expect(url, "expect url to be a string").to.be.a("string");
        expect(url, "expect url to be available").to.be.not.equal("");
    });

    it("16 get link of directory", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/fileLink";

        await client.createFolder(dirName);

        const url = client.getLink(dirName);

        expect(url, "expect url to be a string").to.be.a("string");
        expect(url, "expect url to be available").to.be.not.equal("");
    });

    it("17 move directory", async () => {

        const client = await NCClient.clientFactory();

        const sourceDirName = "/test/sourceDirectory";
        const targetDirName = "/test/targetFolder";

        const sourceDir = await client.createFolder(sourceDirName);
        await sourceDir.move(targetDirName);

        expect(sourceDir.name, "expect that the dirname has changed to the target name").to.be.equal(targetDirName);
    });

    it("18 move file", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/renameFile";
        const sourceFileName = "sourceFile.txt";
        const targetFileName = dirName + "/targetFile.txt";

        const baseDir = await client.createFolder(dirName);

        const file = await baseDir.createFile(sourceFileName, new Buffer("File"));

        await file!.move(targetFileName);

        expect(file!.name, "expect that the filename has changed to the target name").to.be.equal(targetFileName);
    });

    it("19 get non existing file", async () => {

        const client = await NCClient.clientFactory();

        const fileName = "/test/doesNotExist.txt";

        const file: NCFile | null = await client.getFile(fileName);

        expect(file, "expect file to be null").to.be.equal(null);
    });

    it("20 get tags", async () => {

        const client = await NCClient.clientFactory();

        const tags: NCTag[] = await client.getTags();

        for (const x of tags) {
            // tslint:disable-next-line:no-console
            //     console.log("--- " + x);
        }
        expect(tags, "expect tags to be an array").to.be.a("array");
    });

    it("21 create tag", async () => {

        const client = await NCClient.clientFactory();
        const tagName: string = "Tag1";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);

        // await client.deleteTag("/remote.php/dav/systemtags/11");

    });

    it("22 delete tag", async () => {

        const client = await NCClient.clientFactory();
        const tagName: string = "Tag-to-be-deleted";
        const tag: NCTag = await client.createTag(tagName);

        expect(tag, "expect tag to be an object").to.be.a("object");
        expect(tag.name).to.be.equal(tagName);
        await tag.delete();

        const deletedTag: NCTag | null = await client.getTagByName(tagName);
        expect(deletedTag).to.be.equal(null);

    });

    it("23 get tag by name", async () => {

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

    it("24 get tag by id", async () => {

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

    it("25 get file id", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/getFileId";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, new Buffer("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.getId();

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

    });

    it("26 get folder id", async () => {

        const client = await NCClient.clientFactory();

        const dirName = "/test/getFolderId";

        const baseDir = await client.createFolder(dirName);

        const id: number = await baseDir!.getId();

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

    });

    it("27 add tag to file", async () => {

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

    it.skip("28 client factory with explicit credentials", async () => {

        const credentials: ICredentials = {
            basicAuth:
            {
                password: "<your password>",
                username: "<your user>",
            },
            url: "< nextcloud webdav url https://your-nextcloud-server.com/remote.php/webdav/>",
        };
        try {
            const client = await NCClient.clientFactory(credentials);
        } catch (e) {
            expect(true, "we do not expect an exception").to.be.equal(false);
        }

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
