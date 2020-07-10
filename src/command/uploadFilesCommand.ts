// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("UploadFilesCommand");

import Client, { File } from "../client";
import Command, { CommandStatus } from "./command";
import util from "util";
import fs from "fs";

export interface SourceTargetFileNames {
    sourceFileName: string;
    targetFileName: string;
}

export interface UploadFilesCommandOptions {
    files: SourceTargetFileNames[];
    processFileAfterUpload?: (file: File) => Promise<void>;
}

/**
 * Command to upload a set or files from local file system to nextcloud
 */
export default class UploadFilesCommand extends Command {
    private files: SourceTargetFileNames[];
    private processFileAfterUpload?: (file: File) => Promise<void>;
    private bytesUploaded: number;

    /**
     * @param {Client} client the client
     * @param {SourceTargetFileNames[]} files the files to be uploaded
     * @param {(file: File) => void} processAfterUpload callback function to process the uploaded file
     */
    constructor(client: Client, options: UploadFilesCommandOptions) {
        super(client);
        this.files = options.files;
        this.bytesUploaded = 0;
        this.processFileAfterUpload = options.processFileAfterUpload;
    }

    /**
     * execute the command
     * @async
     * @returns {Promise<void>}
     */
    protected async onExecute(): Promise<void> {
        this.status = CommandStatus.running;
        try {
            const readfile = util.promisify(fs.readFile);
            let countCompleted = 0;

            this.percentCompleted = 0;
            if (this.files.length === 0) {
                this.percentCompleted = 100;
            }

            let newFile: File | null;

            for (const file of this.files) {
                let data: Buffer;
                newFile = null;
                try {
                    data = await readfile(file.sourceFileName);
                    try {
                        newFile = await this.client.createFile(file.targetFileName, data);
                        this.resultMetaData.messages.push(`${file.targetFileName}`);
                        this.bytesUploaded += data.length;
                    } catch (e) {
                        this.resultMetaData.errors.push(`${file.targetFileName}: ${e.message}`);
                        debug(file.targetFileName, e);
                    }
                } catch (e) {
                    this.resultMetaData.errors.push(`${file.targetFileName}: ${e.message}`);
                }

                countCompleted++;
                this.percentCompleted = Math.round(countCompleted / this.files.length * 100);
                debug(" completed:" + this.percentCompleted + "%");

                if (newFile && this.processFileAfterUpload) {
                    await this.processFileAfterUpload(newFile);
                }
            }

        } catch (e) {
            debug(e.message);
            this.resultMetaData.errors.push(e.message);
            this.percentCompleted = 100;
        }
        if (this.resultMetaData.errors.length > 0) {
            this.status = CommandStatus.failed;
        } else {
            this.status = CommandStatus.success;
        }

        debug("execute finished", this.percentCompleted, this.status);

        return;
    };

    public getBytesUploaded(): number {
        return this.bytesUploaded;
    }

}
