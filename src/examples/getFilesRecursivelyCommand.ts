// tslint:disable:no-console
// get files recursively
import Client, {
    File, Folder,
    CommandResultMetaData, CommandStatus,
    GetFilesRecursivelyCommand,
    GetFilesRecursivelyCommandOptions,
} from "../client";

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

    // check the processing status as long as the comman is running
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