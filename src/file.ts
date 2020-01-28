
import path from "path";
import Client, { ClientError } from "./client";
import FileSystemElement from "./fileSystemElement";
import Folder from "./folder";

/**
 * The file class represents a file in nextcloud.
 * It exposes file properties and content handling, commenting and tagging
 */
export default class File implements FileSystemElement {
    private memento: {
        baseName: string,
        id: number,
        deleted: boolean,
        lastmod: Date,
        mime: string,
        name: string,
        size: number,
    };
    private client: Client;
    constructor(client: Client, name: string, baseName: string, lastmod: string, size: number, mime: string, id: number) {
        this.memento = {
            baseName,
            deleted: false,
            id,
            lastmod: new Date(lastmod),
            mime,
            name,
            size,
        };
        this.client = client;
    }
    /**
     * The name of the file including the path
     * The name is readonly
     */
    get name(): string {
        this.assertExistence();
        return this.memento.name;
    }

    /**
     * The base name of the file (file name without path)
     * The base name is readonly
     */
    get baseName(): string {
        this.assertExistence();
        return this.memento.baseName;
    }

    /**
     * The timestamp of the last file change
     * readonly
     */
    get lastmod(): Date {
        this.assertExistence();
        return this.memento.lastmod;
    }

    /**
     * The file size in bytes
     * readonly
     */
    get size(): number {
        this.assertExistence();
        return this.memento.size;
    }

    /**
     * The mime type (content type) of the file
     */
    get mime(): string {
        this.assertExistence();
        return this.memento.mime;
    }

    /**
     * The unique id of the file.
     */
    get id(): number {
        this.assertExistence();
        return this.memento.id;
    }

    /**
     * deletes a file
     * @throws Error
     */
    public async delete(): Promise<void> {
        this.memento.deleted = true;
        return await this.client.deleteFile(this.memento.name);
    }

    /**
     * get folder of the file
     * @throws ClientError
     * @returns the parent folder
     */
    public async getFolder(): Promise<Folder> {
        this.assertExistence();
        const folder: Folder | null = await this.client.getFolder(path.dirname((this.memento.name)));

        if (folder) {
            return folder;
        }
        throw new ClientError("Error, the folder of the file does not exist anymore", "ERR_FILE_FOLDER_DOES_NOT_EXIST");
    }

    /**
     * moves or renames the current file to the new location
     * target folder must exists
     * @param targetFileName the name of the target file /f1/f2/myfile.txt
     * @throws Error
     */
    public async move(targetFileName: string): Promise<File> {
        this.assertExistence();
        const file: File = await this.client.moveFile(this.name, targetFileName);
        this.memento.name = file.name;
        this.memento.baseName = file.baseName;
        this.memento.lastmod = file.lastmod;
        this.memento.mime = file.mime;
        this.memento.size = file.size;
        return this;
    }

    /**
     * @returns the buffer of the file content
     * @throws Error
     */
    public async getContent(): Promise<Buffer> {
        this.assertExistence();
        return this.client.getContent(this.name);
    }

    /**
     * @returns the url of the file
     * @throws Error
     */
    public getUrl(): string {
        this.assertExistence();
        return this.client.getLink(this.name);
    }

    /**
     * @returns the url of the file in the UI
     * @throws Error
     */
    public getUIUrl(): string {
        this.assertExistence();
        return this.client.getUILink(this.id);
    }

    /**
     * adds a tag name to the file
     * @param tagName name of the tag
     */
    public async addTag(tagName: string): Promise<void> {
        this.assertExistence();
        return this.client.addTagToFile(this.id, tagName);
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

        const tagId: number | undefined = map.get(tagName);
        if (tagId) {
            await this.client.removeTagOfFile(this.id, tagId);
        }
    }

    /**
     * add comment to file
     * @param comment the comment
     */
    public async addComment(comment: string): Promise<void> {
        this.assertExistence();
        return await this.client.addCommentToFile(this.id, comment);
    }

    /**
     * get list of comments of file
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
            throw new ClientError("File does not exist", "ERR_FILE_NOT_EXISTING");
        }
    }
}
