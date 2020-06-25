
import { expect, use } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import FileSystemFolder, { IFileNameFormats } from "../fileSystemFolder";

// tslint:disable-next-line:only-arrow-functions
describe("31-NEXCLOUD-NODE-FILE-SYSTEM-FOLDER", function () {

    it("01 get files of file system folder", async () => {

        const folderName: string = "./src";
        const fsf: FileSystemFolder = new FileSystemFolder(folderName);
        fsf.getName();
        const fileNames: IFileNameFormats[] = await fsf.getFileNames();

        // tslint:disable-next-line:no-console
        console.log(fileNames);

        expect(fileNames).to.be.an("array");
        expect(fileNames.length).to.be.greaterThan(1);

    });

});
