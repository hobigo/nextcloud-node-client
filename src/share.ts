
import Client, { ClientError } from "./client";

export default class Share {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
}
