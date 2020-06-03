
import path from "path";
import Client, { ClientError } from "./client";

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
    /*
    private memento: {
        id: string,
        enabled: boolean,
        lastLogin: number,
        email: string,
        displayName: string,
        phone: string,
        address: string,
        website: string,
        twitter: string,
        groups: string[],
        language: string,
        locale: string,
    };
    */

    private client: Client;
    constructor(client: Client, id: string) {
        // this.memento.id = id;
        this.client = client;
    }

}
