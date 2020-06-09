
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import FileSizeFormatter from "../fileSizeFormatter";


// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("21-NEXCLOUD-NODE-CLIENT-FILE-SIZE-FORMATTER", () => {
    it("01 byte file size", async () => {
        const fsm: FileSizeFormatter = new FileSizeFormatter(2);
        expect(fsm.getUserFriendlyFileSize()).to.be.equal("2 B");
    });
    it("02 kilo byte file size", async () => {
        const fsm: FileSizeFormatter = new FileSizeFormatter(1024 + 2);
        expect(fsm.getUserFriendlyFileSize()).to.be.equal("1 kB");
    });
    it("03 mega byte file size", async () => {
        const fsm: FileSizeFormatter = new FileSizeFormatter(4 * 1024 * 1024 + 200);
        expect(fsm.getUserFriendlyFileSize()).to.be.equal("4 MB");
    });
    it("04 giga byte file size", async () => {
        const fsm: FileSizeFormatter = new FileSizeFormatter(40 * 1024 * 1024 * 1024 + 200 * 1024 * 1024);
        expect(fsm.getUserFriendlyFileSize()).to.be.equal("40 GB");
    });
});
