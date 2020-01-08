// tslint:disable-next-line:no-var-requires
require("dotenv").config();

import debugFactory from "debug";
import NCError from "./ncError";
import Server from "./server";

const debug = debugFactory("NCEnvironment");

export default class Environment {
    public readonly url?: string;
    public readonly userName?: string;
    public readonly password?: string;
    public readonly recordingActive: boolean;

    public constructor() {
        this.url = process.env.NEXTCLOUD_URL;
        this.userName = process.env.NEXTCLOUD_USERNAME;
        this.password = process.env.NEXTCLOUD_PASSWORD;
        if ((process.env.TEST_RECORDING_ACTIVE &&
            (process.env.TEST_RECORDING_ACTIVE === "0" || process.env.TEST_RECORDING_ACTIVE === "false" || process.env.TEST_RECORDING_ACTIVE === "inactive")) ||
            !process.env.TEST_RECORDING_ACTIVE) {
            this.recordingActive = false;
        } else {
            this.recordingActive = true;
        }
    }

    /**
     * returns the nextcloud credentials that is defined in the
     * "user-provided" service section of the VCAP_SERVICES environment
     * @param instanceName the name of the nextcloud user provided service instance
     * @returns credentials from the VCAP_SERVICES environment (user provided service)
     */
    public getServer(): Server {

        if (!this.url) {
            throw new NCError("NCEnvironment: NEXTCLOUD_URL not defined in environment"
                , "ERR_NEXTCLOUD_URL_NOT_DEFINED");
        }

        if (!this.userName) {
            throw new NCError("NCEnvironment: NEXTCLOUD_USERNAME not defined in environment"
                , "ERR_NEXTCLOUD_USERNAME_NOT_DEFINED");
        }

        if (!this.password) {
            throw new NCError("NCEnvironment: NEXTCLOUD_PASSWORD not defined in environment"
                , "ERR_NEXTCLOUD_PASSWORD_NOT_DEFINED");
        }

        return new Server({
            basicAuth: {
                password: this.password,
                username: this.userName,
            },
            logRequestResponse: this.recordingActive,
            url: this.url,
        });

    }

}
