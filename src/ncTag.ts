
import NCClient from "./ncClient";

export default class NCTag {
    public readonly id: number;
    public readonly name: string;
    public readonly visible: boolean;
    public readonly assignable: boolean;
    public readonly canAssign: boolean;
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
        return await this.client.deleteTag(this.id);
    }
    public toString(): string {
        return "id:" + this.id + " name:" + this.name;
    }

}
