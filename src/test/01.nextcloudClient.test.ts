
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    NCClient,
    NCError,
    NCFile,
    NCFolder,
    NextcloudServer,
} from "../ncClient";

import TestRecorder from "../testRecorder";

import mockedEnv from "mocked-env";

const client = new NCClient(NCClient.getCredentialsFromEnv());

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("NEXCLOUD-NODE-CLIENT", function () {

    beforeEach(async function() {
        const tr: TestRecorder = TestRecorder.getInstance();
        if (this.currentTest && this.currentTest.parent) {
            await tr.setContext(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);
    it("01 create client", async () => {

        let exceptionOccurred;

        try {

            exceptionOccurred = false;
        } catch (e) {
            exceptionOccurred = true;
            expect(exceptionOccurred, "expect that no exception occures when creating a nextcloud client: exception: " + e.message).to.be.equal(false);
        }
    });

    it("02 get quota", async () => {

        // console.log(JSON.stringify(this.tests[0].title, null, 4));
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

        let errorOccurred;
        let folder: NCFolder | null = null;
        const dirName = "/test/aa/..";

        try {
            folder = await client.createFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(folder, "expect directory to a null").to.be.equal(null);

    });

    it("07 create file", async () => {

        let errorOccurred;
        const fileName = "/test/test2/file1.txt";

        let file: NCFile | null = null;

        try {
            file = await client.createFile(fileName, Buffer.from("this is a test text"));
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

        const directories = await client.getSubFolders("/non/existing/directory");

        expect(directories, "expect directories to be an array").to.be.a("array");
        expect(directories.length, "expect directories to be empty").to.be.equal(0);

    });

    it("09 get sub directories", async () => {

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

        const dirName = "/test/files/empty";

        const baseDir = await client.createFolder(dirName);

        const files = await baseDir.getFiles();

        expect(files, "expect files to be an array").to.be.a("array");
        expect(files.length, "expect files to be empty").to.be.equal(0);

    });

    it("12 get files of a directory", async () => {

        const dirName = "/test/files";
        const fileName1 = "file1.txt";
        const fileName2 = "file2.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));
        await baseDir.createFile(fileName2, Buffer.from("File 2"));

        const files = await baseDir.getFiles();

        expect(files, "expect files to be an array").to.be.a("array");
        expect(files.length, "expect files to be empty").to.be.equal(2);

    });

    it("13 get file content", async () => {

        const dirName = "/test/fileContent";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);

        const content: Buffer = await file!.getContent();
        expect(content.toString(), "expect file content to be 'File 1'").to.be.equal("File 1");
    });

    it("14 delete file", async () => {

        const dirName = "/test/fileDelete";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        let file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);

        await file!.delete();
        file = await baseDir.getFile(fileName1);

        expect(file, "expect file to be null").to.be.equal(null);
    });

    it("15 get link of file", async () => {

        const dirName = "/test/fileLink";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const url = file!.getUrl();

        expect(url, "expect url to be a string").to.be.a("string");
        expect(url, "expect url to be available").to.be.not.equal("");
    });

    it("16 get link of directory", async () => {

        const dirName = "/test/fileLink";

        await client.createFolder(dirName);

        const url = client.getLink(dirName);

        expect(url, "expect url to be a string").to.be.a("string");
        expect(url, "expect url to be available").to.be.not.equal("");
    });

    it("17 move directory", async () => {

        const sourceDirName = "/test/sourceDirectory";
        const targetDirName = "/test/targetFolder";

        const sourceDir = await client.createFolder(sourceDirName);
        await sourceDir.move(targetDirName);

        expect(sourceDir.name, "expect that the dirname has changed to the target name").to.be.equal(targetDirName);
    });

    it("18 move file", async () => {

        const dirName = "/test/renameFile";
        const sourceFileName = "sourceFile.txt";
        const targetFileName = dirName + "/targetFile.txt";

        const baseDir = await client.createFolder(dirName);

        const file = await baseDir.createFile(sourceFileName, Buffer.from("File"));

        await file!.move(targetFileName);

        expect(file!.name, "expect that the filename has changed to the target name").to.be.equal(targetFileName);
    });

    it("19 get non existing file", async () => {

        const fileName = "/test/doesNotExist.txt";
        const file: NCFile | null = await client.getFile(fileName);

        expect(file, "expect file to be null").to.be.equal(null);
    });

    it("20 get file id", async () => {

        const dirName = "/test/getFileId";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: NCFile | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.getId();

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

    });

    it("21 get folder id", async () => {

        const dirName = "/test/getFolderId";

        const baseDir = await client.createFolder(dirName);

        const id: number = await baseDir!.getId();

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

    });

    it("22 has subfolders", async () => {

        const parentFolderName = "/test/folderWithSubfolder";
        let subFolderName = "subFolder";

        const parentFolder = await client.createFolder(parentFolderName);
        const subFolder = await client.createFolder(parentFolderName + "/" + subFolderName);

        expect(await parentFolder.hasSubFolder(subFolderName), `Folder should have the subfolder with the name ${subFolderName}`).to.be.equal(true);
        subFolderName = "notASubFolder";
        expect(await parentFolder.hasSubFolder(subFolderName), `Folder should not have the subfolder with the name ${subFolderName}`).to.be.equal(false);

    });

    it("23 create client with wrong webdav url", async () => {
        const ncserver: NextcloudServer = new NextcloudServer("https://someServer.com:123", { username: "some user name", password: "some password" });

        try {
            // tslint:disable-next-line:no-unused-expression
            new NCClient(ncserver);
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_INVALID_NEXTCLOUD_WEBDAV_URL");
        }
    });

    it("24 create a client with url ", async () => {
        const ncserver: NextcloudServer = new NextcloudServer("https://someServer.com:123/remote.php/webdav", { username: "some user name", password: "some password" });
        try {
            // tslint:disable-next-line:no-unused-expression
            new NCClient(ncserver);
        } catch (e) {
            expect(e, "No exception expected").to.be.equal("");
        }

        ncserver.url += "/";
        try {
            // tslint:disable-next-line:no-unused-expression
            new NCClient(ncserver);
        } catch (e) {
            expect(e, "No exception expected").to.be.equal("");
        }
    });

    it("25 get file id", async () => {

        const dirName = "/test/fileId";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        const file: NCFile | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));

        expect(file, "expect file not to be null").to.be.not.equal(null);
        if (file) {
            const fileId: number = await file.getId();
            expect(fileId, "expect fileid to a number").to.be.a("number");
            expect(fileId).not.to.be.equal(-1);

            const url = file.getUrl();
            const fileId2 = await client.getFileId(url);
            expect(fileId2, "expect fileid to a number").to.be.a("number");
            expect(fileId2).not.to.be.equal(-1);

            await file.delete();
        }

    });

    it("26 delete a non existing file by name", async () => {

        try {
            await client.deleteFile("fileDoesNotExist.txt");
        } catch (e) {
            expect(e, "exception expected").not.to.be.equal("");
        }

    });

    it("27 try to get a folder with a file name", async () => {

        const dirName = "/test/getFolder";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        const file: NCFile | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));
        expect(file, "expect file not to be null").to.be.not.equal(null);

        if (file) {
            const folder: NCFolder | null = await client.getFolder(file.name);
            expect(folder, "expect folder to be null").to.be.equal(null);
        }

    });

    it.skip("28 create folder with '.'", async () => {

        const dirName = "./";
        const fileName1 = "file1.txt";

        const file: NCFile | null = await client.createFile(dirName + fileName1, Buffer.from("File 1"));

        expect(file, "expect file not to be null").to.be.not.equal(null);

        if (file) {
            await file.delete();
        }

    });

    it("29 create invalid file", async () => {

        const dirName = "/test/getFolder";
        const fileName1 = "fil*e1.txt";

        const baseDir = await client.createFolder(dirName);

        try {
            // tslint:disable-next-line:no-unused-expression
            await baseDir.createFile(fileName1, Buffer.from("File 1"));
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_INVALID_CHAR_IN_FILE_NAME");
        }

    });

    it("30 get folder url, UIUrl and id", async () => {

        const dirName = "/test/getFolder";
        const baseDir: NCFolder = await client.createFolder(dirName);
        const url = baseDir.getUrl();
        expect(url).to.be.an("string");
        expect(url).not.to.be.equal("");

        const uiUrl = await baseDir.getUIUrl();
        expect(uiUrl).to.be.an("string");
        expect(uiUrl).not.to.be.equal("");

        await baseDir.delete();
        try {
            // tslint:disable-next-line:no-unused-expression
            await baseDir.getId();
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_FOLDER_NOT_EXISTING");
        }

    });

    it("31 folder contains file test", async () => {

        const dirName = "/test/containsFileFolder";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        const file: NCFile | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));
        expect(file, "expect file not to be null").to.be.not.equal(null);
        expect(await baseDir.containsFile(fileName1)).to.be.equal(true);
        expect(await baseDir.containsFile("nonExistingFile.txt")).to.be.equal(false);

    });

    it("32 file get urls", async () => {

        const dirName = "/test/containsFileFolder";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        const file: NCFile | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));

        expect(file, "expect file not to be null").to.be.not.equal(null);
        if (file) {
            const url = file.getUrl();
            expect(url).to.be.an("string");
            expect(url).not.to.be.equal("");

            const uiUrl = await file.getUIUrl();
            expect(uiUrl).to.be.an("string");
            expect(uiUrl).not.to.be.equal("");

            await file.delete();

            try {
                // tslint:disable-next-line:no-unused-expression
                await file.getId();
            } catch (e) {
                expect(e).to.have.property("message");
                expect(e).to.have.property("code");
                expect(e.code).to.be.equal("ERR_FILE_NOT_EXISTING");
            }
        }

    });

    it("33 create subfolder", async () => {

        const dirName = "/test/subfolderTest";
        const baseDir: NCFolder = await client.createFolder(dirName);
        const subfolderName = "subFolder";

        const subfolder: NCFolder = await baseDir.createSubFolder("subsubfolder");
        expect(subfolder.name).not.to.be.equal(baseDir.name + "/" + subfolderName);

    });

    it("34 Get credentials from non existing VCAP_SERVICES environment", async () => {
        let restore = mockedEnv({
            VCAP_SERVICES: undefined,
        });

        try {
            // const cred: ICredentials = NCClient.getCredentialsFromVcapServicesEnv("");
            NCClient.getCredentialsFromVcapServicesEnv("");
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_VCAP_SERVICES_NOT_FOUND");
        } finally {
            restore();
        }

        restore = mockedEnv({
            VCAP_SERVICES: JSON.stringify(
                {
                    "user-provided":
                        [{
                            credentials: {
                            },
                            instance_name: "test",
                        }],
                }),
        });

        try {
            // const cred: ICredentials = NCClient.getCredentialsFromVcapServicesEnv("");
            NCClient.getCredentialsFromVcapServicesEnv("");
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_VCAP_SERVICES_NOT_FOUND");
        } finally {
            restore();
        }

        restore = mockedEnv({
            VCAP_SERVICES: JSON.stringify(
                {
                    "user-provided":
                        [{
                            credentials: {
                                url: "https://some.host-name.com/remote.php/webdav",
                                username: "someUserName",
                            },
                            instance_name: "test",
                        }],
                }),
        });

        try {
            // const cred: ICredentials = NCClient.getCredentialsFromVcapServicesEnv("");
            NCClient.getCredentialsFromVcapServicesEnv("");
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_VCAP_SERVICES_PASSWORD_NOT_DEFINED");
        } finally {
            restore();
        }

        restore = mockedEnv({
            VCAP_SERVICES: JSON.stringify(
                {
                    "user-provided":
                        [{
                            credentials: {
                                password: "somePassword",
                                url: "https://some.host-name.com/remote.php/webdav",
                            },
                            instance_name: "test",
                        }],
                }),
        });

        try {
            // const cred: ICredentials = NCClient.getCredentialsFromVcapServicesEnv("");
            NCClient.getCredentialsFromVcapServicesEnv("");
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_VCAP_SERVICES_USERNAME_NOT_DEFINED");
        } finally {
            restore();
        }

        restore = mockedEnv({
            VCAP_SERVICES: JSON.stringify(
                {
                    "user-provided":
                        [{
                            credentials: {
                                password: "somePassword",
                                url: "https://some.host-name.com/remote.php/webdav",
                                username: "someUserName",
                            },
                            instance_name: "test",
                        }],
                }),
        });

        try {
            // const cred: ICredentials = NCClient.getCredentialsFromVcapServicesEnv("");
            NCClient.getCredentialsFromVcapServicesEnv("");
        } catch (e) {
            expect(false, "no not expect an exception: " + e.message).to.be.equal(true);
        } finally {
            restore();
        }

        restore = mockedEnv({
            VCAP_SERVICES: JSON.stringify(
                {
                    "user-provided":
                        [{
                            credentials: {
                                password: "somePassword",
                                username: "someUserName",
                            },
                            instance_name: "test",
                        }],
                }),
        });

        try {
            // const cred: ICredentials = NCClient.getCredentialsFromVcapServicesEnv("");
            NCClient.getCredentialsFromVcapServicesEnv("");
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_VCAP_SERVICES_URL_NOT_DEFINED");
        } finally {
            restore();
        }

    });

    it("35 Get credentials from non existing environment", async () => {
        let restore = mockedEnv({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: undefined,
            NEXTCLOUD_USERNAME: "SomeUser",
        });

        try {
            // const cred: ICredentials = NCClient.getCredentialsFromVcapServicesEnv("");
            NCClient.getCredentialsFromEnv();
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_NEXTCLOUD_URL_NOT_DEFINED");
        } finally {
            restore();
        }

        restore = mockedEnv({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: undefined,
        });

        try {
            NCClient.getCredentialsFromEnv();
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_NEXTCLOUD_USERNAME_NOT_DEFINED");
        } finally {
            restore();
        }

        restore = mockedEnv({
            NEXTCLOUD_PASSWORD: undefined,
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
        });

        try {
            NCClient.getCredentialsFromEnv();
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_NEXTCLOUD_PASSWORD_NOT_DEFINED");
        } finally {
            restore();
        }

        restore = mockedEnv({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
        });

        try {
            NCClient.getCredentialsFromEnv();
        } catch (e) {
            expect(false, "do not expect an exception " + e.message).to.be.equal(true);
        } finally {
            restore();
        }
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
