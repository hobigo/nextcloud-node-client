
import NCClient, { NCError } from "./ncClient";

export default class NCFile {
    public name: string;
    public baseName: string;
    public lastmod: Date;
    public size: number;
    public mime: string;
    private id: number;
    private client: NCClient;
    constructor(client: NCClient, name: string, baseName: string, lastmod: string, size: number, mime: string) {
        this.client = client;
        this.name = name;
        this.baseName = baseName;
        this.lastmod = new Date(lastmod);
        this.size = size;
        this.mime = mime;
        this.id = -1;
    }
    /**
     * deletes a file
     * @throws Error
     */
    public async delete(): Promise<void> {
        return this.client.deleteFile(this.name);
    }

    /**
     * moves or renames the current file to the new location
     * target folder must exists
     * @param targetFileName the name of the target file /f1/f2/myfile.txt
     * @throws Error
     */
    public async move(targetFileName: string): Promise<NCFile> {
        const file: NCFile = await this.client.moveFile(this.name, targetFileName);
        this.name = file.name;
        this.baseName = file.baseName;
        this.lastmod = file.lastmod;
        this.mime = file.mime;
        this.size = file.size;
        return this;
    }

    /**
     * @returns the id of the file, -1 if the file has been deleted
     * @throws Error
     */
    public async getId(): Promise<number> {
        if (this.id === -1) {
            this.id = await this.client.getFileId(this.getUrl());
            if (this.id === -1) {
                throw new NCError("Error file has been deleted - no id", "ERR_FILE_WITHOUT_ID");
            }
        }
        return this.id;
    }

    /**
     * @returns the buffer of the file content
     * @throws Error
     */
    public async getContent(): Promise<Buffer> {
        return this.client.getContent(this.name);
    }

    /**
     * @returns the url of the file
     * @throws Error
     */
    public getUrl(): string {
        return this.client.getLink(this.name);
    }

    /**
     * @returns the url of the file in the UI
     * @throws Error
     */
    public async getUIUrl(): Promise<string> {
        return this.client.getUILink(await this.getId());
    }

    /**
     * adds a tag name to the file
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
     * add comment to file
     * @param comment the comment
     */
    public async addComment(comment: string): Promise<void> {
        return this.client.addCommentToFile(await this.getId(), comment);
    }

    /**
     * get list of comments of file
     * @param top number of comments to return
     * @param skip the offset
     * @returns array of comment strings
     * @throws Exception
     */
    public async getComments(top?: number, skip?: number): Promise<string[]> {
        return this.client.getFileComments(await this.getId(), top, skip);
    }

}
