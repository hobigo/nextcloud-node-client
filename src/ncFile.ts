
import NCClient from "./ncClient";

export default class NCFile {
    public name: string;
    public baseName: string;
    public lastmod: Date;
    public size: number;
    public mime: string;
    private client: NCClient;
    constructor(client: NCClient, name: string, baseName: string, lastmod: string, size: number, mime: string) {
        this.client = client;
        this.name = name;
        this.baseName = baseName;
        this.lastmod = new Date(lastmod);
        this.size = size;
        this.mime = mime;
    }
    public async delete(): Promise<void> {
        return this.client.deleteFile(this.name);
    }

    public async move(targetFileName: string): Promise<NCFile> {
        const file: NCFile = await this.client.moveFile(this.name, targetFileName);
        this.name = file.name;
        this.baseName = file.baseName;
        this.lastmod = file.lastmod;
        this.mime = file.mime;
        this.size = file.size;
        return this;
    }
    public async getContent(): Promise<Buffer> {
        return this.client.getContent(this.name);
    }

    public getUrl(): string {
        return this.client.getLink(this.name);
    }
}
