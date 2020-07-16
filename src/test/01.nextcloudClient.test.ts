// this must be the first
import { config } from "dotenv";
config();

import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import mockedEnv from "mocked-env";
import {
    RequestInit,
} from "node-fetch";
import {
    Client,
    ClientError,
    FakeServer,
    File,
    Folder,
} from "../client";
import Environment from "../environment";
import EnvironmentVcapServices from "../environmentVcapServices";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import Server from "../server";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("01-NEXCLOUD-NODE-CLIENT", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 create client fails", async () => {
        const restore = mockedEnv({
            NEXTCLOUD_URL: undefined,
            VCAP_SERVICES: undefined,
        });

        try {
            // tslint:disable-next-line:no-unused-expression
            new Client();
            expect(false, "expect an exception").to.be.equal(true);
        } catch (e) {
            // should fail, if env is not set correctly
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_NEXTCLOUD_URL_NOT_DEFINED");
        } finally {
            restore();
        }
    });

    it("02 create client success", async () => {
        const restore = mockedEnv({
            NEXTCLOUD_URL: undefined,
            VCAP_SERVICES: JSON.stringify(
                {
                    "user-provided":
                        [{
                            credentials: {
                                password: "somePassword",
                                url: "https://some.host-name.com/remote.php/webdav",
                                username: "someUserName",
                            },
                            name: "nextcloud",
                        }],
                }),
        });
        try {
            // tslint:disable-next-line:no-unused-expression
            new Client();
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal("expect no exception");
        } finally {
            restore();
        }
    });

    it("03 get and create folder", async () => {

        let errorOccurred;
        let folder: Folder | null = null;
        const dirName = "/test/a/b/c/d/xx";

        folder = await client.createFolder(dirName);

        try {
            folder = await client.getFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(folder, "expect folder to a object").to.be.a("object");
        expect(folder, "expect folder to be a Folder").to.be.instanceOf(Folder);

    });

    it("04 delete folder", async () => {

        let errorOccurred;
        let folder: Folder | null = null;
        const dirName = "/test/deleteme";

        try {
            folder = await client.createFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(folder, "expect folder to an object").to.be.a("object");
        expect(folder, "expect folder to be a Folder").to.be.instanceOf(Folder);

        try {
            folder = await client.getFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(folder, "expect folder to an object").to.be.a("object");
        expect(folder, "expect folder to be a Folder").to.be.instanceOf(Folder);

        let deleteResponse: any;
        try {
            deleteResponse = await client.deleteFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        try {
            folder = await client.getFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(folder, "expect folder to null").to.be.equal(null);

    });

    it("05 get root folder", async () => {

        let errorOccurred;
        let folder: Folder | null = null;
        const dirName = "";

        folder = await client.createFolder(dirName);

        try {
            folder = await client.getFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(folder, "expect folder to a object").to.be.a("object");
        expect(folder, "expect folder to be a Folder").to.be.instanceOf(Folder);

    });

    it("06 create . folder", async () => {

        let errorOccurred;
        let folder: Folder | null = null;
        const dirName = "/test/aa/..";

        try {
            folder = await client.createFolder(dirName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(folder, "expect folder to a null").to.be.equal(null);

    });

    it("07 create file", async () => {

        let errorOccurred;
        const fileName = "/test/test07/file1.txt";

        let file: File | null = null;

        try {
            file = await client.createFile(fileName, Buffer.from("this is a test text"));
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(errorOccurred, "expect no exception").to.be.equal(false);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(File);

        // expect(file, "expect file to be a Folder").to.be.instanceOf(File);

        expect(file, "expect file to a object").to.be.a("object");
        expect(file, "expect file to be a Folder").to.be.instanceOf(File);

        const folder: Folder = await file!.getFolder();
        expect(folder.baseName, "base name of the file folder is 'test07'").to.be.equal("test07");

        await folder.delete();
        try {
            await file!.getFolder();
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal("Error, the folder of the file does not exist anymore");
        }

    });

    it("08 get sub directories of non existsing folder", async () => {

        const directories = await client.getSubFolders("/non/existing/folder");

        expect(directories, "expect directories to be an array").to.be.a("array");
        expect(directories.length, "expect directories to be empty").to.be.equal(0);

    });

    it("09 get sub directories", async () => {

        const baseName = "/test/base09";
        const subDirName1 = "subdir1";
        const subDirName2 = "subdir2";

        const baseDir = await client.createFolder(baseName);
        await client.createFolder(baseName + "/" + subDirName1);
        await client.createFolder(baseName + "/" + subDirName2);

        const directories = await client.getSubFolders(baseName);

        expect(directories, "expect directories to be an array").to.be.a("array");
        expect(directories.length, "expect 2 directories:" + JSON.stringify(directories)).to.be.equal(2);
        await baseDir.delete();
    });

    it("10 get sub directories with folder object", async () => {

        const baseName = "/test/base10";
        const subDirName1 = "subdir1";
        const subDirName2 = "subdir2";

        const baseDir = await client.createFolder(baseName);
        await client.createFolder(baseName + "/" + subDirName1);
        await client.createFolder(baseName + "/" + subDirName2);

        const directories = await baseDir.getSubFolders();

        expect(directories, "expect directories to be an array").to.be.a("array");
        expect(directories.length, "expect directories to have 2 sub directories").to.be.equal(2);
        await baseDir.delete();
    });

    it("11 get files of an empty folder", async () => {

        const dirName = "/test/files/empty";

        const baseDir = await client.createFolder(dirName);

        const files = await baseDir.getFiles();

        expect(files, "expect files to be an array").to.be.a("array");
        expect(files.length, "expect files to be empty").to.be.equal(0);

        await baseDir.delete();
    });

    it("12 get files of a folder", async () => {

        const dirName = "/test/files";
        const fileName1 = "file1.txt";
        const fileName2 = "file2.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));
        await baseDir.createFile(fileName2, Buffer.from("File 2"));

        const files = await baseDir.getFiles();

        expect(files, "expect files to be an array").to.be.a("array");
        expect(files.length, "expect files to be empty").to.be.equal(2);
        await baseDir.delete();
    });

    it("13 get file content", async () => {

        const dirName = "/test/fileContent";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: File | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(File);

        const content: Buffer = await file!.getContent();
        expect(content.toString(), "expect file content to be 'File 1'").to.be.equal("File 1");
        await baseDir.delete();
    });

    it("14 delete file", async () => {

        const dirName = "/test/fileDelete";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        let file: File | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(File);

        await file!.delete();
        file = await baseDir.getFile(fileName1);

        expect(file, "expect file to be null").to.be.equal(null);
        await baseDir.delete();
    });

    it("15 get link of file", async () => {

        const dirName = "/test/fileLink";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: File | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(File);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const url = file!.getUrl();

        expect(url, "expect url to be a string").to.be.a("string");
        expect(url, "expect url to be available").to.be.not.equal("");
    });

    it("16 get link of folder", async () => {

        const dirName = "/test/fileLink";

        await client.createFolder(dirName);

        const url = client.getLink(dirName);

        expect(url, "expect url to be a string").to.be.a("string");
        expect(url, "expect url to be available").to.be.not.equal("");
    });

    it("17 move folder", async () => {

        const sourceDirName = "/test/sourcefolder";
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
        const file: File | null = await client.getFile(fileName);

        expect(file, "expect file to be null").to.be.equal(null);
    });

    it("20 get file id", async () => {

        const dirName = "/test/getFileId";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: File | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(File);
        expect(file, "expect file not to be null").to.be.not.equal(null);

        const id: number = await file!.id;

        expect(id, "expect id to be a number").to.be.a("number");
        expect(id, "expect id to be not -1").to.be.not.equal(-1);

    });

    it("21 get folder id", async () => {

        const dirName = "/test/getFolderId";

        const baseDir = await client.createFolder(dirName);

        const id: number = await baseDir!.id;

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
        const ncserver: Server = new Server(
            {
                basicAuth:
                {
                    password: "some password",
                    username: "some user name",
                },
                url: "https://someServer.com:123",
            });

        try {
            // tslint:disable-next-line:no-unused-expression
            new Client(ncserver);
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_INVALID_NEXTCLOUD_WEBDAV_URL");
        }
    });

    it("24 create a client with url ", async () => {
        const ncserver: Server = new Server(
            {
                basicAuth:
                {
                    password: "some password",
                    username: "some user name",
                },
                url: "https://someServer.com:123/remote.php/webdav",
            });

        try {
            // tslint:disable-next-line:no-unused-expression
            new Client(ncserver);
        } catch (e) {
            expect(e, "No exception expected").to.be.equal("");
        }

        ncserver.url += "/";
        try {
            // tslint:disable-next-line:no-unused-expression
            new Client(ncserver);
        } catch (e) {
            expect(e, "No exception expected").to.be.equal("");
        }
    });

    it("25 get file id", async () => {

        const dirName = "/test/fileId";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        const file: File | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));

        expect(file, "expect file not to be null").to.be.not.equal(null);
        if (file) {
            const fileId: number = await file.id;
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
        const file: File | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));
        expect(file, "expect file not to be null").to.be.not.equal(null);

        if (file) {
            const folder: Folder | null = await client.getFolder(file.name);
            expect(folder, "expect folder to be null").to.be.equal(null);
        }

    });

    it("28 create folder with '.'", async () => {

        const dirName = "./";
        const fileName1 = "file1.txt";

        const file: File | null = await client.createFile(dirName + fileName1, Buffer.from("File 1"));

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
        const baseDir: Folder = await client.createFolder(dirName);
        const url = baseDir.getUrl();
        expect(url).to.be.an("string");
        expect(url).not.to.be.equal("");

        const uiUrl = await baseDir.getUIUrl();
        expect(uiUrl).to.be.an("string");
        expect(uiUrl).not.to.be.equal("");

        await baseDir.delete();
        try {
            // tslint:disable-next-line:no-unused-expression
            await baseDir.id;
        } catch (e) {
            expect(e).to.have.property("message");
            expect(e).to.have.property("code");
            expect(e.code).to.be.equal("ERR_FOLDER_NOT_EXISTING");
        }

    });

    it("31 folder contains file test", async () => {

        const dirName = "/test/containsFileFolder";
        const fileName1 = "file31.txt";

        const baseDir = await client.createFolder(dirName);
        const file: File | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));
        expect(file, "expect file not to be null").to.be.not.equal(null);
        expect(await baseDir.containsFile(fileName1)).to.be.equal(true);
        expect(await baseDir.containsFile("nonExistingFile.txt")).to.be.equal(false);
        await baseDir.delete();

    });

    it("32 file get urls", async () => {

        const dirName = "/test/fileGetUrl";
        const fileName1 = "file32.txt";

        const baseDir = await client.createFolder(dirName);
        const file: File | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));

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
                file.id;
            } catch (e) {
                expect(e).to.have.property("message");
                expect(e).to.have.property("code");
                expect(e.code).to.be.equal("ERR_FILE_NOT_EXISTING");
            }
        }
        await baseDir.delete();
    });

    it("33 create subfolder", async () => {

        const dirName = "/test/subfolderTest";
        const baseDir: Folder = await client.createFolder(dirName);
        const subfolderName = "subFolder";

        const subfolder: Folder = await baseDir.createSubFolder("subsubfolder");
        expect(subfolder.name).not.to.be.equal(baseDir.name + "/" + subfolderName);

    });

    it("34 Get credentials from non existing VCAP_SERVICES environment", async () => {
        let restore = mockedEnv({
            VCAP_SERVICES: undefined,
        });

        try {
            new EnvironmentVcapServices("").getServer();
            expect(true, "expect no exception").to.be.equal(false);
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
                            name: "test",
                        }],
                }),
        });

        try {
            new EnvironmentVcapServices("").getServer();
            expect(true, "expect no exception").to.be.equal(false);
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
                            name: "test",
                        }],
                }),
        });

        try {
            new EnvironmentVcapServices("").getServer();
            expect(true, "expect no exception").to.be.equal(false);
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
                            name: "test",
                        }],
                }),
        });

        try {
            new EnvironmentVcapServices("").getServer();
            expect(true, "expect no exception").to.be.equal(false);
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
                            name: "test",
                        }],
                }),
        });

        try {
            new EnvironmentVcapServices("").getServer();
        } catch (e) {
            expect(false, "expect no exception: " + e.message).to.be.equal(true);
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
                            name: "test",
                        }],
                }),
        });

        try {
            new EnvironmentVcapServices("").getServer();
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
            Environment.getNextcloudUrl();
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
            Environment.getUserName();
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
            Environment.getPassword();
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
            Environment.getNextcloudUrl();
            Environment.getPassword();
            Environment.getUserName();
        } catch (e) {
            expect(false, "do not expect an exception " + e.message).to.be.equal(true);
        } finally {
            restore();
        }

        restore = mockedEnv({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
            TEST_RECORDING_ACTIVE: "X",
        });

        try {
            Environment.getNextcloudUrl();
            Environment.getPassword();
            Environment.getUserName();
            Environment.getRecordingActiveIndicator();
        } catch (e) {
            expect(false, "do not expect an exception " + e.message).to.be.equal(true);
        } finally {
            restore();
        }

        restore = mockedEnv({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
            TEST_RECORDING_ACTIVE: "false",
        });

        try {
            Environment.getNextcloudUrl();
            Environment.getPassword();
            Environment.getUserName();
            Environment.getRecordingActiveIndicator();
        } catch (e) {
            expect(false, "do not expect an exception " + e.message).to.be.equal(true);
        } finally {
            restore();
        }

        restore = mockedEnv({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
            TEST_RECORDING_ACTIVE: "0",
        });

        try {
            Environment.getNextcloudUrl();
            Environment.getPassword();
            Environment.getUserName();
            Environment.getRecordingActiveIndicator();
        } catch (e) {
            expect(false, "do not expect an exception " + e.message).to.be.equal(true);
        } finally {
            restore();
        }

        restore = mockedEnv({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
            TEST_RECORDING_ACTIVE: "inactive",
        });

        try {
            Environment.getNextcloudUrl();
            Environment.getPassword();
            Environment.getUserName();
            Environment.getRecordingActiveIndicator();
        } catch (e) {
            expect(false, "do not expect an exception " + e.message).to.be.equal(true);
        } finally {
            restore();
        }

    });

    it("36 get file with folder name", async () => {

        const dirName = "/test/folder36";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: File | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(File);

        // returns null only for coverage
        await client.getFile(dirName);

        await baseDir.delete();
    });

    it("37 get file with incomplete server response", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "File/Folder get details",
                method: "PROPFIND",
                url: "/remote.php/webdav/test/folder37",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\" xmlns:s=\"http://sabredav.org/ns\" xmlns:oc=\"http://owncloud.org/ns\" xmlns:nc=\"http://nextcloud.org/ns\"><d:response><d:href>/remote.php/webdav/test/files/file1.txt</d:href><d:propstat><d:prop><d:getlastmodified>Wed, 18 Dec 2019 17:38:35 GMT</d:getlastmodified><d:getetag>&quot;75087567dd1ebe3c04d134837063aeca&quot;</d:getetag><d:MISSINGgetcontenttype>text/plain</d:MISSINGgetcontenttype><d:resourcetype/><oc:MISSINGfileid>78891</oc:MISSINGfileid><oc:permissions>RGDNVW</oc:permissions><oc:size>6</oc:size><d:getcontentlength>6</d:getcontentlength><nc:has-preview>true</nc:has-preview><oc:favorite>0</oc:favorite><oc:comments-unread>0</oc:comments-unread><oc:owner-display-name>Horst-Thorsten Borstenson</oc:owner-display-name><oc:share-types/></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = await lclient.getFile("some dummy name");
            // expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(e.message);
        }

    });

    it("38 delete non existing folder", async () => {
        const dirName = "/test/deletemeNonExistingFolder";

        try {
            await client.deleteFolder(dirName);
        } catch (e) {
            expect(true, "expect folder no exception").to.be.equal(false);
        }

    });

    it("39 move folder fails", async () => {
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "Folder move",
                method: "MOVE",
                url: "/remote.php/webdav/test/source",
            },
            response: {
                body: "",
                contentType: "text/html; charset=UTF-8",
                status: 500,
            },
        });

        const sourceDirName = "/test/sourcefolder";
        const targetDirName = "/test/targetFolder";

        const lclient: Client = new Client(new FakeServer(entries));

        let folder: Folder;
        try {
            folder = await lclient.moveFolder(sourceDirName, targetDirName);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }
        expect(folder!, "expect an folder to be undefined").to.be.equal(undefined);

    });

    it("40 move folder fails - target folder missing", async () => {
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "Folder move",
                method: "MOVE",
                url: "/remote.php/webdav/test/source",
            },
            response: {
                body: "",
                contentType: "text/html; charset=UTF-8",
                status: 201,
            },
        });

        entries.push({
            request: {
                description: "File/Folder get details",
                method: "PROPFIND",
                url: "/remote.php/webdav/test/target",
            },
            response: {
                body: "",
                contentType: "text/html; charset=UTF-8",
                status: 404,
            },
        });

        const sourceDirName = "/test/sourcefolder";
        const targetDirName = "/test/targetFolder";

        const lclient: Client = new Client(new FakeServer(entries));

        let folder: Folder;
        try {
            folder = await lclient.moveFolder(sourceDirName, targetDirName);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }
        expect(folder!, "expect an folder to be undefined").to.be.equal(undefined);

    });

    it("41 get file content should fail", async () => {

        const dirName = "/test/folder41";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        const file1: File | null = await baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file2: File | null = await baseDir.getFile(fileName1);

        await file1!.delete();

        try {
            await file2?.getContent();
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal("HTTP response status 404 not expected. Expected status: 200 - status text: Not Found");
        }

        await baseDir.delete();
    });

    it("50 fake server without responses and request without method", async () => {
        const requestInit: RequestInit = {};
        const fs: FakeServer = new FakeServer([]);
        try {
            await fs.getFakeHttpResponse("", requestInit, [201], { description: "get response without method" });
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message).to.be.equal("error providing fake http response. No fake response available");
        }

    });

    it("51 fake server without response content type", async () => {
        const requestInit: RequestInit = {};
        const fs: FakeServer = new FakeServer([
            {
                request:
                {
                    description: "description",
                    method: "method",
                    url: "url",

                }, response: { status: 201, body: "body" },
            },
        ]);
        try {
            await fs.getFakeHttpResponse("", requestInit, [201], { description: "get response without method" });

        } catch (e) {
            expect(true, "expect no exception").to.be.equal(e.message);
        }

    });

    it("60 get file id with missing fileId", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "File get id",
                method: "PROPFIND",
                url: "/remote.php/webdav/test/fileId/file1.txt",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\" xmlns:s=\"http://sabredav.org/ns\" xmlns:oc=\"http://owncloud.org/ns\" xmlns:nc=\"http://nextcloud.org/ns\"><d:response><d:href>/remote.php/webdav/test/fileId/file1.txt</d:href><d:propstat><d:prop><oc:NOfileid>78843</oc:NOfileid></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getFileId("some/url");
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }

    });

    it("61 create folder error handling", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "File/Folder get details",
                method: "PROPFIND",
                url: "/remote.php/webdav/x",
            },
            response: {
                body: "",
                contentType: "text/html; charset=UTF-8",
                status: 404,
            },
        });

        entries.push({
            request: {
                description: "Folder create",
                method: "MKCOL",
                url: "/remote.php/webdav/x",
            },
            response: {
                body: "",
                contentType: "text/html; charset=UTF-8",
                status: 201,
            },
        });

        entries.push({
            request: {
                description: "File/Folder get details",
                method: "PROPFIND",
                url: "/remote.php/webdav/x",
            },
            response: {
                body: "",
                contentType: "text/html; charset=UTF-8",
                status: 404, // this should cause the error
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.createFolder("/x");
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }

    });

    it("62 move file that does not exist", async () => {

        const dirName = "/test/renameFile62";
        const sourceFileName = "sourceFile.txt";
        const targetFileName = dirName + "/targetFile.txt";

        const baseDir = await client.createFolder(dirName);

        const file = await baseDir.createFile(sourceFileName, Buffer.from("File"));

        await file!.delete();

        try {
            await file!.move(targetFileName);
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }

        await baseDir.delete();
    });

    it("63 move file to an unexisting folder", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "File move",
                method: "MOVE",
                url: "/remote.php/webdav/test/renameFile63/sourceFile.txt",
            },
            response: {
                contentType: "text/html; charset=UTF-8",
                status: 201,
            },
        });

        entries.push({
            request: {
                description: "File/Folder get details",
                method: "PROPFIND",
                url: "/remote.php/webdav/test/renameFile63",
            },
            response: {
                contentType: "text/html; charset=UTF-8",
                status: 404,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = await lclient.moveFile("from", "to");
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }
        expect(q).to.be.equal(undefined);
    });

    it("64 response without content type and body", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "",
                method: "",
                url: "",
            },
            response: {
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal("Response content type expected");
        }

    });

    it("65 expect xml content type", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "",
                method: "",
                url: "",
            },
            response: {
                body: "body",
                contentType: "text/plain",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal("XML response content type expected");
        }

    });

    it("66 invalid xml response", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "",
                method: "",
                url: "",
            },
            response: {
                body: "NO XML",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal("The response is not valid XML: NO XML");
        }

    });

    it("67 multistatus response without href", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "",
                method: "",
                url: "",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\"    xmlns:s=\"http://sabredav.org/ns\"     xmlns:oc=\"http://owncloud.org/ns\"     xmlns:nc=\"http://nextcloud.org/ns\">    <d:response>        <d:NOhref>/remote.php/webdav/</d:NOhref>        <d:propstat>            <d:prop>                <d:getlastmodified>Sat, 28 Dec 2019 18:31:47 GMT</d:getlastmodified>               <d:resourcetype>                    <d:collection/>                </d:resourcetype>                <d:quota-used-bytes>5030985306</d:quota-used-bytes>                <d:quota-available-bytes>-3</d:quota-available-bytes>                <d:getetag>&quot;5e079f93da21b&quot;</d:getetag>            </d:prop>            <d:status>HTTP/1.1 200 OK</d:status>        </d:propstat>    </d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal("The mulitstatus response must have a href");
        }

    });

    it("68 multistatus response without prostat", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "",
                method: "",
                url: "",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\"    xmlns:s=\"http://sabredav.org/ns\"     xmlns:oc=\"http://owncloud.org/ns\"     xmlns:nc=\"http://nextcloud.org/ns\">    <d:response>        <d:href>/remote.php/webdav/</d:href>        <d:NOpropstat>            <d:prop>                <d:getlastmodified>Sat, 28 Dec 2019 18:31:47 GMT</d:getlastmodified>               <d:resourcetype>                    <d:collection/>                </d:resourcetype>                <d:quota-used-bytes>5030985306</d:quota-used-bytes>                <d:quota-available-bytes>-3</d:quota-available-bytes>                <d:getetag>&quot;5e079f93da21b&quot;</d:getetag>            </d:prop>            <d:status>HTTP/1.1 200 OK</d:status>        </d:NOpropstat>    </d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal(`The mulitstatus response must have a "propstat" container`);
        }

    });

    it("69 multistatus response without prostat status", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "",
                method: "",
                url: "",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\"    xmlns:s=\"http://sabredav.org/ns\"     xmlns:oc=\"http://owncloud.org/ns\"     xmlns:nc=\"http://nextcloud.org/ns\">    <d:response>        <d:href>/remote.php/webdav/</d:href>        <d:propstat>            <d:prop>                <d:getlastmodified>Sat, 28 Dec 2019 18:31:47 GMT</d:getlastmodified>               <d:resourcetype>                    <d:collection/>                </d:resourcetype>                <d:quota-used-bytes>5030985306</d:quota-used-bytes>                <d:quota-available-bytes>-3</d:quota-available-bytes>                <d:getetag>&quot;5e079f93da21b&quot;</d:getetag>            </d:prop>            <d:NOstatus>HTTP/1.1 200 OK</d:NOstatus>        </d:propstat>    </d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal(`The propstat must have a "status"`);
        }

    });

    it("70 multistatus response without prostat property", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "",
                method: "",
                url: "",
            },
            response: {
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\"    xmlns:s=\"http://sabredav.org/ns\"     xmlns:oc=\"http://owncloud.org/ns\"     xmlns:nc=\"http://nextcloud.org/ns\">    <d:response>        <d:href>/remote.php/webdav/</d:href>        <d:propstat>            <d:NOprop>                <d:getlastmodified>Sat, 28 Dec 2019 18:31:47 GMT</d:getlastmodified>               <d:resourcetype>                    <d:collection/>                </d:resourcetype>                <d:quota-used-bytes>5030985306</d:quota-used-bytes>                <d:quota-available-bytes>-3</d:quota-available-bytes>                <d:getetag>&quot;5e079f93da21b&quot;</d:getetag>            </d:NOprop>            <d:status>HTTP/1.1 200 OK</d:status>        </d:propstat>    </d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getQuota();
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal(`The propstat must have a "prop"`);
        }

    });

    it("71 propfind without properties", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "",
                method: "",
                url: "",
            },
            response: {
                // body has no properties
                body: "<?xml version=\"1.0\"?>\n<d:multistatus xmlns:d=\"DAV:\"    xmlns:s=\"http://sabredav.org/ns\"     xmlns:oc=\"http://owncloud.org/ns\"     xmlns:nc=\"http://nextcloud.org/ns\">    <d:response>        <d:href>/remote.php/webdav/</d:href>        <d:propstat>            <d:prop>                <d:getlastmodified>Sat, 28 Dec 2019 18:31:47 GMT</d:getlastmodified>               <d:resourcetype>                    <d:collection/>                </d:resourcetype>                <d:quota-used-bytes>5030985306</d:quota-used-bytes>                <d:quota-available-bytes>-3</d:quota-available-bytes>                <d:getetag>&quot;5e079f93da21b&quot;</d:getetag>            </d:prop>            <d:status>NOHTTP/1.1 200 OK</d:status>        </d:propstat>    </d:response></d:multistatus>",
                contentType: "application/xml; charset=utf-8",
                status: 207,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.getFolder("ThisFolderDoesNotExists");
            // returns null
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal(`no exception expected"`);
        }

    });

    it("72 create file fails", async () => {

        const entries: RequestResponseLogEntry[] = [];
        // save content
        entries.push({
            request: {
                description: "File save content",
                method: "PUT",
                url: "/remote.php/webdav/file72.txt",
            },
            response: {
                contentType: "text/html; charset=UTF-8",
                status: 201,
            },
        });
        // file not available
        entries.push({
            request: {
                description: "File/Folder get details",
                method: "PROPFIND",
                url: "/remote.php/webdav/file72.txt",
            },
            response: {
                contentType: "text/html; charset=UTF-8",
                status: 404,
            },
        });

        let errorOccurred;
        const fileName = "/file72.txt";

        let file: File | null = null;
        const lclient: Client = new Client(new FakeServer(entries));
        try {
            file = await lclient.createFile(fileName, Buffer.from("this is a test text"));
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
            expect(e.message, "expect no exception").to.be.equal(`Error creating file, file name "/file72.txt"`);
        }
        //  expect(errorOccurred, "expect no exception").to.be.equal(false);

    });

    it("73 access propertries of a deleted file should fail", async () => {

        const dirName = "/test/fileDelete73";
        const fileName1 = "file1.txt";

        const baseDir = await client.createFolder(dirName);
        await baseDir.createFile(fileName1, Buffer.from("File 1"));

        const file: File | null = await client.getFile(dirName + "/" + fileName1);

        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(File);

        await file!.delete();
        const arr: any[] = [];
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file!.baseName);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file!.name);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file!.id);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file!.lastmod);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file!.mime);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file!.size);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        expect(arr.length, "expect that no property is accessible").to.be.equal(0);
        await baseDir.delete();
    });

    it("74 access propertries of a deleted folder should fail", async () => {

        const dirName = "/test/fileDelete74";

        const baseDir = await client.createFolder(dirName);

        await baseDir.delete();
        const arr: any[] = [];
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(baseDir.baseName);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(baseDir.name);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(baseDir.id);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(baseDir.lastmod);
            // tslint:disable-next-line:no-empty
        } catch (e) { }

        expect(arr.length, "expect that no property is accessible").to.be.equal(0);
        await baseDir.delete();
    });

    it("75 move file fails", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "File move",
                method: "MOVE",
                url: "/remote.php/webdav/test/renameFile75/sourceFile.txt",
            },
            response: {
                contentType: "text/html; charset=UTF-8",
                status: 500,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let q;
        try {
            q = await lclient.moveFile("from", "to");
        } catch (e) {
            expect(true, "expect an exception").to.be.equal(true);
        }
        expect(q).to.be.equal(undefined);
    });

    it("76 create client with url ending with slash", async () => {
        const restore = mockedEnv({
            NEXTCLOUD_URL: "https://server.com/",
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        let error: Error | null = null;
        let o: any;
        try {
            // tslint:disable-next-line:no-unused-expression
            const c: Client = new Client();
            o = JSON.parse(JSON.stringify(c));
            // console.log(o);
        } catch (e) {
            error = e;
        } finally {
            restore();
        }

        expect(error,).to.be.equal(null);
        expect(o.nextcloudOrigin).to.be.equal("https://server.com");
    });

    it("77 create client with url not ending with slash", async () => {
        const restore = mockedEnv({
            NEXTCLOUD_URL: "https://server.com",
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        let error: Error | null = null;
        let o: any;
        try {
            // tslint:disable-next-line:no-unused-expression
            const c: Client = new Client();
            o = JSON.parse(JSON.stringify(c));
            // console.log(o);
        } catch (e) {
            error = e;
        } finally {
            restore();
        }

        expect(error,).to.be.equal(null);
        expect(o.nextcloudOrigin).to.be.equal("https://server.com");
    });

    it("78 create client with WebDAV url not ending with slash", async () => {
        const restore = mockedEnv({
            NEXTCLOUD_URL: "https://server.com/remote.php/webdav",
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        let error: Error | null = null;
        let o: any;
        try {
            // tslint:disable-next-line:no-unused-expression
            const c: Client = new Client();
            o = JSON.parse(JSON.stringify(c));
            // console.log(o);
        } catch (e) {
            error = e;
        } finally {
            restore();
        }

        expect(error,).to.be.equal(null);
        expect(o.nextcloudOrigin).to.be.equal("https://server.com");
    });

    it("79 create client with WebDAV url ending with slash", async () => {
        const restore = mockedEnv({
            NEXTCLOUD_URL: "https://server.com/remote.php/webdav/",
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        let error: Error | null = null;
        let o: any;
        try {
            // tslint:disable-next-line:no-unused-expression
            const c: Client = new Client();
            o = JSON.parse(JSON.stringify(c));
            // console.log(o);
        } catch (e) {
            error = e;
        } finally {
            restore();
        }

        expect(error,).to.be.equal(null);
        expect(o.nextcloudOrigin).to.be.equal("https://server.com");
    });

    it("99 delete folder", async () => {

        const dirName = "/test";

        let baseDir: Folder | null = await client.createFolder(dirName);
        if (baseDir) {
            await baseDir.delete();
        }
        baseDir = await client.getFolder(dirName);
        expect(baseDir, "expect folder to be null").to.be.equal(null);
    });
});

