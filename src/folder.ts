// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("Folder");

import Client from "./client";
import ClientError from "./error";
import File from "./file";
import FileSystemElement from "./fileSystemElement";

export interface FolderGetFilesOptions {
    /**
     * callback function to filter files
     */
    filterFile?: (file: File) => File | null;
}

export default class Folder implements FileSystemElement {
    private client: Client;
    private memento: {
        baseName: string,
        id: number,
        deleted: boolean,
        lastmod: Date,
        name: string,
    };
    constructor(client: Client, name: string, baseName: string, lastmod: string, id: number = -1) {

        this.client = client;
        this.memento = {
            baseName,
            deleted: false,
            id,
            lastmod: new Date(lastmod),
            name,
        };
    }

    get name(): string {
        this.assertExistence();
        return this.memento.name;
    }

    get baseName(): string {
        this.assertExistence();
        return this.memento.baseName;
    }

    get lastmod(): Date {
        this.assertExistence();
        return this.memento.lastmod;
    }

    get id(): number {
        this.assertExistence();
        return this.memento.id;
    }

    /**
     * @returns an array of subfolders
     * @throws Error
     */
    public async getSubFolders(): Promise<Folder[]> {
        this.assertExistence();
        return await this.client.getSubFolders(this.name);
    }

    /**
     * returns true if the current folder has a subfolder with the given base name
     * @param subFolderBaseName the base name of the subfolder like "products"
     */
    public async hasSubFolder(subFolderBaseName: string): Promise<boolean> {
        this.assertExistence();
        const subFolder: Folder | null = await this.client.getFolder(this.name + "/" + subFolderBaseName);
        if (subFolder) {
            return true;
        }
        return false;
    }

    /**
     * @returns all files of the folder
     */
    public async getFiles(options?: FolderGetFilesOptions): Promise<File[]> {
        this.assertExistence();
        return await this.client.getFiles(this.name, options);
    }

    /**
     * creates a subfolder
     * @param subFolderBaseName  name of the subfolder basename
     */
    public async createSubFolder(subFolderBaseName: string): Promise<Folder> {
        this.assertExistence();
        return await this.client.createFolder(this.name + "/" + subFolderBaseName);
    }

    /**
     * get a file by basename
     * @param fileBaseName the base name of the file
     * @returns the file of null
     * @throws Error
     */
    public async getFile(fileBaseName: string): Promise<File | null> {
        this.assertExistence();
        return this.client.getFile(this.name + "/" + fileBaseName);
    }

    /**
     * creates a file in the folder
     * @param fileBaseName the base name of the file
     * @param data the buffer or stream with file content
     * @returns the new file or null
     * @throws Error
     */
    public async createFile(fileBaseName: string, data: Buffer | NodeJS.ReadableStream): Promise<File> {
        this.assertExistence();
        // must not contain :/\*"<>?
        debug("createFile fileBaseName = %s", fileBaseName);
        const invalidChars: string[] = [":", "*", "/", "\\", "\"", "?", "<", ">"];
        // debug("createFile invalidChars = %O", invalidChars);

        for (const invalidChar of invalidChars) {
            if (fileBaseName.indexOf(invalidChar) !== -1) {
                throw new ClientError("Filename contains an invalid character '" + invalidChar + "'",
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
        this.memento.deleted = true;
        return await this.client.deleteFolder(this.memento.name);
    }

    /**
     * renames or moves the current folder to the new location
     * target folder must exists
     * @param targetFolderName the name of the target folder /f1/f2/target
     * @throws Error
     */
    public async move(targetFolderName: string): Promise<Folder> {
        this.assertExistence();
        const folder: Folder = await this.client.moveFolder(this.name, targetFolderName);
        this.memento.name = folder.name;
        this.memento.baseName = folder.baseName;
        this.memento.lastmod = folder.lastmod;
        return this;
    }

    /**
     * @returns the url of the folder
     * @throws Error
     */
    public getUrl(): string {
        this.assertExistence();
        return this.client.getLink(this.name);
    }

    /**
     * @returns the url of the folder in the UI
     * @throws Error
     */
    public getUIUrl(): string {
        this.assertExistence();
        return this.client.getUILink(this.id);
    }

    /**
     * @returns true if the folder contains a file with the given basename
     * @param fileBaseName file basename
     * @throws Error
     */
    public async containsFile(fileBaseName: string): Promise<boolean> {
        this.assertExistence();
        let file: File | null;
        file = await this.getFile(fileBaseName);
        if (file) {
            return true;
        }
        return false;
    }

    /**
     * adds a tag name to the folder
     * @param tagName name of the tag
     */
    public async addTag(tagName: string): Promise<void> {
        return await this.client.addTagToFile(this.id, tagName);
    }

    /**
     * get tag names
     * @returns array of tag names
     */
    public async getTags(): Promise<string[]> {
        this.assertExistence();
        const map: Map<string, number> = await this.client.getTagsOfFile(this.id);
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
        this.assertExistence();
        const map: Map<string, number> = await this.client.getTagsOfFile(this.id);
        const tagNames: string[] = [];

        const tagId: number | undefined = map.get(tagName);
        if (tagId) {
            await this.client.removeTagOfFile(this.id, tagId);
        }
    }

    /**
     * add comment to folder
     * @param comment the comment
     */
    public async addComment(comment: string): Promise<void> {
        this.assertExistence();
        return await this.client.addCommentToFile(this.id, comment);
    }

    /**
     * get list of comments of folder
     * @param top number of comments to return
     * @param skip the offset
     * @returns array of comment strings
     * @throws Exception
     */
    public async getComments(top?: number, skip?: number): Promise<string[]> {
        this.assertExistence();
        return await this.client.getFileComments(this.id, top, skip);
    }

    private assertExistence(): void {
        if (this.memento.deleted) {
            throw new ClientError("Folder does not exist", "ERR_FOLDER_NOT_EXISTING");
        }
    }

}
