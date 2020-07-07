// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("GetFilesRecursivelyCommand");

import Client, { File, Folder } from "./client";
import Command, { CommandStatus } from "./command";

export interface GetFilesRecursivelyCommandOptions {
    sourceFolder: Folder;
    filterFile?: (file: File) => Promise<File | null>;
}

/**
 * Command to get all files of a nextcloud folder recursively
 */
export default class GetFilesRecursivelyCommand extends Command {
    private sourceFolder: Folder;
    private filterFile?: (file: File) => Promise<File | null>;
    private files: File[];

    /**
     * @param {Client} client the client
     * @param {SourceTargetFileNames[]} files the files to be uploaded
     * @param {(file: File) => void} processAfterUpload callback function to process the uploaded file
     */
    constructor(client: Client, options: GetFilesRecursivelyCommandOptions) {
        super(client);
        this.sourceFolder = options.sourceFolder;
        this.filterFile = options.filterFile;
        this.files = [];
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
            this.percentCompleted = 0;
            await this.addFilesOfFolder(this.sourceFolder, 100);
            console.log(this.files);
            console.log("file count", this.files.length);
            this.result.messages.push(`${this.files.length} files found`);
        } catch (e) {
            debug(e.message);
            this.result.errors.push(e.message);
        }

        this.percentCompleted = 100;
        if (this.result.errors.length > 0) {
            this.status = CommandStatus.failed;
        } else {
            this.status = CommandStatus.success;
        }
        this.result.bytesUploaded = 0;
        this.result.timeElapsed = new Date().getTime() - startTime.getTime();
        this.result.status = this.status;
        return;
    };

    /**
     * adds files of subfolders to the input file array
     * @param {Folder} folder the folder
     */
    private async addFilesOfFolder(folder: Folder, percentage: number): Promise<void> {
        // tslint:disable-next-line:no-console
        // console.log(folder.name);
        const folderFiles: File[] = await folder.getFiles();
        for (const fi of folderFiles) {
            this.files.push(fi);
        }

        const subFolders: Folder[] = await folder.getSubFolders();
        if (subFolders.length === 0) {
            this.percentCompleted += percentage;
        }
        for (const subFolder of subFolders) {
            // console.log("folder", subFolder.name);
            await this.addFilesOfFolder(subFolder, percentage / subFolders.length);
        }
        return;
    }
}
