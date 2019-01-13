
import NCClient from "./ncClient";

export default class NCTag {
    public id: number;
    public name: string;
    public visible: boolean;
    public assignable: boolean;
    public canAssign: boolean;
    private client: NCClient;
    constructor(client: NCClient, id: number, name: string, visible: boolean, assignable: boolean, canAssign: boolean) {
        this.client = client;
        this.name = name;
        this.visible = visible;
        this.assignable = assignable;
        this.canAssign = canAssign;
        this.id = id;
    }
    public async delete(): Promise<void> {
        return this.client.deleteTag(this.id);
    }
    public toString(): string {
        return "id:" + this.id + " name:" + this.name;
    }

}
