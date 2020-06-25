
import { expect, use } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    UploadFilesCommand,
    ISourceTargetFileNames,
    UploadFolderCommand,
    FileSystemFolder,
    IFileNameFormats,
    CommandStatus,
    UploadFilesCommandOptions,
    UploadFolderCommandOptions,
    File,
} from "../client";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe.only("30-NEXCLOUD-NODE-COMMAND", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 10000);

    it("01 execute upload folder command", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/02/uploadFilesCommand";

        const fsf: FileSystemFolder = new FileSystemFolder(sourceFolderName);
        const folderFileNames: IFileNameFormats[] = await fsf.getFileNames();

        const getTargetFileNameBeforeUpload = (fileNames: ISourceTargetFileNames): string => { return `${targetFolderName}${fileNames.targetFileName}` };
        const options: UploadFolderCommandOptions = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, options);
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResult());
        expect(uc.getResult().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResult().messages.length, "result should contain messages").to.be.greaterThan(0)
        expect(uc.getResult().status, "command should be successfull").to.be.equal(CommandStatus.success);

    });

    it("02 execute upload files command", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/02/uploadFilesCommand";
        const fsf: FileSystemFolder = new FileSystemFolder(sourceFolderName);
        const fileNames: IFileNameFormats[] = await fsf.getFileNames();

        const files: ISourceTargetFileNames[] = [];
        for (const fileNameFormat of fileNames) {
            files.push({ sourceFileName: fileNameFormat.absolute, targetFileName: `${targetFolderName}${fileNameFormat.relative}` });
        }
        const options: UploadFilesCommandOptions = { files };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        // console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResult());
        expect(uc.getResult().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResult().messages.length, "result should contain messages").to.be.greaterThan(0)
        expect(uc.getResult().status, "command should be successfull").to.be.equal(CommandStatus.success);

    });

    it("03 execute upload files command fails with invalid source file name", async () => {

        const sourceFileName: string = "./does/not/exist.txt";
        const targetFileName: string = "/test/30/03/uploadFilesCommand";

        const files: ISourceTargetFileNames[] = [];
        files.push({ sourceFileName, targetFileName });

        const options: UploadFilesCommandOptions = { files };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        //        console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResult());

        expect(uc.getResult().errors.length, "result should contain an error").to.be.equal(1);
        expect(uc.getResult().status, "command should fail").to.be.equal(CommandStatus.failed);

    });

    it("04 execute upload files command fails with invalid target file name", async () => {

        const sourceFileName: string = "./src/test/data/Borstenson/Company/Borstenson Company Profile.pdf";
        const targetFileName: string = " ";

        const files: ISourceTargetFileNames[] = [];
        files.push({ sourceFileName, targetFileName });

        const options: UploadFilesCommandOptions = { files };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        //        console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResult());

        expect(uc.getResult().errors.length, "result should contain an error").to.be.equal(1);
        expect(uc.getResult().status, "command should fail").to.be.equal(CommandStatus.failed);

    });

    it("05 execute upload files command with file processing callback after upload", async () => {

        const baseName: string = "Borstenson Company Profile.pdf";
        const sourceFileName: string = "./src/test/data/Borstenson/Company/" + baseName;
        const targetFileName: string = "/test/30/05/uploadFilesCommand/" + baseName;
        const processFileAfterUpload = async (file: File): Promise<void> => {
            expect(file.baseName).to.be.equal(baseName);
        };

        const files: ISourceTargetFileNames[] = [];
        files.push({ sourceFileName, targetFileName });

        const options: UploadFilesCommandOptions = { files, processFileAfterUpload };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        //        console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResult());

        expect(uc.getResult().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResult().messages.length, "result should contain one message").to.be.equal(1);
        expect(uc.getResult().status, "command should be successfull").to.be.equal(CommandStatus.success);

    });

    it("06 execute upload files command should fail in callback function", async () => {

        const baseName: string = "Borstenson Company Profile.pdf";
        const sourceFileName: string = "./src/test/data/Borstenson/Company/" + baseName;
        const targetFileName: string = "/test/30/06/uploadFilesCommand/" + baseName;
        const errorMessage: string = "This is an error messsage";
        const processFileAfterUpload = async (file: File): Promise<void> => {
            throw new Error(errorMessage);
        };

        const files: ISourceTargetFileNames[] = [];
        files.push({ sourceFileName, targetFileName });

        const options: UploadFilesCommandOptions = { files, processFileAfterUpload };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        //        console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResult());

        expect(uc.getResult().errors.length, "result should contain one error").to.be.equal(1);
        expect(uc.getResult().errors[0]).to.be.equal(errorMessage);
        expect(uc.getResult().status, "command should be fail").to.be.equal(CommandStatus.failed);

    });

    it("07 execute upload folder command with default target file name processing", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/07/uploadFilesCommand";

        const fsf: FileSystemFolder = new FileSystemFolder(sourceFolderName);
        const folderFileNames: IFileNameFormats[] = await fsf.getFileNames();
        const options: UploadFolderCommandOptions = { folderName: sourceFolderName };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, options);
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResult());
        expect(uc.getResult().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResult().messages.length, "result should contain messages").to.be.greaterThan(0)
        expect(uc.getResult().status, "command should be successfull").to.be.equal(CommandStatus.success);

    });

    it("08 execute upload folder command filtering all target names", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/08/uploadFilesCommand";

        const fsf: FileSystemFolder = new FileSystemFolder(sourceFolderName);
        const folderFileNames: IFileNameFormats[] = await fsf.getFileNames();

        const getTargetFileNameBeforeUpload = (fileNames: ISourceTargetFileNames): string => { return "" };
        const options: UploadFolderCommandOptions = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, options);
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResult());
        expect(uc.getResult().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResult().messages.length, "result should contain messages").to.be.equal(0)
        expect(uc.getResult().status, "command should be successfull").to.be.equal(CommandStatus.success);

    });


});
