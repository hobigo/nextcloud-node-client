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
const fileSystemFolder_1 = __importDefault(require("../fileSystemFolder"));
// tslint:disable-next-line:only-arrow-functions
describe("31-NEXCLOUD-NODE-FILE-SYSTEM-FOLDER", function () {
    it("01 get files of file system folder", () => __awaiter(this, void 0, void 0, function* () {
        const folderName = "./src";
        const fsf = new fileSystemFolder_1.default(folderName);
        fsf.getName();
        const fileNames = yield fsf.getFileNames();
        // tslint:disable-next-line:no-console
        // console.log(fileNames);
        (0, chai_1.expect)(fileNames).to.be.an("array");
        (0, chai_1.expect)(fileNames.length).to.be.greaterThan(1);
    }));
});
