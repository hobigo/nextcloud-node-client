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
require("mocha");
const logger_1 = __importDefault(require("../logger"));
const mocked_env_1 = __importDefault(require("mocked-env"));
describe("32-NEXCLOUD-NODE-CLIENT-LOGGER", function () {
    this.timeout(1 * 60 * 1000);
    it("01 Logger", () => __awaiter(this, void 0, void 0, function* () {
        // only for code coverage
        let restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: ""
        });
        let log = new logger_1.default();
        log.silly("silly");
        log.trace("trace");
        log.debug("debug");
        log.info("info");
        log.warn("warn");
        log.error("error");
        log.fatal("fatal");
        restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: "xxx"
        });
        log = new logger_1.default();
        restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: "silly"
        });
        log = new logger_1.default();
        restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: "trace"
        });
        log = new logger_1.default();
        restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: "debug"
        });
        log = new logger_1.default();
        restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: "info"
        });
        log = new logger_1.default();
        restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: "warn"
        });
        log = new logger_1.default();
        restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: "error"
        });
        log = new logger_1.default();
        restore = (0, mocked_env_1.default)({
            MIN_LOG_LEVEL: "fatal"
        });
        log = new logger_1.default();
        restore();
    }));
});
