## Get files of a folder recursively
List all files of a given source folder including the complete subfolder structure. 
The command is used, to keep track of the file listing process as this can be a long running process.

### Example
Get all files of a source folder and filter only PDFs and JPGs.
This example shows asynchronous processing. Use await with the execute method for synchronous processing.

```typescript
// typescript
// get files recursively
import Client, {
    File, Folder,
    CommandResultMetaData, CommandStatus,
    GetFilesRecursivelyCommand,
    GetFilesRecursivelyCommandOptions,
} from "nextcloud-node-client";

(async () => {
    const client = new Client();

    const sourceFolder: Folder | null = await client.getFolder("/Borstenson/Company Information");
    if (!sourceFolder) {
        console.log("source folder not found");
        process.exit(1);
    }

    // only pdfs and jpg should be listed
    const fileFilterFunction = (file: File): File | null => {
        if (file.mime === "application/pdf" || file.mime === "image/jpeg") {
            return file;
        }
        return null;
    }

    const options: GetFilesRecursivelyCommandOptions = {
        sourceFolder,
        filterFile: fileFilterFunction,
    };

    const command: GetFilesRecursivelyCommand = new GetFilesRecursivelyCommand(client, options);
    // get files asynchronously (will not throw exceptions!)
    command.execute();

    // check the processing status as long as the command is running
    while (command.isFinished() !== true) {
        // wait one second
        await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();
        console.log(command.getPercentCompleted() + "%");
    }

    // use the result to do the needful
    const uploadResult: CommandResultMetaData = command.getResultMetaData();

    if (command.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
        for (const file of command.getFiles()) {
            console.log(file.name);
        }
    } else {
        console.log(uploadResult.errors);
    }

})();
```
