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
exports.getNextcloudClient = exports.recordingModeActive = void 0;
// this must be the first
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const client_1 = __importDefault(require("../client"));
const environment_1 = __importDefault(require("../environment"));
const fakeServer_1 = __importDefault(require("../fakeServer"));
const requestResponseLog_1 = __importDefault(require("../requestResponseLog"));
const server_1 = __importDefault(require("../server"));
const logger_1 = __importDefault(require("../logger"));
const log = new logger_1.default();
const recordingModeActive = () => {
    if (process.argv.find((element) => element === "--record")) {
        return true;
    }
    return false;
};
exports.recordingModeActive = recordingModeActive;
const getNextcloudClient = (context) => __awaiter(void 0, void 0, void 0, function* () {
    const rrLog = requestResponseLog_1.default.getInstance();
    rrLog.baseDirectory = "src/test/recordings/";
    yield rrLog.setContext(context);
    // use command line parameter to override recording settings
    if ((0, exports.recordingModeActive)()) {
        const serverOptions = {
            url: environment_1.default.getNextcloudUrl(),
            basicAuth: {
                username: environment_1.default.getUserName(),
                password: environment_1.default.getPassword(),
            },
            logRequestResponse: environment_1.default.getRecordingActiveIndicator(),
        };
        const ncserver = new server_1.default(serverOptions);
        ncserver.logRequestResponse = true;
        // tslint:disable-next-line:no-console
        log.info("Test recording: " + rrLog.getFileName());
        return new client_1.default(ncserver);
    }
    else {
        let entries;
        try {
            entries = yield rrLog.getEntries();
        }
        catch (e) {
            // throw new Error(`Error: recording does not exist for '${context}' file name; '${rrLog.getFileName()}'`);
            // tslint:disable-next-line:no-console
            // console.log(`recording does not exist for '${context}' file name; '${rrLog.getFileName()}'`);
            entries = [];
        }
        const fncserver = new fakeServer_1.default(entries);
        return new client_1.default(fncserver);
    }
});
exports.getNextcloudClient = getNextcloudClient;
