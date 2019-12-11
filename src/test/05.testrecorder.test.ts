import { expect } from "chai";
import { promises as fsPromises } from "fs";
import "mocha";
import mockedEnv from "mocked-env";
import TestRecorder, { IRecordingRequest, IRecordingResponse } from "../testRecorder";

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("NEXCLOUD-NODE-CLIENT-TEST-RECORDER", function () {
    this.timeout(1 * 60 * 1000);
    const testContextName: string = "testrecorder/test";
    afterEach(async () => {
        const deleteDir: string = "src/test/recordings/testrecorder";
        try {
            await fsPromises.rmdir(deleteDir, { recursive: true });
            // tslint:disable-next-line:no-empty
        } catch (e) { }
    });

    it("01 get test recorder instance", async () => {
        const tr = TestRecorder.getInstance();
        expect(tr, "expect test recorder to a object").to.be.a("object").that.is.instanceOf(TestRecorder);
        // get the recorder a second time
        const tr2 = TestRecorder.getInstance();
        expect(tr2, "expect test recorder to a object").to.be.a("object").that.is.instanceOf(TestRecorder);
    });

    it("02 test recorder active", async () => {
        const tr = TestRecorder.getInstance();

        let restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "donnerwetter",
        });
        expect(tr.isActive(), "expect test recorder to be active if some value is provided").to.be.equal(true);
        restore();

        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "false",
        });
        expect(tr.isActive(), "expect test recorder to be inactive if 'false' provided").to.be.equal(false);
        restore();

        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "0",
        });
        expect(tr.isActive(), "expect test recorder to be inactive if '0' provided").to.be.equal(false);
        restore();

        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "inactive",
        });
        expect(tr.isActive(), "expect test recorder to be inactive if 'inactive' provided").to.be.equal(false);
        restore();

        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: undefined,
        });
        expect(tr.isActive(), "expect test recorder to be inactive if undefined").to.be.equal(false);
        restore();
        TestRecorder.deleteInstance();
    });

    it("03 set test recorder context", async () => {
        const tr = TestRecorder.getInstance();

        let restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "1",
        });

        try {
            await tr.setContext(testContextName);
            expect(true, "expect no exception").to.be.equal(true);
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal("no exception");
        } finally {
            restore();
        }

        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "1",
        });

        try {
            await tr.setContext(testContextName);
            expect(true, "expect no exception").to.be.equal(true);
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal("no exception");
        } finally {
            restore();
        }

        TestRecorder.deleteInstance();
    });

    it("04 test recorder record", async () => {
        let tr = TestRecorder.getInstance();

        const recRequest: IRecordingRequest = {
            body: "test request body",
            method: "method",
            url: "https://my.url.com",
        };

        const recResponse: IRecordingResponse = {
            body: "some response text",
            contentLocation: "location header",
            contentType: "content type",
            status: 200,
        };

        // not active and no context -> OK
        let restore = mockedEnv({
            TEST_RECORDING_ACTIVE: undefined,
        });

        try {
            await tr.record(recRequest, recResponse);
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        } finally {
            restore();
        }

        // active and no context -> exception
        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "1",
        });

        try {
            await tr.record(recRequest, recResponse);
            expect(true, "expect an exception").to.be.equal(false);
        } catch (e) {
            expect(e.message, "expect an exception").to.be.equal("Error while recording, context not set");
        } finally {
            restore();
        }

        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "1",
        });

        // active and context -> ok
        await tr.setContext(testContextName);

        try {
            await tr.record(recRequest, recResponse);
        } catch (e) {
            expect(e.message, "no exception expected").to.be.equal("no exception expected");
        } finally {
            restore();
        }

        TestRecorder.deleteInstance();

        // not active and context -> ok
        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "0",
        });

        tr = TestRecorder.getInstance();
        await tr.setContext(testContextName);

        try {
            await tr.record(recRequest, recResponse);
        } catch (e) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        } finally {
            restore();
        }

        TestRecorder.deleteInstance();
    });

    it("05 get recorded response", async () => {
        let tr = TestRecorder.getInstance();

        const recRequest: IRecordingRequest = {
            body: "test request body",
            method: "method",
            url: "https://my.url.com",
        };

        const recResponse: IRecordingResponse = {
            body: "some response text",
            contentLocation: "location header",
            contentType: "content type",
            status: 200,
        };

        let restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "active",
        });

        // active and context -> ok
        // set context for recording
        await tr.setContext(testContextName);

        try {
            await tr.record(recRequest, recResponse);
        } catch (e) {
            expect(e.message, "no exception expected").to.be.equal("no exception expected");
        } finally {
            restore();
        }

        // set context for reading
        await tr.setContext(testContextName);
        const response: IRecordingResponse = await tr.getRecordedResponse(recRequest);

        expect(response.body).to.be.equal(recResponse.body);

        TestRecorder.deleteInstance();
        tr = TestRecorder.getInstance();
        // get response without context should fail
        restore = mockedEnv({
            TEST_RECORDING_ACTIVE: "active",
        });

        try {
            await tr.getRecordedResponse(recRequest);
        } catch (e) {
            expect(e.message, "exception expected - get response without context should fail").to.be.equal("Error while getting recording request, context not set");
        } finally {
            restore();
        }
        TestRecorder.deleteInstance();
    });

});
