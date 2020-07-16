import ClientError from "./error";

export default class Environment {

    public static getMinLogLevel(): string {
        return process.env.MIN_LOG_LEVEL || "error";
    }

    public static getNextcloudUrl(): string {
        if (!process.env.NEXTCLOUD_URL) {
            throw new ClientError("NCEnvironment: NEXTCLOUD_URL not defined in environment"
                , "ERR_NEXTCLOUD_URL_NOT_DEFINED");
        }
        return process.env.NEXTCLOUD_URL;
    }

    public static getUserName(): string {
        if (!process.env.NEXTCLOUD_USERNAME) {
            throw new ClientError("NCEnvironment: NEXTCLOUD_USERNAME not defined in environment"
                , "ERR_NEXTCLOUD_USERNAME_NOT_DEFINED");
        }
        return process.env.NEXTCLOUD_USERNAME;
    }

    public static getPassword(): string {
        if (!process.env.NEXTCLOUD_PASSWORD) {
            throw new ClientError("NCEnvironment: NEXTCLOUD_PASSWORD not defined in environment"
                , "ERR_NEXTCLOUD_PASSWORD_NOT_DEFINED");
        }
        return process.env.NEXTCLOUD_PASSWORD;
    }

    public static getRecordingActiveIndicator(): boolean {
        if ((process.env.TEST_RECORDING_ACTIVE &&
            (process.env.TEST_RECORDING_ACTIVE === "0" || process.env.TEST_RECORDING_ACTIVE === "false" || process.env.TEST_RECORDING_ACTIVE === "inactive")) ||
            !process.env.TEST_RECORDING_ACTIVE) {
            return false;
        } else {
            return true;
        }
    }
}
