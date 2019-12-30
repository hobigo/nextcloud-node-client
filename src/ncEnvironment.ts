// tslint:disable-next-line:no-var-requires
require("dotenv").config();

import debugFactory from "debug";
import NCError from "./ncError";
import { NCServer } from "./ncServer";

const debug = debugFactory("NCEnvironment");

export default class NCEnvironment {
    public readonly url?: string;
    public readonly userName?: string;
    public readonly password?: string;
    public readonly recordingActive?: boolean;
    public readonly vcapServices?: string;


    /**
     * returns the nextcloud credentials that is defined in the
     * "user-provided" service section of the VCAP_SERVICES environment
     * @param instanceName the name of the nextcloud user provided service instance
     * @returns credentials from the VCAP_SERVICES environment (user provided service)
     */
    public getCredentialsFromEnv(): NCServer {

        if (!process.env.NEXTCLOUD_URL) {
            throw new NCError("NCClient getCredentialsFromEnv: NEXTCLOUD_URL not defined in environment"
                , "ERR_NEXTCLOUD_URL_NOT_DEFINED");
        }

        if (!process.env.NEXTCLOUD_USERNAME) {
            throw new NCError("NCClient getCredentialsFromEnv: NEXTCLOUD_USERNAME not defined in environment"
                , "ERR_NEXTCLOUD_USERNAME_NOT_DEFINED");
        }

        if (!process.env.NEXTCLOUD_PASSWORD) {
            throw new NCError("NCClient getCredentialsFromEnv: NEXTCLOUD_PASSWORD not defined in environment"
                , "ERR_NEXTCLOUD_PASSWORD_NOT_DEFINED");
        }

        let logRequestResponse: boolean;

        if ((process.env.TEST_RECORDING_ACTIVE &&
            (process.env.TEST_RECORDING_ACTIVE === "0" || process.env.TEST_RECORDING_ACTIVE === "false" || process.env.TEST_RECORDING_ACTIVE === "inactive")) ||
            !process.env.TEST_RECORDING_ACTIVE) {
            logRequestResponse = false;
        } else {
            logRequestResponse = true;
        }

        return new NCServer(process.env.NEXTCLOUD_URL,
            {
                password: process.env.NEXTCLOUD_PASSWORD,
                username: process.env.NEXTCLOUD_USERNAME,
            }, undefined, logRequestResponse);
    }

    /**
     * returns the nextcloud credentials that is defined in the
     * "user-provided" service section of the VCAP_SERVICES environment
     * @param instanceName the name of the nextcloud user provided service instance
     * @returns credentials from the VCAP_SERVICES environment (user provided service)
     */
    public getCredentialsFromVcapServicesEnv(instanceName: string): NCServer {

        if (!process.env.VCAP_SERVICES) {
            throw new NCError("NCClient getCredentials: environment VCAP_SERVICES not found", "ERR_VCAP_SERVICES_NOT_FOUND");
        }

        const vcapServices = require("vcap_services");
        const cred = vcapServices.getCredentials("user-provided", null, instanceName);

        if (!cred || cred === undefined || (!cred.url && !cred.username && !cred.password)) {
            debug("NCClient: error credentials not found or not fully specified %O", cred);
            throw new NCError(`NCClient getCredentials: nextcloud credentials not found in environment VCAP_SERVICES. Service section: "user-provided", service instance name: "${instanceName}" `, "ERR_VCAP_SERVICES_NOT_FOUND");
        }

        if (!cred.url) {
            throw new NCError("NCClient getCredentials: VCAP_SERVICES url not defined in user provided services for nextcloud"
                , "ERR_VCAP_SERVICES_URL_NOT_DEFINED",
                { credentials: cred });
        }

        if (!cred.password) {
            throw new NCError("NCClient getCredentials VCAP_SERVICES password not defined in user provided services for nextcloud",
                "ERR_VCAP_SERVICES_PASSWORD_NOT_DEFINED",
                { credentials: cred });
        }

        if (!cred.username) {
            throw new NCError("NCClient getCredentials VCAP_SERVICES username not defined in user provided services for nextcloud",
                "ERR_VCAP_SERVICES_USERNAME_NOT_DEFINED",
                { credentials: cred });
        }

        return new NCServer(cred.url, { username: cred.username, password: cred.password });
    }

}
