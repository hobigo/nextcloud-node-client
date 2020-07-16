import { expect } from "chai";
import "mocha";
import Logger from "../logger";
import mockedEnv from "mocked-env";

describe("32-NEXCLOUD-NODE-CLIENT-LOGGER", function () {

    this.timeout(1 * 60 * 1000);

    it("01 Logger", async () => {
        // only for code coverage
        let restore = mockedEnv({
            MIN_LOG_LEVEL: ""
        });
        let log: Logger = new Logger();
        log.silly("silly");
        log.trace("trace");
        log.debug("debug");
        log.info("info");
        log.warn("warn");
        log.error("error");
        log.fatal("fatal");

        restore = mockedEnv({
            MIN_LOG_LEVEL: "xxx"
        });
        log = new Logger();
        restore = mockedEnv({
            MIN_LOG_LEVEL: "silly"
        });
        log = new Logger();
        restore = mockedEnv({
            MIN_LOG_LEVEL: "trace"
        });
        log = new Logger();
        restore = mockedEnv({
            MIN_LOG_LEVEL: "debug"
        });
        log = new Logger();
        restore = mockedEnv({
            MIN_LOG_LEVEL: "info"
        });
        log = new Logger();
        restore = mockedEnv({
            MIN_LOG_LEVEL: "warn"
        });
        log = new Logger();
        restore = mockedEnv({
            MIN_LOG_LEVEL: "error"
        });
        log = new Logger();
        restore = mockedEnv({
            MIN_LOG_LEVEL: "fatal"
        });
        log = new Logger();
        restore();
    });

});
