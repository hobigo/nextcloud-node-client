
import NCClient from "./ncClient";

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
}
