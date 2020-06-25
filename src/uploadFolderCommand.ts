// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("UploadFilesCommand");

import Client,
{
    File,
    FileSystemFolder,
    IFileNameFormats,
    UploadFilesCommand,
    UploadFilesCommandOptions,
    SourceTargetFileNames,
} from "./client";
import Command, { CommandStatus } from "./command";

export interface UploadFolderCommandOptions {
    folderName: string;
    getTargetFileNameBeforeUpload?: (fileNames: SourceTargetFileNames) => string;
    processFileAfterUpload?: (file: File) => Promise<void>;
}

/**
 * Command to upload the contents of a folder from local file system to nextcloud recursivley
 */
export default class UploadFolderCommand extends Command {
    private folderName: string;
    private processFileAfterUpload?: (file: File) => Promise<void>;
    private getTargetFileNameBeforeUpload: (fileNames: SourceTargetFileNames) => string;

    /**
     * @param {Client} client the client
     * @param {ISourceTargetFileNames[]} files the files to be uploaded
     * @param {(file: File) => void} processAfterUpload callback function to process the uploaded file
     */
    constructor(client: Client, options: UploadFolderCommandOptions) {
        super(client);
        this.folderName = options.folderName;
        this.processFileAfterUpload = options.processFileAfterUpload;
        if (options.getTargetFileNameBeforeUpload) {
            this.getTargetFileNameBeforeUpload = options.getTargetFileNameBeforeUpload;
        } else {
            this.getTargetFileNameBeforeUpload = (fileNames: SourceTargetFileNames): string => { return fileNames.targetFileName };
        }
    }

    /**
     * execute the command
     * @async
     * @returns {Promise<void>}
     */
    public async execute(): Promise<void> {
        this.status = CommandStatus.running;

        const fsf: FileSystemFolder = new FileSystemFolder(this.folderName);
        const fileNames: IFileNameFormats[] = await fsf.getFileNames();

        const files: SourceTargetFileNames[] = [];
        for (const fileNameFormat of fileNames) {
            const targetFileName = this.getTargetFileNameBeforeUpload({ sourceFileName: fileNameFormat.absolute, targetFileName: fileNameFormat.relative });
            // add only files with a target name
            if (targetFileName !== "") {
                files.push({ sourceFileName: fileNameFormat.absolute, targetFileName });
            }
        }

        const options: UploadFilesCommandOptions = { files, processFileAfterUpload: this.processFileAfterUpload };
        const uc: UploadFilesCommand = new UploadFilesCommand(this.client, options);
        uc.execute();

        // check the processing status
        while (uc.isFinished() !== true) {
            this.status = uc.getStatus();
            this.percentCompleted = uc.getPercentCompleted();
            // wait one second
            await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();
        }
        this.status = uc.getStatus();
        this.percentCompleted = uc.getPercentCompleted();
        this.result = uc.getResult();
        return;
    };

}
