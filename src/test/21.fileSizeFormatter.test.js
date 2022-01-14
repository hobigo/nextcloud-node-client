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
const chai_1 = require("chai");
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
require("mocha");
const fileSizeFormatter_1 = __importDefault(require("../fileSizeFormatter"));
// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("21-NEXCLOUD-NODE-CLIENT-FILE-SIZE-FORMATTER", () => {
    it("01 byte file size", () => __awaiter(void 0, void 0, void 0, function* () {
        const fsm = new fileSizeFormatter_1.default(2);
        (0, chai_1.expect)(fsm.getUserFriendlyFileSize()).to.be.equal("2 B");
    }));
    it("02 kilo byte file size", () => __awaiter(void 0, void 0, void 0, function* () {
        const fsm = new fileSizeFormatter_1.default(1024 + 2);
        (0, chai_1.expect)(fsm.getUserFriendlyFileSize()).to.be.equal("1 kB");
    }));
    it("03 mega byte file size", () => __awaiter(void 0, void 0, void 0, function* () {
        const fsm = new fileSizeFormatter_1.default(4 * 1024 * 1024 + 200);
        (0, chai_1.expect)(fsm.getUserFriendlyFileSize()).to.be.equal("4 MB");
    }));
    it("04 giga byte file size", () => __awaiter(void 0, void 0, void 0, function* () {
        const fsm = new fileSizeFormatter_1.default(40 * 1024 * 1024 * 1024 + 200 * 1024 * 1024);
        (0, chai_1.expect)(fsm.getUserFriendlyFileSize()).to.be.equal("40 GB");
    }));
});
