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
    private id: number;
    constructor(client: NCClient, name: string, baseName: string, lastmod: string, id: number = -1) {

        this.client = client;
        this.name = name;
        this.baseName = baseName;
        this.lastmod = new Date(lastmod);
        this.id = id;
    }

    /**
     * @returns an array of subfolders
     * @throws Error
     */
    public async getSubFolders(): Promise<NCFolder[]> {
        return this.client.getSubFolders(this.name);
    }

    /**
     * returns true if the current folder has a subfolder with the given base name
     * @param subFolderBaseName the base name of the subfolder like "products"
     */
    public async hasSubFolder(subFolderBaseName: string): Promise<boolean> {
        const subFolder: NCFolder | null = await this.client.getFolder(this.name + "/" + subFolderBaseName);
        if (subFolder) {
            return true;
        }
        return false;
    }

    /**
     * @returns all files of the folder
     */
    public async getFiles(): Promise<NCFile[]> {
        return this.client.getFiles(this.name);
    }

    /**
     * creates a subfolder
     * @param subFolderBaseName  name of the subfolder basename
     */
    public async createSubFolder(subFolderBaseName: string): Promise<NCFolder> {
        return this.client.createFolder(this.name + "/" + subFolderBaseName);
    }

    /**
     * get a file by basename
     * @param fileBaseName the base name of the file
     * @returns the file of null
     * @throws Error
     */
    public async getFile(fileBaseName: string): Promise<NCFile | null> {
        return this.client.getFile(this.name + "/" + fileBaseName);
    }

    /**
     * creates a file in the folder
     * @param fileBaseName the base name of the file
     * @param data the buffer with file content
     * @returns the new file or null
     * @throws Error
     */
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

    /**
     * deletes the folder and the contained files
     * @throws Error
     */
    public async delete(): Promise<void> {
        debug("delete");
        return this.client.deleteFolder(this.name);
    }

    /**
     * renames or moves the current folder to the new location
     * target folder must exists
     * @param targetFolderName the name of the target folder /f1/f2/target
     * @throws Error
     */
    public async move(targetFolderName: string): Promise<NCFolder> {
        const folder: NCFolder = await this.client.moveFolder(this.name, targetFolderName);
        this.name = folder.name;
        this.baseName = folder.baseName;
        this.lastmod = folder.lastmod;
        return this;
    }

    /**
     * @returns the url of the folder
     * @throws Error
     */
    public getUrl(): string {
        return this.client.getLink(this.name);
    }

    /**
     * @returns the url of the folder in the UI
     * @throws Error
     */
    public async getUIUrl(): Promise<string> {
        return this.client.getUILink(await this.getId());
    }

    /**
     * @returns the id of the folder, -1 if the folder has been deleted
     * @throws Error
     */
    public async getId(): Promise<number> {
        if (this.id === -1) {
            this.id = await this.client.getFileId(this.getUrl());
        }
        return this.id;
    }

    /**
     * @returns true if the folder contains a file with the given basename
     * @param fileBaseName file basename
     */
    public async containsFile(fileBaseName: string): Promise<boolean> {
        let file: NCFile | null;
        try {
            file = await this.getFile(fileBaseName);
            if (file) {
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    /**
     * adds a tag name to the folder
     * @param tagName name of the tag
     */
    public async addTag(tagName: string): Promise<void> {
        return this.client.addTagToFile(await this.getId(), tagName);
    }

    /**
     * get tag names
     * @returns array of tag names
     */
    public async getTags(): Promise<string[]> {
        const map: Map<string, number> = await this.client.getTagsOfFile(await this.getId());
        const tagNames: string[] = [];
        for (const tagName of map) {
            tagNames.push(tagName[0]);
        }
        return tagNames;
    }

    /**
     * removes a tag of the file
     * @param tagName the name of the tag
     */
    public async removeTag(tagName: string): Promise<void> {
        const map: Map<string, number> = await this.client.getTagsOfFile(await this.getId());
        const tagNames: string[] = [];

        const tagId: number | undefined = map.get(tagName);
        if (tagId) {
            await this.client.removeTagOfFile(await this.getId(), tagId);
        }
    }

    /**
     * add comment to folder
     * @param comment the comment
     */
    public async addComment(comment: string): Promise<void> {
        return this.client.addCommentToFile(await this.getId(), comment);
    }

    /**
     * get list of comments of folder
     * @param top number of comments to return
     * @param skip the offset
     * @returns array of comment strings
     * @throws Exception
     */
    public async getComments(top?: number, skip?: number): Promise<string[]> {
        return this.client.getFileComments(await this.getId(), top, skip);
    }
}
