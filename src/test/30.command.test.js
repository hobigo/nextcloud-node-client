"use strict";
// nextcloud-node-client command tests
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
const chai_1 = require("chai");
require("mocha");
const client_1 = require("../client");
const testUtils_1 = require("./testUtils");
const getFilesRecursivelyCommand_1 = __importDefault(require("../command/getFilesRecursivelyCommand"));
let client;
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("30-NEXCLOUD-NODE-COMMAND", function () {
    // tslint:disable-next-line:space-before-function-paren
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest && this.currentTest.parent) {
                client = yield (0, testUtils_1.getNextcloudClient)(this.currentTest.parent.title + "/" + this.currentTest.title);
            }
        });
    });
    this.timeout(1 * 60 * 10000);
    it("01 execute upload folder command", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFolderName = "./src/test/data/Borstenson";
        const targetFolderName = "/test/30/02/uploadFilesCommand";
        const fsf = new client_1.FileSystemFolder(sourceFolderName);
        const folderFileNames = yield fsf.getFileNames();
        const getTargetFileNameBeforeUpload = (fileNames) => { return `${targetFolderName}${fileNames.targetFileName}`; };
        const options = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc = new client_1.UploadFolderCommand(client, options);
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        (0, chai_1.expect)(uc.getResultMetaData().messages.length, "result should contain messages").to.be.greaterThan(0);
        (0, chai_1.expect)(uc.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.success);
        const bytesUploaded = uc.getBytesUploaded();
        (0, chai_1.expect)(bytesUploaded, "expect a certain number of bytesUploaded").to.be.greaterThan(3000000);
    }));
    it("02 execute upload files command", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFolderName = "./src/test/data/Borstenson";
        const targetFolderName = "/test/30/02/uploadFilesCommand";
        const fsf = new client_1.FileSystemFolder(sourceFolderName);
        const fileNames = yield fsf.getFileNames();
        const files = [];
        for (const fileNameFormat of fileNames) {
            files.push({ sourceFileName: fileNameFormat.absolute, targetFileName: `${targetFolderName}${fileNameFormat.relative}` });
        }
        const options = { files };
        const uc = new client_1.UploadFilesCommand(client, options);
        // console.log(files);
        // do not place an await here
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        (0, chai_1.expect)(uc.getResultMetaData().messages.length, "result should contain messages").to.be.greaterThan(0);
        (0, chai_1.expect)(uc.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.success);
    }));
    it("03 execute upload files command fails with invalid source file name", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFileName = "./does/not/exist.txt";
        const targetFileName = "/test/30/03/uploadFilesCommand";
        const files = [];
        files.push({ sourceFileName, targetFileName });
        const options = { files };
        const uc = new client_1.UploadFilesCommand(client, options);
        //        console.log(files);
        // do not place an await here
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        let alreadyCalled = false;
        while (uc.isFinished() !== true) {
            // only for code coverage
            // if command is running this should not have an effect
            if (!alreadyCalled) {
                uc.execute();
                alreadyCalled = true;
            }
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain an error").to.be.equal(1);
        (0, chai_1.expect)(uc.getStatus(), "command should fail").to.be.equal(client_1.CommandStatus.failed);
    }));
    it("04 execute upload files command fails with invalid target file name", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFileName = "./src/test/data/Borstenson/Company/Borstenson Company Profile.pdf";
        const targetFileName = " ";
        const files = [];
        files.push({ sourceFileName, targetFileName });
        const options = { files };
        const uc = new client_1.UploadFilesCommand(client, options);
        //        console.log(files);
        // do not place an await here
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain an error").to.be.equal(1);
        (0, chai_1.expect)(uc.getStatus(), "command should fail").to.be.equal(client_1.CommandStatus.failed);
    }));
    it("05 execute upload files command with file processing callback after upload", () => __awaiter(this, void 0, void 0, function* () {
        const baseName = "Borstenson Company Profile.pdf";
        const sourceFileName = "./src/test/data/Borstenson/Company/" + baseName;
        const targetFileName = "/test/30/05/uploadFilesCommand/" + baseName;
        const processFileAfterUpload = (file) => __awaiter(this, void 0, void 0, function* () {
            (0, chai_1.expect)(file.baseName).to.be.equal(baseName);
        });
        const files = [];
        files.push({ sourceFileName, targetFileName });
        const options = { files, processFileAfterUpload };
        const uc = new client_1.UploadFilesCommand(client, options);
        //        console.log(files);
        // do not place an await here
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        (0, chai_1.expect)(uc.getResultMetaData().messages.length, "result should contain one message").to.be.equal(1);
        (0, chai_1.expect)(uc.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.success);
    }));
    it("06 execute upload files command should fail in callback function", () => __awaiter(this, void 0, void 0, function* () {
        const baseName = "Borstenson Company Profile.pdf";
        const sourceFileName = "./src/test/data/Borstenson/Company/" + baseName;
        const targetFileName = "/test/30/06/uploadFilesCommand/" + baseName;
        const errorMessage = "This is an error messsage";
        const processFileAfterUpload = (file) => __awaiter(this, void 0, void 0, function* () {
            throw new Error(errorMessage);
        });
        const files = [];
        files.push({ sourceFileName, targetFileName });
        const options = { files, processFileAfterUpload };
        const uc = new client_1.UploadFilesCommand(client, options);
        //        console.log(files);
        // do not place an await here
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain one error").to.be.equal(1);
        (0, chai_1.expect)(uc.getResultMetaData().errors[0]).to.be.equal(errorMessage);
        (0, chai_1.expect)(uc.getStatus(), "command should be fail").to.be.equal(client_1.CommandStatus.failed);
    }));
    it("07 execute upload folder command with default target file name processing", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFolderName = "./src/test/data/Borstenson";
        const targetFolderName = "/test/30/07/uploadFilesCommand";
        const fsf = new client_1.FileSystemFolder(sourceFolderName);
        const folderFileNames = yield fsf.getFileNames();
        const options = { folderName: sourceFolderName };
        const uc = new client_1.UploadFolderCommand(client, options);
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        (0, chai_1.expect)(uc.getResultMetaData().messages.length, "result should contain messages").to.be.greaterThan(0);
        (0, chai_1.expect)(uc.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.success);
    }));
    it("08 execute upload folder command filtering all target names", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFolderName = "./src/test/data/Borstenson";
        const targetFolderName = "/test/30/08/uploadFilesCommand";
        const fsf = new client_1.FileSystemFolder(sourceFolderName);
        const folderFileNames = yield fsf.getFileNames();
        const getTargetFileNameBeforeUpload = (fileNames) => { return ""; };
        const options = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc = new client_1.UploadFolderCommand(client, options);
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        (0, chai_1.expect)(uc.getResultMetaData().messages.length, "result should contain messages").to.be.equal(0);
        (0, chai_1.expect)(uc.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.success);
    }));
    it("09 execute upload folder command with non exisiting folder", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFolderName = "./this/folder/does/not/exist";
        const targetFolderName = "/test/30/09/uploadFolderCommand";
        const options = { folderName: sourceFolderName };
        const uc = new client_1.UploadFolderCommand(client, options);
        uc.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        (0, chai_1.expect)(uc.getResultMetaData().errors.length, "result should contain one error").to.be.equal(1);
        (0, chai_1.expect)(uc.getResultMetaData().messages.length, "result should contain messages").to.be.equal(0);
        (0, chai_1.expect)(uc.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.failed);
    }));
    it("10 get files recursively", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFolderName = "./src/test/data/Borstenson";
        const targetFolderName = "/test/30/10/GetFilesRecursivelyCommand";
        let sourceFolder = yield client.getFolder(targetFolderName);
        if (sourceFolder) {
            yield sourceFolder.delete();
        }
        // create the test files first
        const getTargetFileNameBeforeUpload = (fileNames) => { return `${targetFolderName}${fileNames.targetFileName}`; };
        const ucfOptions = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc = new client_1.UploadFolderCommand(client, ucfOptions);
        yield uc.execute();
        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(uc.getResultMetaData()));
        // const sourceFolder: Folder = await client.getRootFolder();
        sourceFolder = yield client.getFolder(targetFolderName);
        (0, chai_1.expect)(sourceFolder).not.to.be.equal(null);
        const options = { sourceFolder: sourceFolder };
        const command = new getFilesRecursivelyCommand_1.default(client, options);
        command.execute();
        function sleep(seconds) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, seconds * 1000));
            });
        }
        while (command.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(command.getPercentCompleted() + "%");
            yield sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(command.getResult()));
        (0, chai_1.expect)(command.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        (0, chai_1.expect)(command.getResultMetaData().messages.length, "result should contain messages").to.be.equal(1);
        (0, chai_1.expect)(command.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.success);
        const files = command.getFiles();
        (0, chai_1.expect)(files.length).to.be.equal(14);
        // codecoverage check double execution
        let error = null;
        try {
            yield command.execute();
        }
        catch (e) {
            error = e;
        }
        (0, chai_1.expect)(error, "it should not be possible to execute a command again").to.be.instanceOf(client_1.CommandAlreadyExecutedError);
        // check filter function
        const fileFilterFunction = (file) => {
            if (file.mime === "application/pdf") {
                return file;
            }
            if (file.mime === "image/jpeg") {
                return file;
            }
            return null;
        };
        const options2 = {
            sourceFolder: sourceFolder,
            filterFile: fileFilterFunction,
        };
        const command2 = new getFilesRecursivelyCommand_1.default(client, options2);
        yield command2.execute();
        const filteredFiles = command2.getFiles();
        // 2xpdf and 1xjpg
        (0, chai_1.expect)(filteredFiles.length, "expect the number of filtered files is 3").to.be.equal(3);
        // delete files
        yield sourceFolder.delete();
    }));
    it("11 get files recursively fails", () => __awaiter(this, void 0, void 0, function* () {
        const notARealFolder = {};
        // this line will cause the error
        const options = { sourceFolder: notARealFolder };
        const command = new getFilesRecursivelyCommand_1.default(client, options);
        yield command.execute();
        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(command.getResultMetaData()));
        (0, chai_1.expect)(command.getResultMetaData().errors.length, "result should contain an error").to.be.equal(1);
        (0, chai_1.expect)(command.getResultMetaData().messages.length, "result should contain no messages").to.be.equal(0);
        (0, chai_1.expect)(command.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.failed);
    }));
    it("12 download files recursively", () => __awaiter(this, void 0, void 0, function* () {
        const sourceFolderName = "./src/test/data/Borstenson";
        const targetFolderName = "/test/30/12/DownloadFilesRecursivelyCommand";
        let sourceFolder = yield client.getFolder(targetFolderName);
        if (sourceFolder) {
            yield sourceFolder.delete();
        }
        // create the test files first
        const getTargetFileNameBeforeUpload = (fileNames) => { return `${targetFolderName}${fileNames.targetFileName}`; };
        const ucfOptions = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc = new client_1.UploadFolderCommand(client, ucfOptions);
        yield uc.execute();
        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(uc.getResultMetaData()));
        // const sourceFolder: Folder = await client.getRootFolder();
        sourceFolder = yield client.getFolder(targetFolderName);
        (0, chai_1.expect)(sourceFolder).not.to.be.equal(null);
        // check filter function
        const fileFilterFunction = (file) => {
            if (file.mime === "application/pdf" || file.mime === "image/jpeg") {
                return file;
            }
            return null;
        };
        const options = {
            sourceFolder: sourceFolder,
            filterFile: fileFilterFunction,
            getTargetFileNameBeforeDownload: (fileNames) => { return "./tmp/" + fileNames.targetFileName; }
        };
        const command = new client_1.DownloadFolderCommand(client, options);
        command.execute();
        while (command.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(command.getPercentCompleted() + " %");
            yield (() => __awaiter(this, void 0, void 0, function* () { return new Promise(resolve => setTimeout(resolve, 100)); }))();
        }
        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(command.getResultMetaData()));
        (0, chai_1.expect)(command.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        (0, chai_1.expect)(command.getResultMetaData().messages.length, "result should contain messages").to.be.equal(1);
        (0, chai_1.expect)(command.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.success);
        (0, chai_1.expect)(command.getBytesDownloaded()).to.be.greaterThan(100);
        // check if error handling works
        const options2 = {
            sourceFolder: sourceFolder,
            filterFile: fileFilterFunction,
            getTargetFileNameBeforeDownload: (fileNames) => "tt:/\0/invalid filename/" + fileNames.targetFileName
        };
        const command2 = new client_1.DownloadFolderCommand(client, options2);
        yield command2.execute();
        (0, chai_1.expect)(command2.getResultMetaData().errors.length, "result should contain errors").to.be.equal(1);
        (0, chai_1.expect)(command2.getResultMetaData().messages.length, "result should contain no messages").to.be.equal(0);
        (0, chai_1.expect)(command2.getStatus(), "command should be successfull").to.be.equal(client_1.CommandStatus.failed);
        // console.log(command2.getResultMetaData().errors);
        // delete files
        yield sourceFolder.delete();
    }));
});
