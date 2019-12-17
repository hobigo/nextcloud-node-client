
export class RequestLogEntry {
    public body?: string;
    public description: string;
    public jsonBody?: any;
    public method: string;
    public url: string;
    public constructor(url: string, method: string, description: string, body?: string) {
        this.url = url;
        this.method = method;
        this.description = description;
        this.body = body;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class ResponseLogEntry {
    public body?: string;
    public contentType?: string;
    public contentLocation?: string;
    public jsonBody?: any;
    public status: number;
    public constructor(status: number, body?: string, contentType?: string, contentLocation?: string) {
        this.status = status;
        this.body = body;
        this.contentType = contentType;
        this.contentLocation = contentLocation;
    }
}

// tslint:disable-next-line:max-classes-per-file
export default class RequestResponseLogEntry {
    public request: RequestLogEntry;
    public response: ResponseLogEntry;
    public constructor(request: RequestLogEntry, response: ResponseLogEntry) {
        this.request = request;
        this.response = response;
    }
}
