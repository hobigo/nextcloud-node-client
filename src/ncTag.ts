
import NCClient from "./ncClient";

export default class NCTag {
    public id: string;
    public name: string;
    private client: NCClient;
    constructor(client: NCClient, id: string, name: string) {
        this.client = client;
        this.name = name;
        this.id = id;
    }
    public async delete(): Promise<void> {
        return this.client.deleteTag(this.id);
    }
    public toString(): string {
        return "id:" + this.id + " name:" + this.name;
    }

}
