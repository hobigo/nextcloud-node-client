import Client, { ClientError, IQuota, UserGroup, UserGroupDoesNotExistError } from "./client";
import FileSizeFormatter from "./fileSizeFormatter";

export enum UserProperty {
    email = "email",
    quota = "quota",
    displayName = "displayname",
    phone = "phone",
    address = "address",
    website = "website",
    twitter = "twitter",
    password = "password",
    language = "language",
    locale = "locale",
}

export interface IUserOptionsQuota {
    "free"?: number,
    "used": number,
    "total"?: number,
    "relative": number,
    "quota": number
}

export interface IUserQuotaUserFriendly {
    "free"?: string,
    "used": string,
    "total"?: string,
    "quota": string,
    "relative": string
}

export interface IUserOptions {
    "enabled": boolean;
    "lastLogin"?: Date,
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

    // **********************************
    // enable disable
    // **********************************
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

    // **********************************
    // last login
    // **********************************
    async getLastLogin(): Promise<Date | null> {
        const data: IUserOptions = await this.getUserData();
        if (data.lastLogin) {
            return data.lastLogin;
        }
        return null;
    }

    // **********************************
    // display name
    // **********************************
    async getDisplayName(): Promise<string> {
        return (await this.getUserData()).displayName;
    }

    async setDisplayName(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.displayName, value);
        delete this.memento;
    }

    // **********************************
    // quota
    // **********************************
    async getQuotaUserFriendly(): Promise<IUserQuotaUserFriendly> {
        const q: IUserOptionsQuota = (await this.getUserData()).quota;

        const qUF: IUserQuotaUserFriendly = {
            used: new FileSizeFormatter(q.used).getUserFriendlyFileSize(),
            quota: new FileSizeFormatter(q.quota).getUserFriendlyFileSize(),
            relative: Math.round(q.relative) + " %"
        }
        if (q.total) {
            qUF.total = new FileSizeFormatter(q.total).getUserFriendlyFileSize();
        }

        if (q.free) {
            qUF.free = new FileSizeFormatter(q.free).getUserFriendlyFileSize();
        }
        return qUF;
    }

    async setQuota(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.quota, value);
        delete this.memento;
    }

    async getQuota(): Promise<IUserOptionsQuota> {
        return (await this.getUserData()).quota;
    }

    // **********************************
    // email
    // **********************************
    async getEmail(): Promise<string> {
        return (await this.getUserData()).email;
    }

    async setEmail(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.email, value);
        delete this.memento;
    }

    // **********************************
    // phone
    // **********************************
    async getPhone(): Promise<string> {
        return (await this.getUserData()).phone;
    }

    async setPhone(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.phone, value);
        delete this.memento;
    }

    // **********************************
    // address
    // **********************************
    async getAddress(): Promise<string> {
        return (await this.getUserData()).address;
    }

    async setAddress(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.address, value);
        delete this.memento;
    }

    // **********************************
    // website
    // **********************************
    async getWebsite(): Promise<string> {
        return (await this.getUserData()).website;
    }

    async setWebsite(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.website, value);
        delete this.memento;
    }

    // **********************************
    // twitter
    // **********************************
    async getTwitter(): Promise<string> {
        return (await this.getUserData()).twitter;
    }

    async setTwitter(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.twitter, value);
        delete this.memento;
    }

    // **********************************
    // language
    // **********************************
    async getLanguage(): Promise<string> {
        return (await this.getUserData()).language;
    }

    async setLanguage(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.language, value);
        delete this.memento;
    }

    // **********************************
    // locale
    // **********************************
    async getLocale(): Promise<string> {
        return (await this.getUserData()).locale;
    }

    async setLocale(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.locale, value);
        delete this.memento;
    }

    // **********************************
    // user group member
    // **********************************

    /**
     * @returns a list of user groups where the user is member
     */
    async getMemberUserGroups(): Promise<UserGroup[]> {
        const groupIds: string[] = (await this.getUserData()).memberGroups;
        const result: UserGroup[] = [];
        for (const groupId of groupIds) {
            result.push(new UserGroup(this.client, groupId));
        }
        return result;
    }

    /**
     * adds the user to a user group as member
     * @param userGroup the user group
     */
    async addToMemberUserGroup(userGroup: UserGroup): Promise<void> {
        return this.client.addUserToMemberUserGroup(this.id, userGroup.id);
    }

    async removeFromMemberUserGroups() {
        // @todo
    }

    // **********************************
    // user group subadmin
    // **********************************

    /**
     * @returns a list of user groups where the user is subadmin
     */
    async getSubadminUserGroups(): Promise<UserGroup[]> {
        const groupIds: string[] = (await this.getUserData()).subadminGroups;
        const result: UserGroup[] = [];
        for (const groupId of groupIds) {
            result.push(new UserGroup(this.client, groupId));
        }
        return result;
    }

    async promoteToUserGroupSubadmin(userGroup: UserGroup): Promise<void> {
        return this.client.promoteUserToUserGroupSubadmin(this.id, userGroup.id);
    }

    async demoteFromSubadminForUserGroups(groupId: string): Promise<void> {
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
