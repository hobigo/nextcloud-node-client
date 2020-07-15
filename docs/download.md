## Download 
Copy files from the Nextcloud to the file system.
Download files of a Nextcloud folder structure recursively to the file system with a single command.
As this process might take some time, the nextcloud-node-client supports also asynchronous processing.
Just create a download command, execute the it and get the result, when the command has finsished. 

The command is used, to keep track of the download process. The current processing state can be queried. Callback functions are supported to filter files before downloading and changing the target file names. 

### Download files of a folder command

Example: Download files of a folder asynchronously and apply filter
```typescript
// typescript
// download folder structure asynchronously
import Client, {
    File, Folder,
    DownloadFolderCommand, DownloadFolderCommandOptions,
    SourceTargetFileNames,
    CommandStatus, CommandResultMetaData,
} from "nextcloud-node-client";

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

```


