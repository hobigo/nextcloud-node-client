import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    NCClient,
    NCFile,
    NCFolder,
} from "../ncClient";
import { getNextcloudClient } from "./testUtils";

let client: NCClient;

// tslint:disable-next-line:only-arrow-functions
describe("03-NEXCLOUD-NODE-CLIENT-COMMENT", function () {
    this.timeout(1 * 60 * 1000);

    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    it("01 add comment to file", async () => {
        let errorOccurred;
        const fileName = "/test/comments/fileComments.txt";

        let file: NCFile | null = null;

        try {
            file = await client.createFile(fileName, Buffer.from("file with comments"));
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(errorOccurred, "expect no exception").to.be.equal(false);
        expect(file, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFile);

        if (file) {
            try {
                await file.addComment("C1");
                await file.addComment("C2");
                await file.addComment("C3");
                await file.addComment("C4");

            } catch (e) {
                expect(e.message, "expect no exception").to.be.equal("");
            }

            try {
                const comments = await file.getComments(1, 1);
                expect(comments[0]).to.be.equal("C3");
            } catch (e) {
                expect(e.message, "expect no exception").to.be.equal("");
            }
        }
    });

    it("02 add comment to folder", async () => {

        let errorOccurred;
        const folderName = "/test/folder/comments";

        let folder: NCFolder | null = null;

        try {
            folder = await client.createFolder(folderName);
            errorOccurred = false;
        } catch (e) {
            errorOccurred = true;
        }

        expect(errorOccurred, "expect no exception").to.be.equal(false);
        expect(folder, "expect file to a object").to.be.a("object").that.is.instanceOf(NCFolder);

        if (folder) {
            try {
                await folder.addComment("C1");
                await folder.addComment("C2");
                await folder.addComment("C3");
                await folder.addComment("C4");

            } catch (e) {
                expect(e.message, "expect no exception").to.be.equal("");
            }

            try {
                const comments = await folder.getComments(1, 1);
                expect(comments[0]).to.be.equal("C3");
            } catch (e) {
                expect(e.message, "expect no exception").to.be.equal("");
            }

            try {
                const comments = await folder.getComments();
                expect(comments[0]).to.be.equal("C4");
            } catch (e) {
                expect(e.message, "expect no exception").to.be.equal("");
            }
            await folder.delete();
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
