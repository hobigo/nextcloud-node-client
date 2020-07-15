// tslint:disable:no-console
// typescript
// download folder structure asynchronously
import Client, {
    File,
    Folder,
    DownloadFolderCommand,
    DownloadFolderCommandOptions,
    SourceTargetFileNames,
    CommandStatus,
    CommandResultMetaData,
} from "../client";

(async () => {
    const client = new Client();
    const sourceFolder: Folder | null = await client.getFolder("Borstenson/Company");

    const options: DownloadFolderCommandOptions =
    {
        sourceFolder: sourceFolder!,
        filterFile: (file: File): File | null => {
            // download only PDFs
            if (file.mime === "application/pdf") {
                return file;
            }
            return null;
        },
        getTargetFileNameBeforeDownload:
            (fileNames: SourceTargetFileNames): string => { return "./tmp/" + fileNames.targetFileName }
    };
    const command: DownloadFolderCommand = new DownloadFolderCommand(client, options);
    command.execute();

    while (command.isFinished() !== true) {
        console.log(command.getPercentCompleted() + " %");
        // wait a second
        await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();
    }

    // use the result to do the needful
    const uploadResult: CommandResultMetaData = command.getResultMetaData();

    if (command.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
        console.log(command.getBytesDownloaded());
    } else {
        console.log(uploadResult.errors);
    }

})();
