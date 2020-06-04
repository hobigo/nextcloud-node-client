import Client, { ClientError, IQuota, UserGroup } from "./client";

export interface IUserOptionsQuota {
    "free": number,
    "used": number,
    "total": number,
    "relative": number,
    "quota": number
}

export interface IUserOptions {
    "enabled": boolean;
    "lastLogin": Date,
    "subadminGroups": string[],
    "memberGroups": string[],
    "quota": IUserOptionsQuota,
    "email": string,
    "displayName": string,
    "phone": string,
    "address": string,
    "website": string,
    "twitter": string,
    "language": string
    "locale": string,
}

/**
 * The user class represents a user in nextcloud.
 * async getGroups
 * async isDisabled
 * async getLastLogin
 * async getEmail
 * getId
 * async getDisplayName
 */
export default class User {
    // https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/user_provisioning_api.html

    private memento?: IUserOptions;
    private client: Client;
    readonly id: string;
    constructor(client: Client, id: string, options?: IUserOptions) {
        this.id = id;
        this.client = client;
        this.memento = options;
    }

    async getDisplayName(): Promise<string> {
        return (await this.getUserData()).displayName;
    }

    private async getUserData(): Promise<IUserOptions> {
        if (!this.memento) {
            this.memento = await this.client.getUserData(this.id);
        }
        return this.memento;
    }

}
