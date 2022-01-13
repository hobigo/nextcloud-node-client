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
// this must be the first
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const chai_1 = require("chai");
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
require("mocha");
const mocked_env_1 = __importDefault(require("mocked-env"));
const client_1 = require("../client");
const environment_1 = __importDefault(require("../environment"));
const environmentVcapServices_1 = __importDefault(require("../environmentVcapServices"));
const server_1 = __importDefault(require("../server"));
const testUtils_1 = require("./testUtils");
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("01-NEXCLOUD-NODE-CLIENT", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 1000);
    it("01 create client fails", () => __awaiter(this, void 0, void 0, function* () {
        const restore = (0, mocked_env_1.default)({
            NEXTCLOUD_URL: undefined,
            VCAP_SERVICES: undefined,
        });
        try {
            // tslint:disable-next-line:no-unused-expression
            new client_1.Client();
            (0, chai_1.expect)(false, "expect an exception").to.be.equal(true);
        }
        catch (e) {
            // should fail, if env is not set correctly
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_NEXTCLOUD_URL_NOT_DEFINED");
        }
        finally {
            restore();
        }
    }));
    it("02 create client success", () => __awaiter(this, void 0, void 0, function* () {
        const restore = (0, mocked_env_1.default)({
            NEXTCLOUD_URL: undefined,
            VCAP_SERVICES: JSON.stringify({
                "user-provided": [{
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
            new client_1.Client();
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal("expect no exception");
        }
        finally {
            restore();
        }
    }));
    it("03 get and create folder", () => __awaiter(this, void 0, void 0, function* () {
        let errorOccurred;
        let folder = null;
        const dirName = "/test/a/b/c/d/xx";
        folder = yield client.createFolder(dirName);
        try {
            folder = yield client.getFolder(dirName);
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(folder, "expect folder to a object").to.be.a("object");
        (0, chai_1.expect)(folder, "expect folder to be a Folder").to.be.instanceOf(client_1.Folder);
    }));
    it("04 delete folder", () => __awaiter(this, void 0, void 0, function* () {
        let errorOccurred;
        let folder = null;
        const dirName = "/test/deleteme";
        try {
            folder = yield client.createFolder(dirName);
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(folder, "expect folder to an object").to.be.a("object");
        (0, chai_1.expect)(folder, "expect folder to be a Folder").to.be.instanceOf(client_1.Folder);
        try {
            folder = yield client.getFolder(dirName);
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(folder, "expect folder to an object").to.be.a("object");
        (0, chai_1.expect)(folder, "expect folder to be a Folder").to.be.instanceOf(client_1.Folder);
        let deleteResponse;
        try {
            deleteResponse = yield client.deleteFolder(dirName);
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        try {
            folder = yield client.getFolder(dirName);
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(folder, "expect folder to null").to.be.equal(null);
    }));
    it("05 get root folder", () => __awaiter(this, void 0, void 0, function* () {
        let errorOccurred;
        let folder = null;
        const dirName = "";
        folder = yield client.createFolder(dirName);
        try {
            folder = yield client.getFolder(dirName);
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(folder, "expect folder to a object").to.be.a("object");
        (0, chai_1.expect)(folder, "expect folder to be a Folder").to.be.instanceOf(client_1.Folder);
    }));
    it("06 create . folder", () => __awaiter(this, void 0, void 0, function* () {
        let errorOccurred;
        let folder = null;
        const dirName = "/test/aa/..";
        try {
            folder = yield client.createFolder(dirName);
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(folder, "expect folder to a null").to.be.equal(null);
    }));
    it("07 create file", () => __awaiter(this, void 0, void 0, function* () {
        let errorOccurred;
        const fileName = "/test/test07/file1.txt";
        let file = null;
        try {
            file = yield client.createFile(fileName, Buffer.from("this is a test text"));
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
        }
        (0, chai_1.expect)(errorOccurred, "expect no exception").to.be.equal(false);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        // expect(file, "expect file to be a Folder").to.be.instanceOf(File);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object");
        (0, chai_1.expect)(file, "expect file to be a Folder").to.be.instanceOf(client_1.File);
        const folder = yield file.getFolder();
        (0, chai_1.expect)(folder.baseName, "base name of the file folder is 'test07'").to.be.equal("test07");
        yield folder.delete();
        try {
            yield file.getFolder();
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal("Error, the folder of the file does not exist anymore");
        }
    }));
    it("08 get sub directories of non existsing folder", () => __awaiter(this, void 0, void 0, function* () {
        const directories = yield client.getSubFolders("/non/existing/folder");
        (0, chai_1.expect)(directories, "expect directories to be an array").to.be.a("array");
        (0, chai_1.expect)(directories.length, "expect directories to be empty").to.be.equal(0);
    }));
    it("09 get sub directories", () => __awaiter(this, void 0, void 0, function* () {
        const baseName = "/test/base09";
        const subDirName1 = "subdir1";
        const subDirName2 = "subdir2";
        const baseDir = yield client.createFolder(baseName);
        yield client.createFolder(baseName + "/" + subDirName1);
        yield client.createFolder(baseName + "/" + subDirName2);
        const directories = yield client.getSubFolders(baseName);
        (0, chai_1.expect)(directories, "expect directories to be an array").to.be.a("array");
        (0, chai_1.expect)(directories.length, "expect 2 directories:" + JSON.stringify(directories)).to.be.equal(2);
        yield baseDir.delete();
    }));
    it("10 get sub directories with folder object", () => __awaiter(this, void 0, void 0, function* () {
        const baseName = "/test/base10";
        const subDirName1 = "subdir1";
        const subDirName2 = "subdir2";
        const baseDir = yield client.createFolder(baseName);
        yield client.createFolder(baseName + "/" + subDirName1);
        yield client.createFolder(baseName + "/" + subDirName2);
        const directories = yield baseDir.getSubFolders();
        (0, chai_1.expect)(directories, "expect directories to be an array").to.be.a("array");
        (0, chai_1.expect)(directories.length, "expect directories to have 2 sub directories").to.be.equal(2);
        yield baseDir.delete();
    }));
    it("11 get files of an empty folder", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/files/empty";
        const baseDir = yield client.createFolder(dirName);
        const files = yield baseDir.getFiles();
        (0, chai_1.expect)(files, "expect files to be an array").to.be.a("array");
        (0, chai_1.expect)(files.length, "expect files to be empty").to.be.equal(0);
        yield baseDir.delete();
    }));
    it("12 get files of a folder", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/files";
        const fileName1 = "file1.txt";
        const fileName2 = "file2.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        yield baseDir.createFile(fileName2, Buffer.from("File 2"));
        const files = yield baseDir.getFiles();
        (0, chai_1.expect)(files, "expect files to be an array").to.be.a("array");
        (0, chai_1.expect)(files.length, "expect files to be empty").to.be.equal(2);
        yield baseDir.delete();
    }));
    it("13 get file content", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileContent";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        const content = yield file.getContent();
        (0, chai_1.expect)(content.toString(), "expect file content to be 'File 1'").to.be.equal("File 1");
        yield baseDir.delete();
    }));
    it("14 delete file", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileDelete";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        let file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        yield file.delete();
        file = yield baseDir.getFile(fileName1);
        (0, chai_1.expect)(file, "expect file to be null").to.be.equal(null);
        yield baseDir.delete();
    }));
    it("15 get link of file", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileLink";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        const url = file.getUrl();
        (0, chai_1.expect)(url, "expect url to be a string").to.be.a("string");
        (0, chai_1.expect)(url, "expect url to be available").to.be.not.equal("");
    }));
    it("16 get link of folder", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileLink";
        yield client.createFolder(dirName);
        const url = client.getLink(dirName);
        (0, chai_1.expect)(url, "expect url to be a string").to.be.a("string");
        (0, chai_1.expect)(url, "expect url to be available").to.be.not.equal("");
    }));
    it("17 move folder", () => __awaiter(this, void 0, void 0, function* () {
        const sourceDirName = "/test/sourcefolder";
        const targetDirName = "/test/targetFolder";
        const sourceDir = yield client.createFolder(sourceDirName);
        yield sourceDir.move(targetDirName);
        (0, chai_1.expect)(sourceDir.name, "expect that the dirname has changed to the target name").to.be.equal(targetDirName);
    }));
    it("18 move file", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/renameFile";
        const sourceFileName = "sourceFile.txt";
        const targetFileName = dirName + "/targetFile.txt";
        const baseDir = yield client.createFolder(dirName);
        const file = yield baseDir.createFile(sourceFileName, Buffer.from("File"));
        yield file.move(targetFileName);
        (0, chai_1.expect)(file.name, "expect that the filename has changed to the target name").to.be.equal(targetFileName);
    }));
    it("19 get non existing file", () => __awaiter(this, void 0, void 0, function* () {
        const fileName = "/test/doesNotExist.txt";
        const file = yield client.getFile(fileName);
        (0, chai_1.expect)(file, "expect file to be null").to.be.equal(null);
    }));
    it("20 get file id", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/getFileId";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        const id = yield file.id;
        (0, chai_1.expect)(id, "expect id to be a number").to.be.a("number");
        (0, chai_1.expect)(id, "expect id to be not -1").to.be.not.equal(-1);
    }));
    it("21 get folder id", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/getFolderId";
        const baseDir = yield client.createFolder(dirName);
        const id = yield baseDir.id;
        (0, chai_1.expect)(id, "expect id to be a number").to.be.a("number");
        (0, chai_1.expect)(id, "expect id to be not -1").to.be.not.equal(-1);
    }));
    it("22 has subfolders", () => __awaiter(this, void 0, void 0, function* () {
        const parentFolderName = "/test/folderWithSubfolder";
        let subFolderName = "subFolder";
        const parentFolder = yield client.createFolder(parentFolderName);
        const subFolder = yield client.createFolder(parentFolderName + "/" + subFolderName);
        (0, chai_1.expect)(yield parentFolder.hasSubFolder(subFolderName), `Folder should have the subfolder with the name ${subFolderName}`).to.be.equal(true);
        subFolderName = "notASubFolder";
        (0, chai_1.expect)(yield parentFolder.hasSubFolder(subFolderName), `Folder should not have the subfolder with the name ${subFolderName}`).to.be.equal(false);
    }));
    it("23 create client with wrong webdav url", () => __awaiter(this, void 0, void 0, function* () {
        const ncserver = new server_1.default({
            basicAuth: {
                password: "some password",
                username: "some user name",
            },
            url: "https://someServer.com:123",
        });
        try {
            // tslint:disable-next-line:no-unused-expression
            new client_1.Client(ncserver);
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_INVALID_NEXTCLOUD_WEBDAV_URL");
        }
    }));
    it("24 create a client with url ", () => __awaiter(this, void 0, void 0, function* () {
        const ncserver = new server_1.default({
            basicAuth: {
                password: "some password",
                username: "some user name",
            },
            url: "https://someServer.com:123/remote.php/webdav",
        });
        try {
            // tslint:disable-next-line:no-unused-expression
            new client_1.Client(ncserver);
        }
        catch (e) {
            (0, chai_1.expect)(e, "No exception expected").to.be.equal("");
        }
        ncserver.url += "/";
        try {
            // tslint:disable-next-line:no-unused-expression
            new client_1.Client(ncserver);
        }
        catch (e) {
            (0, chai_1.expect)(e, "No exception expected").to.be.equal("");
        }
    }));
    it("25 get file id", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileId";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        const file = yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        if (file) {
            const fileId = yield file.id;
            (0, chai_1.expect)(fileId, "expect fileid to a number").to.be.a("number");
            (0, chai_1.expect)(fileId).not.to.be.equal(-1);
            const url = file.getUrl();
            const fileId2 = yield client.getFileId(url);
            (0, chai_1.expect)(fileId2, "expect fileid to a number").to.be.a("number");
            (0, chai_1.expect)(fileId2).not.to.be.equal(-1);
            yield file.delete();
        }
    }));
    it("26 delete a non existing file by name", () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.deleteFile("fileDoesNotExist.txt");
        }
        catch (e) {
            (0, chai_1.expect)(e, "exception expected").not.to.be.equal("");
        }
    }));
    it("27 try to get a folder with a file name", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/getFolder";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        const file = yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        if (file) {
            const folder = yield client.getFolder(file.name);
            (0, chai_1.expect)(folder, "expect folder to be null").to.be.equal(null);
        }
    }));
    it("28 create folder with '.'", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "./";
        const fileName1 = "file1.txt";
        const file = yield client.createFile(dirName + fileName1, Buffer.from("File 1"));
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        if (file) {
            yield file.delete();
        }
    }));
    it("29 create invalid file", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/getFolder";
        const fileName1 = "fil*e1.txt";
        const baseDir = yield client.createFolder(dirName);
        try {
            // tslint:disable-next-line:no-unused-expression
            yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_INVALID_CHAR_IN_FILE_NAME");
        }
    }));
    it("30 get folder url, UIUrl and id", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/getFolder";
        const baseDir = yield client.createFolder(dirName);
        const url = baseDir.getUrl();
        (0, chai_1.expect)(url).to.be.an("string");
        (0, chai_1.expect)(url).not.to.be.equal("");
        const uiUrl = yield baseDir.getUIUrl();
        (0, chai_1.expect)(uiUrl).to.be.an("string");
        (0, chai_1.expect)(uiUrl).not.to.be.equal("");
        yield baseDir.delete();
        try {
            // tslint:disable-next-line:no-unused-expression
            yield baseDir.id;
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_FOLDER_NOT_EXISTING");
        }
    }));
    it("31 folder contains file test", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/containsFileFolder";
        const fileName1 = "file31.txt";
        const baseDir = yield client.createFolder(dirName);
        const file = yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        (0, chai_1.expect)(yield baseDir.containsFile(fileName1)).to.be.equal(true);
        (0, chai_1.expect)(yield baseDir.containsFile("nonExistingFile.txt")).to.be.equal(false);
        yield baseDir.delete();
    }));
    it("32 file get urls", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileGetUrl";
        const fileName1 = "file32.txt";
        const baseDir = yield client.createFolder(dirName);
        const file = yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        (0, chai_1.expect)(file, "expect file not to be null").to.be.not.equal(null);
        if (file) {
            const url = file.getUrl();
            (0, chai_1.expect)(url).to.be.an("string");
            (0, chai_1.expect)(url).not.to.be.equal("");
            const uiUrl = yield file.getUIUrl();
            (0, chai_1.expect)(uiUrl).to.be.an("string");
            (0, chai_1.expect)(uiUrl).not.to.be.equal("");
            yield file.delete();
            try {
                // tslint:disable-next-line:no-unused-expression
                file.id;
            }
            catch (e) {
                (0, chai_1.expect)(e).to.have.property("message");
                (0, chai_1.expect)(e).to.have.property("code");
                (0, chai_1.expect)(e.code).to.be.equal("ERR_FILE_NOT_EXISTING");
            }
        }
        yield baseDir.delete();
    }));
    it("33 create subfolder", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/subfolderTest";
        const baseDir = yield client.createFolder(dirName);
        const subfolderName = "subFolder";
        const subfolder = yield baseDir.createSubFolder("subsubfolder");
        (0, chai_1.expect)(subfolder.name).not.to.be.equal(baseDir.name + "/" + subfolderName);
    }));
    it("34 Get credentials from non existing VCAP_SERVICES environment", () => __awaiter(this, void 0, void 0, function* () {
        let restore = (0, mocked_env_1.default)({
            VCAP_SERVICES: undefined,
        });
        try {
            new environmentVcapServices_1.default("").getServer();
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_VCAP_SERVICES_NOT_FOUND");
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            VCAP_SERVICES: JSON.stringify({
                "user-provided": [{
                        credentials: {},
                        name: "test",
                    }],
            }),
        });
        try {
            new environmentVcapServices_1.default("").getServer();
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_VCAP_SERVICES_NOT_FOUND");
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            VCAP_SERVICES: JSON.stringify({
                "user-provided": [{
                        credentials: {
                            url: "https://some.host-name.com/remote.php/webdav",
                            username: "someUserName",
                        },
                        name: "test",
                    }],
            }),
        });
        try {
            new environmentVcapServices_1.default("").getServer();
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_VCAP_SERVICES_PASSWORD_NOT_DEFINED");
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            VCAP_SERVICES: JSON.stringify({
                "user-provided": [{
                        credentials: {
                            password: "somePassword",
                            url: "https://some.host-name.com/remote.php/webdav",
                        },
                        name: "test",
                    }],
            }),
        });
        try {
            new environmentVcapServices_1.default("").getServer();
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_VCAP_SERVICES_USERNAME_NOT_DEFINED");
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            VCAP_SERVICES: JSON.stringify({
                "user-provided": [{
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
            new environmentVcapServices_1.default("").getServer();
        }
        catch (e) {
            (0, chai_1.expect)(false, "expect no exception: " + e.message).to.be.equal(true);
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            VCAP_SERVICES: JSON.stringify({
                "user-provided": [{
                        credentials: {
                            password: "somePassword",
                            username: "someUserName",
                        },
                        name: "test",
                    }],
            }),
        });
        try {
            new environmentVcapServices_1.default("").getServer();
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_VCAP_SERVICES_URL_NOT_DEFINED");
        }
        finally {
            restore();
        }
    }));
    it("35 Get credentials from non existing environment", () => __awaiter(this, void 0, void 0, function* () {
        let restore = (0, mocked_env_1.default)({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: undefined,
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        try {
            environment_1.default.getNextcloudUrl();
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_NEXTCLOUD_URL_NOT_DEFINED");
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: undefined,
        });
        try {
            environment_1.default.getUserName();
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_NEXTCLOUD_USERNAME_NOT_DEFINED");
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            NEXTCLOUD_PASSWORD: undefined,
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        try {
            environment_1.default.getPassword();
        }
        catch (e) {
            (0, chai_1.expect)(e).to.have.property("message");
            (0, chai_1.expect)(e).to.have.property("code");
            (0, chai_1.expect)(e.code).to.be.equal("ERR_NEXTCLOUD_PASSWORD_NOT_DEFINED");
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        try {
            environment_1.default.getNextcloudUrl();
            environment_1.default.getPassword();
            environment_1.default.getUserName();
        }
        catch (e) {
            (0, chai_1.expect)(false, "do not expect an exception " + e.message).to.be.equal(true);
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
            TEST_RECORDING_ACTIVE: "X",
        });
        try {
            environment_1.default.getNextcloudUrl();
            environment_1.default.getPassword();
            environment_1.default.getUserName();
            environment_1.default.getRecordingActiveIndicator();
        }
        catch (e) {
            (0, chai_1.expect)(false, "do not expect an exception " + e.message).to.be.equal(true);
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
            TEST_RECORDING_ACTIVE: "false",
        });
        try {
            environment_1.default.getNextcloudUrl();
            environment_1.default.getPassword();
            environment_1.default.getUserName();
            environment_1.default.getRecordingActiveIndicator();
        }
        catch (e) {
            (0, chai_1.expect)(false, "do not expect an exception " + e.message).to.be.equal(true);
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
            TEST_RECORDING_ACTIVE: "0",
        });
        try {
            environment_1.default.getNextcloudUrl();
            environment_1.default.getPassword();
            environment_1.default.getUserName();
            environment_1.default.getRecordingActiveIndicator();
        }
        catch (e) {
            (0, chai_1.expect)(false, "do not expect an exception " + e.message).to.be.equal(true);
        }
        finally {
            restore();
        }
        restore = (0, mocked_env_1.default)({
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_URL: "someUrl",
            NEXTCLOUD_USERNAME: "SomeUser",
            TEST_RECORDING_ACTIVE: "inactive",
        });
        try {
            environment_1.default.getNextcloudUrl();
            environment_1.default.getPassword();
            environment_1.default.getUserName();
            environment_1.default.getRecordingActiveIndicator();
        }
        catch (e) {
            (0, chai_1.expect)(false, "do not expect an exception " + e.message).to.be.equal(true);
        }
        finally {
            restore();
        }
    }));
    it("36 get file with folder name", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/folder36";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        // returns null only for coverage
        yield client.getFile(dirName);
        yield baseDir.delete();
    }));
    it("37 get file with incomplete server response", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = yield lclient.getFile("some dummy name");
            // expect(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(e.message);
        }
    }));
    it("38 delete non existing folder", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/deletemeNonExistingFolder";
        try {
            yield client.deleteFolder(dirName);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect folder no exception").to.be.equal(false);
        }
    }));
    it("39 move folder fails", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        let folder;
        try {
            folder = yield lclient.moveFolder(sourceDirName, targetDirName);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
        (0, chai_1.expect)(folder, "expect an folder to be undefined").to.be.equal(undefined);
    }));
    it("40 move folder fails - target folder missing", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        let folder;
        try {
            folder = yield lclient.moveFolder(sourceDirName, targetDirName);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
        (0, chai_1.expect)(folder, "expect an folder to be undefined").to.be.equal(undefined);
    }));
    it("41 get file content should fail", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/folder41";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        const file1 = yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file2 = yield baseDir.getFile(fileName1);
        yield file1.delete();
        try {
            yield (file2 === null || file2 === void 0 ? void 0 : file2.getContent());
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal("HTTP response status 404 not expected. Expected status: 200 - status text: Not Found");
        }
        yield baseDir.delete();
    }));
    it("50 fake server without responses and request without method", () => __awaiter(this, void 0, void 0, function* () {
        const requestInit = {};
        const fs = new client_1.FakeServer([]);
        try {
            yield fs.getFakeHttpResponse("", requestInit, [201], { description: "get response without method" });
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message).to.be.equal("error providing fake http response. No fake response available");
        }
    }));
    it("51 fake server without response content type", () => __awaiter(this, void 0, void 0, function* () {
        const requestInit = {};
        const fs = new client_1.FakeServer([
            {
                request: {
                    description: "description",
                    method: "method",
                    url: "url",
                }, response: { status: 201, body: "body" },
            },
        ]);
        try {
            yield fs.getFakeHttpResponse("", requestInit, [201], { description: "get response without method" });
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect no exception").to.be.equal(e.message);
        }
    }));
    it("60 get file id with missing fileId", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getFileId("some/url");
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
    }));
    it("61 create folder error handling", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.createFolder("/x");
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
    }));
    it("62 move file that does not exist", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/renameFile62";
        const sourceFileName = "sourceFile.txt";
        const targetFileName = dirName + "/targetFile.txt";
        const baseDir = yield client.createFolder(dirName);
        const file = yield baseDir.createFile(sourceFileName, Buffer.from("File"));
        yield file.delete();
        try {
            yield file.move(targetFileName);
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
        yield baseDir.delete();
    }));
    it("63 move file to an unexisting folder", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        // console.log(JSON.stringify(this.tests[0].title, null, 4));
        let q;
        try {
            q = yield lclient.moveFile("from", "to");
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
        (0, chai_1.expect)(q).to.be.equal(undefined);
    }));
    it("64 response without content type and body", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal("Response content type expected");
        }
    }));
    it("65 expect xml content type", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal("XML response content type expected");
        }
    }));
    it("66 invalid xml response", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal("The response is not valid XML: NO XML");
        }
    }));
    it("67 multistatus response without href", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal("The mulitstatus response must have a href");
        }
    }));
    it("68 multistatus response without prostat", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal(`The mulitstatus response must have a "propstat" container`);
        }
    }));
    it("69 multistatus response without prostat status", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal(`The propstat must have a "status"`);
        }
    }));
    it("70 multistatus response without prostat property", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getQuota();
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(false);
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect an exception").to.be.equal(`The propstat must have a "prop"`);
        }
    }));
    it("71 propfind without properties", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            yield lclient.getFolder("ThisFolderDoesNotExists");
            // returns null
        }
        catch (e) {
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal(`no exception expected"`);
        }
    }));
    it("72 create file fails", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        let file = null;
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        try {
            file = yield lclient.createFile(fileName, Buffer.from("this is a test text"));
            errorOccurred = false;
        }
        catch (e) {
            errorOccurred = true;
            (0, chai_1.expect)(e.message, "expect no exception").to.be.equal(`Error creating file, file name "/file72.txt"`);
        }
        //  expect(errorOccurred, "expect no exception").to.be.equal(false);
    }));
    it("73 access propertries of a deleted file should fail", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileDelete73";
        const fileName1 = "file1.txt";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.createFile(fileName1, Buffer.from("File 1"));
        const file = yield client.getFile(dirName + "/" + fileName1);
        (0, chai_1.expect)(file, "expect file to a object").to.be.a("object").that.is.instanceOf(client_1.File);
        yield file.delete();
        const arr = [];
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file.baseName);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file.name);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file.id);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file.lastmod);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file.mime);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(file.size);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        (0, chai_1.expect)(arr.length, "expect that no property is accessible").to.be.equal(0);
        yield baseDir.delete();
    }));
    it("74 access propertries of a deleted folder should fail", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test/fileDelete74";
        const baseDir = yield client.createFolder(dirName);
        yield baseDir.delete();
        const arr = [];
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(baseDir.baseName);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(baseDir.name);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(baseDir.id);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        try {
            // tslint:disable-next-line:no-unused-expression
            arr.push(baseDir.lastmod);
            // tslint:disable-next-line:no-empty
        }
        catch (e) { }
        (0, chai_1.expect)(arr.length, "expect that no property is accessible").to.be.equal(0);
        yield baseDir.delete();
    }));
    it("75 move file fails", () => __awaiter(this, void 0, void 0, function* () {
        const entries = [];
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
        const lclient = new client_1.Client(new client_1.FakeServer(entries));
        let q;
        try {
            q = yield lclient.moveFile("from", "to");
        }
        catch (e) {
            (0, chai_1.expect)(true, "expect an exception").to.be.equal(true);
        }
        (0, chai_1.expect)(q).to.be.equal(undefined);
    }));
    it("76 create client with url ending with slash", () => __awaiter(this, void 0, void 0, function* () {
        const restore = (0, mocked_env_1.default)({
            NEXTCLOUD_URL: "https://server.com/",
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        let error = null;
        let o;
        try {
            // tslint:disable-next-line:no-unused-expression
            const c = new client_1.Client();
            o = JSON.parse(JSON.stringify(c));
            // console.log(o);
        }
        catch (e) {
            error = e;
        }
        finally {
            restore();
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(o.nextcloudOrigin).to.be.equal("https://server.com");
    }));
    it("77 create client with url not ending with slash", () => __awaiter(this, void 0, void 0, function* () {
        const restore = (0, mocked_env_1.default)({
            NEXTCLOUD_URL: "https://server.com",
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        let error = null;
        let o;
        try {
            // tslint:disable-next-line:no-unused-expression
            const c = new client_1.Client();
            o = JSON.parse(JSON.stringify(c));
            // console.log(o);
        }
        catch (e) {
            error = e;
        }
        finally {
            restore();
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(o.nextcloudOrigin).to.be.equal("https://server.com");
    }));
    it("78 create client with WebDAV url not ending with slash", () => __awaiter(this, void 0, void 0, function* () {
        const restore = (0, mocked_env_1.default)({
            NEXTCLOUD_URL: "https://server.com/remote.php/webdav",
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        let error = null;
        let o;
        try {
            // tslint:disable-next-line:no-unused-expression
            const c = new client_1.Client();
            o = JSON.parse(JSON.stringify(c));
            // console.log(o);
        }
        catch (e) {
            error = e;
        }
        finally {
            restore();
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(o.nextcloudOrigin).to.be.equal("https://server.com");
    }));
    it("79 create client with WebDAV url ending with slash", () => __awaiter(this, void 0, void 0, function* () {
        const restore = (0, mocked_env_1.default)({
            NEXTCLOUD_URL: "https://server.com/remote.php/webdav/",
            NEXTCLOUD_PASSWORD: "SomePassword",
            NEXTCLOUD_USERNAME: "SomeUser",
        });
        let error = null;
        let o;
        try {
            // tslint:disable-next-line:no-unused-expression
            const c = new client_1.Client();
            o = JSON.parse(JSON.stringify(c));
            // console.log(o);
        }
        catch (e) {
            error = e;
        }
        finally {
            restore();
        }
        (0, chai_1.expect)(error).to.be.equal(null);
        (0, chai_1.expect)(o.nextcloudOrigin).to.be.equal("https://server.com");
    }));
    it("99 delete folder", () => __awaiter(this, void 0, void 0, function* () {
        const dirName = "/test";
        let baseDir = yield client.createFolder(dirName);
        if (baseDir) {
            yield baseDir.delete();
        }
        baseDir = yield client.getFolder(dirName);
        (0, chai_1.expect)(baseDir, "expect folder to be null").to.be.equal(null);
    }));
});
