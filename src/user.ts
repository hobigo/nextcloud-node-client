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

    /**
     * the conscructor of the user
     * should only me invoked by the Client
     * @constructor
     * @param {Client} client
     * @param {string} id the user id
     * @param {IUserOptions} options optional options
     */
    constructor(client: Client, id: string, options?: IUserOptions) {
        this.id = id;
        this.client = client;
        this.memento = options;
    }

    // **********************************
    // enable disable
    // **********************************

    /**
     * returns true if the user is enabled
     * @async
     * @returns {Promise<boolean>} true if the user is enabled
     * @throws {UserNotFoundError}
     */
    async isEnabled(): Promise<boolean> {
        return (await this.getUserData()).enabled;
    }

    /**
     * disables the user
     * @async
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     */
    async disable(): Promise<void> {
        delete this.memento;
        return await this.client.disableUser(this.id);
    }

    /**
     * enables the user
     * @async
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     */
    async enable(): Promise<void> {
        delete this.memento;
        return await this.client.enableUser(this.id);
    }

    /**
     * get the last login date or null if the user has not been logged in yet
     * @async
     * @returns {Promise<Date | null>} last login date or null if the user has not been logged in yet
     * @throws {UserNotFoundError}
     */
    async getLastLogin(): Promise<Date | null> {
        const data: IUserOptions = await this.getUserData();
        if (data.lastLogin) {
            return data.lastLogin;
        }
        return null;
    }

    /**
     * returns the display name
     * @async
     * @returns {Promise<string>} display name
     * @throws {UserNotFoundError}
     */
    async getDisplayName(): Promise<string> {
        return (await this.getUserData()).displayName;
    }

    /**
     * set the display name
     * @async
     * @param {string} value the display name
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setDisplayName(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.displayName, value);
        delete this.memento;
    }

    /**
     * returns information on quota, usage and available space
     * @async
     * @returns {Promise<IUserOptionsQuota>}
     * @throws {UserNotFoundError}
     */
    async getQuota(): Promise<IUserOptionsQuota> {
        return (await this.getUserData()).quota;
    }

    /**
     * returns information on quota, usage and available space in a user friendly format
     * @async
     * @returns {Promise<IUserQuotaUserFriendly>}
     * @throws {UserNotFoundError}
     */
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

    /**
     * sets the quota limit of the user
     * @async
     * @param {string} value the quota string like "1 GB", "100 MB"
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setQuota(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.quota, value);
        delete this.memento;
    }

    /**
     * returns the email address
     * @async
     * @returns {Promise<string>} email adress
     * @throws {UserNotFoundError}
     */
    async getEmail(): Promise<string> {
        return (await this.getUserData()).email;
    }

    /**
     * set the email address
     * @async
     * @param {string} value the email address
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setEmail(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.email, value);
        delete this.memento;
    }

    // **********************************
    // phone
    // **********************************
    /**
     * returns the phone number
     * @async
     * @returns {Promise<string>} phone number
     * @throws {UserNotFoundError}
     */
    async getPhone(): Promise<string> {
        return (await this.getUserData()).phone;
    }

    /**
     * set phone number
     * @async
     * @param {string} value the phone number
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setPhone(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.phone, value);
        delete this.memento;
    }

    // **********************************
    // address
    // **********************************
    /**
     * returns the phone number
     * @async
     * @returns {Promise<string>} address
     * @throws {UserNotFoundError}
     */
    async getAddress(): Promise<string> {
        return (await this.getUserData()).address;
    }

    /**
     * set the address
     * @async
     * @param {string} value the address
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setAddress(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.address, value);
        delete this.memento;
    }

    // **********************************
    // website
    // **********************************

    /**
     * returns the website
     * @async
     * @returns {Promise<string>} website
     * @throws {UserNotFoundError}
     */
    async getWebsite(): Promise<string> {
        return (await this.getUserData()).website;
    }

    /**
     * set the website
     * @async
     * @param {string} value the website
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setWebsite(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.website, value);
        delete this.memento;
    }

    // **********************************
    // twitter
    // **********************************

    /**
     * returns the twitter handle
     * @async
     * @returns {Promise<string>} twitter handle
     * @throws {UserNotFoundError}
     */
    async getTwitter(): Promise<string> {
        return (await this.getUserData()).twitter;
    }

    /**
     * set the twitter handle
     * @async
     * @param {string} value the twitter handle
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setTwitter(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.twitter, value);
        delete this.memento;
    }

    // **********************************
    // language
    // **********************************

    /**
     * returns the langauge code
     * @async
     * @returns {Promise<string>} language code
     * @throws {UserNotFoundError}
     */
    async getLanguage(): Promise<string> {
        return (await this.getUserData()).language;
    }

    /**
     * set the language code like EN, DE, FR...
     * @async
     * @param {string} value the language code
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setLanguage(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.language, value);
        delete this.memento;
    }

    // **********************************
    // locale
    // **********************************

    /**
     * returns the locale
     * @async
     * @returns {Promise<string>} locale
     * @throws {UserNotFoundError}
     */
    async getLocale(): Promise<string> {
        return (await this.getUserData()).locale;
    }

    /**
     * set the locale like EN, DE, FR...
     * @async
     * @param {string} value the locale
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setLocale(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.locale, value);
        delete this.memento;
    }

    /**
     * set the password
     * @async
     * @param {string} value the password
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserUpdateError}
     */
    async setPassword(value: string): Promise<void> {
        await this.client.updateUserProperty(this.id, UserProperty.password, value);
    }

    // **********************************
    // Resend the welcome email
    // **********************************

    /**
     * resends the welcome email
     * @async
     * @returns {Promise<void>}
     * @throws  {UserResendWelcomeEmailError}
     */
    async resendWelcomeEmail(): Promise<void> {
        await this.client.resendWelcomeEmail(this.id);
    }

    // **********************************
    // user group member
    // **********************************

    /**
     * returns a list of user groups where the user is member
     * @async
     * @returns {Promise<UserGroup[]} a list of user groups where the user is member
     * @throws {UserNotFoundError}
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
     * returns a list of user group ids where the user is member
     * @async
     * @returns {Promise<string[]} a list of user group ids where the user is member
     * @throws {UserNotFoundError}
     */
    async getMemberUserGroupIds(): Promise<string[]> {
        return (await this.getUserData()).memberGroups;
    }

    /**
     * adds the user to a user group as member
     * @async
     * @param {UserGroup} userGroup the user group
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    async addToMemberUserGroup(userGroup: UserGroup): Promise<void> {
        await this.client.addUserToMemberUserGroup(this.id, userGroup.id);
        delete this.memento;
        return;
    }

    /**
     * remove the user from a user group as member
     * @async
     * @param {UserGroup} userGroup the user group
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    async removeFromMemberUserGroup(userGroup: UserGroup): Promise<void> {
        await this.client.removeUserFromMemberUserGroup(this.id, userGroup.id);
        delete this.memento;
        return
    }

    // **********************************
    // user superadmin
    // **********************************

    /**
     * true if the user is a superadmin
     * @async
     * @returns {Promise<boolean>} true if the user is a superadmin
     * @throws {UserNotFoundError}
     */
    async isSuperAdmin(): Promise<boolean> {
        return (await this.getUserData()).memberGroups.indexOf("admin") === -1 ? false : true;
    }

    /**
     * promote user to super admin
     * @async
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    async promoteToSuperAdmin(): Promise<void> {
        await this.addToMemberUserGroup(new UserGroup(this.client, "admin"));
        delete this.memento;
        return;
    }

    /**
     * demote user from being a super admin
     * @async
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    async demoteFromSuperAdmin(): Promise<void> {
        if (await this.isSuperAdmin()) {
            await this.removeFromMemberUserGroup(new UserGroup(this.client, "admin"));
            delete this.memento;
        }
        return;
    }

    // **********************************
    // user group subadmin
    // **********************************

    /**
     * returns a list of user groups where the user is subadmin
     * @async
     * @returns {Promise<UserGroup[]} a list of user groups where the user is subadmin
     * @throws {UserNotFoundError}
     */
    async getSubadminUserGroups(): Promise<UserGroup[]> {
        const groupIds: string[] = (await this.getUserData()).subadminGroups;
        const result: UserGroup[] = [];
        for (const groupId of groupIds) {
            result.push(new UserGroup(this.client, groupId));
        }
        return result;
    }

    /**
     * returns a list of user group ids where the user is subadmin
     * @async
     * @returns {Promise<string[]} a list of user group ids where the user is subadmin
     * @throws {UserNotFoundError}
     */
    async getSubadminUserGroupIds(): Promise<string[]> {
        return (await this.getUserData()).subadminGroups;
    }

    /**
     * promote the user to be a subadmin of the user group
     * @async
     * @param {UserGroup} userGroup the user group
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    async promoteToUserGroupSubadmin(userGroup: UserGroup): Promise<void> {
        await this.client.promoteUserToUserGroupSubadmin(this.id, userGroup.id);
        delete this.memento;
        return
    }

    /**
     * demote the user from beeing a subadmin of the user group
     * @async
     * @param {UserGroup} userGroup the user group
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    async demoteFromSubadminUserGroup(userGroup: UserGroup): Promise<void> {
        await this.client.demoteUserFromSubadminUserGroup(this.id, userGroup.id);
        delete this.memento;
        return
    }

    /**
     * deletes a user
     * @async
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     */
    async delete(): Promise<void> {
        return await this.client.deleteUser(this.id);
    }

    /**
     * returns the user data
     * @async
     * @returns {Promise<IUserOptions>}
     * @throws {UserNotFoundError}
     */
    private async getUserData(): Promise<IUserOptions> {
        if (!this.memento) {
            this.memento = await this.client.getUserData(this.id);
        }
        return this.memento;
    }

}
