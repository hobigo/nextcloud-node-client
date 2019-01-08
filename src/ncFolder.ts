// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("NCFolder");

import NCClient from "./ncClient";
import NCError from "./ncError";
import NCFile from "./ncFile";

export default class NCFolder {
    public name: string;
    public baseName: string;
    public lastmod: Date;
    private client: NCClient;
    constructor(client: NCClient, name: string, baseName: string, lastmod: string) {

        this.client = client;
        this.name = name;
        this.baseName = baseName;
        this.lastmod = new Date(lastmod);
    }

    public async getSubFolders(): Promise<NCFolder[]> {
        return this.client.getSubFolders(this.name);
    }

    public async hasSubFolder(subFolderName: string): Promise<boolean> {
        const subFolder: NCFolder | null = await this.client.getFolder(this.name + "/" + subFolderName);
        if (subFolder) {
            return true;
        }
        return false;
    }

    public async getFiles(): Promise<NCFile[]> {
        return this.client.getFiles(this.name);
    }

    public async createSubFolder(subFolderName: string): Promise<NCFolder> {
        return this.client.createFolder(this.name + "/" + subFolderName);
    }

    public async getFile(fileBaseName: string): Promise<NCFile | null> {
        return this.client.getFile(this.name + "/" + fileBaseName);
    }

    public async createFile(fileBaseName: string, data: Buffer): Promise<NCFile | null> {
        // must not contain :/\*"<>?
        debug("createFile fileBaseName = %s", fileBaseName);
        const invalidChars: string[] = [":", "*", "/", "\\", "\"", "?", "<", ">"];
        // debug("createFile invalidChars = %O", invalidChars);

        for (const invalidChar of invalidChars) {
            if (fileBaseName.indexOf(invalidChar) !== -1) {
                throw new NCError("Filename contains an invalid character '" + invalidChar + "'",
                    "ERR_INVALID_CHAR_IN_FILE_NAME",
                    { fileBaseName });
            }
        }

        return this.client.createFile(this.name + "/" + fileBaseName.replace(/^\/+/g, ""), data);
    }

    public async delete(): Promise<void> {
        debug("delete");
        return this.client.deleteFolder(this.name);
    }

    public async move(targetFolderName: string): Promise<NCFolder> {
        const folder: NCFolder = await this.client.moveFolder(this.name, targetFolderName);
        this.name = folder.name;
        this.baseName = folder.baseName;
        this.lastmod = folder.lastmod;
        return this;
    }

    public getUrl(): string {
        return this.client.getLink(this.name);
    }
}
