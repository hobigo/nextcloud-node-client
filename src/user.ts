import Client, { ClientError, IQuota, UserGroup } from "./client";
import FileSizeFormatter from "./fileSizeFormatter";


export interface IUserOptionsQuota {
    "free": number,
    "used": number,
    "total": number,
    "relative": number,
    "quota": number
}

export interface IUserQuotaUserFriendly {
    "free": string,
    "used": string,
    "total": string,
    "quota": string,
    "relative": string
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

    async isEnabled(): Promise<boolean> {
        return (await this.getUserData()).enabled;
    }

    async disable(): Promise<void> {
        delete this.memento;
        return await this.client.disableUser(this.id);
    }

    async enable(): Promise<void> {
        delete this.memento;
        return await this.client.enableUser(this.id);
    }

    async getLastLogin(): Promise<Date> {
        return (await this.getUserData()).lastLogin;
    }

    async getDisplayName(): Promise<string> {
        return (await this.getUserData()).displayName;
    }

    async getQuotaUserFriendly(): Promise<IUserQuotaUserFriendly> {
        const q: IUserOptionsQuota = (await this.getUserData()).quota;
        return {
            free: new FileSizeFormatter(q.free).getUserFriendlyFileSize(),
            used: new FileSizeFormatter(q.used).getUserFriendlyFileSize(),
            total: new FileSizeFormatter(q.total).getUserFriendlyFileSize(),
            quota: new FileSizeFormatter(q.quota).getUserFriendlyFileSize(),
            relative: Math.round(q.relative) + " %"
        };
    }

    async getQuota(): Promise<IUserOptionsQuota> {
        return (await this.getUserData()).quota;
    }

    async getEmail(): Promise<string> {
        return (await this.getUserData()).email;
    }

    async getPhone(): Promise<string> {
        return (await this.getUserData()).phone;
    }

    async getAddress(): Promise<string> {
        return (await this.getUserData()).address;
    }

    async getWebsite(): Promise<string> {
        return (await this.getUserData()).website;
    }

    async getTwitter(): Promise<string> {
        return (await this.getUserData()).twitter;
    }

    async getLanguage(): Promise<string> {
        return (await this.getUserData()).language;
    }

    async getLocale(): Promise<string> {
        return (await this.getUserData()).locale;
    }

    async getMemberUserGroups() {
        // @todo
    }

    async getSubadminUserGroups() {
        // @todo
    }

    async addToMemberUserGroups() {
        // @todo
    }

    async removeFromMemberUserGroups() {
        // @todo
    }

    async addToSubadminUserGroups() {
        // @todo
    }

    async removeFromSubadminUserGroups() {
        // @todo
    }

    async delete(): Promise<void> {
        return await this.client.deleteUser(this.id);
    }

    private async getUserData(): Promise<IUserOptions> {
        if (!this.memento) {
            this.memento = await this.client.getUserData(this.id);
        }
        return this.memento;
    }

}
