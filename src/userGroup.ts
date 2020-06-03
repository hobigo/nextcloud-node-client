import Client, { UserGroupDeletionFailedError, UserGroupDoesNotExistError } from "./client";

/**
 * The user group class represents a user user in nextcloud.
 * spec: https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/instruction_set_for_groups.html
 * id
 * getSubAdmins
 * getMembers
 */
export default class UserGroup {
    readonly id: string;
    private client: Client;
    constructor(client: Client, id: string) {
        this.id = id;
        this.client = client;
    }

    /**
     * deletes the user group
     * @throws UserGroupDeletionFailedError
     */
    public async delete(): Promise<void> {

        try {
            return await this.client.deleteUserGroup(this.id);
        } catch (e) {
            if (e instanceof UserGroupDoesNotExistError) {
                return;
            }
            throw e;
        }
    }

    public async getMemberUserIds(): Promise<string[]> {
        return await this.client.getUserGroupMembers(this.id);
    }

    public async getSubadminUserIds(): Promise<string[]> {
        return await this.client.getUserGroupSubadmins(this.id);
    }
}
