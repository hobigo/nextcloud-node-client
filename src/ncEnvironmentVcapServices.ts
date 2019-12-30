// tslint:disable-next-line:no-var-requires
require("dotenv").config();

import debugFactory from "debug";
import NCError from "./ncError";
import { NCServer } from "./ncServer";
export { NCServer };

const debug = debugFactory("NCEnvironmentVcapServices");

/**
 * returns the nextcloud credentials that is defined in the
 * "user-provided" service section of the VCAP_SERVICES environment
 * instanceName: the name of the nextcloud user provided service instance
 */
export default class NCEnvironmentVcapServices {
    public readonly url: string;
    public readonly userName: string;
    public readonly password: string;

    public constructor(instanceName: string) {

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

        this.url = cred.url as string;
        this.userName = cred.username as string;
        this.password = cred.password as string;
    }

    /**
     * returns the nextcloud credentials that is defined in the
     * "user-provided" service section of the VCAP_SERVICES environment
     * @param instanceName the name of the nextcloud user provided service instance
     * @returns credentials from the VCAP_SERVICES environment (user provided service)
     */
    public getServer(): NCServer {

        return new NCServer(this.url,
            {
                password: this.password,
                username: this.userName,
            });
    }
}