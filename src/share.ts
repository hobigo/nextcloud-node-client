import Client, { ClientError } from "./client";
import File from "./file";
import Folder from "./folder";

export enum SharePermission {
    all = 31,
    read = 1,
    update = 2,
    create = 4,
    delete = 8,
    share = 16,
}

enum ShareType {
    user = 0,
    group = 1,
    publicLink = 3,
    email = 4,
}

export interface ICreateShare {
    "resource": Folder | File;
    // @todo "shareWith"?: User | UserGroup | EMail;
    "publicUpload"?: boolean;
    "password"?: string;
}

enum ShareItemType {
    file = "file",
    folder = "folder",
}
export default class Share {

    public static async getShare(client: Client, id: string): Promise<Share> {
        const share: Share = new Share(client, id);
        await share.initialize();
        return share;
    }

    public static createShareRequestBody(createShare: ICreateShare): string {
        const shareType: ShareType = ShareType.publicLink;

        const shareRequest: {
            path: string,
            shareType: number,
            // @todo   permissions: number | number[]
            password?: string,
            publicUpload?: boolean,
        } = {
            path: createShare.resource.name,
            //  @todo    permissions: 1,
            shareType,
        };

        if (createShare.publicUpload && createShare.publicUpload === true) {
            shareRequest.publicUpload = true;
        }

        if (createShare.password) {
            shareRequest.password = createShare.password;
        }

        return JSON.stringify(shareRequest, null, 4);
    }

    private client: Client;
    private id: string;
    private memento?: {
        share_type: number,
        "uid_owner": string,
        "displayname_owner": string,
        "permissions": SharePermission,
        "can_edit": boolean,
        "can_delete": boolean,
        "stime": Date,
        "parent"?: Share,
        "expiration"?: Date,
        "token": string,
        "uid_file_owner": string,
        "note"?: string,
        "label"?: string,
        "displayname_file_owner": string,
        "path": string,
        "item_type": ShareItemType,
        "mimetype"?: string,
        "share_with"?: string,
        "share_with_displayname"?: string,
        "password"?: string,
        "url": string,
        "mail_send": boolean,
        "hide_download": boolean,
    };
    private constructor(client: Client, id: string) {
        this.client = client;
        this.id = id;
    }
    private async initialize(): Promise<void> {
        const rawShareData = await this.client.getShare(this.id);
        console.log(rawShareData);
    }
}
