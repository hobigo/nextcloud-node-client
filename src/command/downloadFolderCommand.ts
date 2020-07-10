// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("DownloadFilesCommand");

import Client,
{
    File,
    Folder,
    SourceTargetFileNames,
    CommandStatus,
    GetFilesRecursivelyCommand,
} from "../client";
import util from "util";
import fs from "fs";
import Command from "./command";
/**
 * options to create a download folder command
 */
export interface DownloadFolderCommandOptions {
    /**
     * The source folder with the file structure to be downloaded
     */
    sourceFolder: Folder;
    /**
     * function to filter files
     */
    filterFile?: (file: File) => File | null;
    /**
     * the function to determine the target file name having the sourece file name.
     * If the file should not be downloaded, return an empty string
     * @param {SourceTargetFileNames} fileNames source and target file names
     */
    getTargetFileNameBeforeDownload?: (fileNames: SourceTargetFileNames) => string;
}

/**
 * Command to download the contents of a folder from nextcloud to local file system recursively
 */
export default class DownloadFolderCommand extends Command {
    private sourceFolder: Folder;
    private getTargetFileNameBeforeDownload: (fileNames: SourceTargetFileNames) => string;
    private bytesDownloaded: number;
    private filterFile?: (file: File) => File | null;

    /**
     * @param {Client} client the client
     * @param {DownloadFolderCommandOptions} options constructor options
     */
    constructor(client: Client, options: DownloadFolderCommandOptions) {
        super(client);
        this.sourceFolder = options.sourceFolder;
        if (options.getTargetFileNameBeforeDownload) {
            this.getTargetFileNameBeforeDownload = options.getTargetFileNameBeforeDownload;
        } else {
            this.getTargetFileNameBeforeDownload = (fileNames: SourceTargetFileNames): string => { return fileNames.targetFileName };
        }
        this.filterFile = options.filterFile;
        this.bytesDownloaded = 0;
    }

    /**
     * execute the command
     * @async
     * @returns {Promise<void>}
     */
    protected async onExecute(): Promise<void> {
        this.status = CommandStatus.running;
        try {

            // determine all files to download
            // it is assumed that this command will use 20% of the time
            const command: GetFilesRecursivelyCommand =
                new GetFilesRecursivelyCommand(this.client,
                    { sourceFolder: this.sourceFolder, filterFile: this.filterFile });
            command.execute();

            // check the processing status as long as the command is running
            while (command.isFinished() !== true) {
                // wait a bit
                this.percentCompleted = command.getPercentCompleted() / 5;  // 20%
                await (async () => { return new Promise(resolve => setTimeout(resolve, 100)) })();
            }
            this.resultMetaData.messages.concat(command.getResultMetaData().messages);
            this.resultMetaData.errors.concat(command.getResultMetaData().errors);
            const files: File[] = command.getFiles();
            const writeFile = util.promisify(fs.writeFile);
            const mkdir = util.promisify(fs.mkdir);

            if (command.getStatus() === CommandStatus.failed) {
                this.resultMetaData = command.getResultMetaData();
                return;
            }

            let bytesToDownload: number = 0;
            for (const file of files) {
                bytesToDownload += file.size;
            }
            for (const file of files) {
                const targetFileName = this.getTargetFileNameBeforeDownload({ sourceFileName: file.name, targetFileName: "." + file.name });
                const content: Buffer = await file.getContent();
                const path: string = targetFileName.substring(0, targetFileName.lastIndexOf("/"));
                await mkdir(path, { recursive: true });
                await writeFile(targetFileName, content);
                this.bytesDownloaded += file.size;
                this.percentCompleted = (this.bytesDownloaded / bytesToDownload * 80) + 20;
            }
            this.resultMetaData.messages.push(files.length + " files downloaded");

        } catch (e) {
            debug(e.message);
            this.resultMetaData.errors.push(e.message);
        }
        this.percentCompleted = 100;
        if (this.resultMetaData.errors.length > 0) {
            this.status = CommandStatus.failed;
        } else {
            this.status = CommandStatus.success;
        }
        return;
    };

    public getBytesDownloaded(): number {
        return this.bytesDownloaded;
    }

}
