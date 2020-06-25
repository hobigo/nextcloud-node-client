// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("UploadFilesCommand");

import Client, { File } from "./client";
import Command, { CommandStatus } from "./command";
import util from "util";
import fs from "fs";

export interface ISourceTargetFileNames {
    sourceFileName: string;
    targetFileName: string;
}

export interface UploadFilesCommandOptions {
    files: ISourceTargetFileNames[];
    processFileAfterUpload?: (file: File) => Promise<void>;
}

/**
 * Command to upload a set or files from local file system to nextcloud
 */
export default class UploadFilesCommand extends Command {
    private files: ISourceTargetFileNames[];
    private processFileAfterUpload?: (file: File) => Promise<void>;

    /**
     * @param {Client} client the client
     * @param {ISourceTargetFileNames[]} files the files to be uploaded
     * @param {(file: File) => void} processAfterUpload callback function to process the uploaded file
     */
    constructor(client: Client, options:UploadFilesCommandOptions) {
        super(client);
        this.files = options.files;
        this.processFileAfterUpload = options.processFileAfterUpload;
    }

    /**
     * execute the command
     * @async
     * @returns {Promise<void>}
     */
    public async execute(): Promise<void> {
        this.status = CommandStatus.running;
        const startTime = new Date();
        try {
            const readfile = util.promisify(fs.readFile);
            let countCompleted = 0;
            this.percentCompleted = 0;
            let newFile: File | null;

            for (const file of this.files) {
                let data: Buffer;
                newFile = null;
                try {
                    data = await readfile(file.sourceFileName);
                    try {
                        newFile = await this.client.createFile(file.targetFileName, data);
                        this.result.messages.push(`${file.targetFileName}`);
                        this.result.bytesUploaded += data.length;
                    } catch (e) {
                        this.result.errors.push(`${file.targetFileName}: ${e.message}`);
                        debug(file.targetFileName, e);
                    }
                } catch (e) {
                    this.result.errors.push(`${file.targetFileName}: ${e.message}`);
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
            this.result.errors.push(e.message);
            this.percentCompleted = 100;
        }
        if (this.result.errors.length > 0) {
            this.status = CommandStatus.failed;
        } else {
            this.status = CommandStatus.success;
        }
        this.result.status = this.status;
        this.result.timeElapsed = new Date().getTime() - startTime.getTime();

        debug("execute finished", this.percentCompleted, this.status);

        return;
    };

}
