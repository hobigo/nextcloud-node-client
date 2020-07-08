## Upload 
Copy files from the file system to Nextcloud.
Upload multiple files or complete folders structures recursivley to Nextcloud with a single command.
As this process might take some time, the nextcloud-node-client supports also asynchronous processing.
Just create an upload command, execute the it and get the result, when the command has finsished. 

The command is used, to keep track of the upload process. The current processing state can be queried. Callback functions are supported to process the file after upload and to filter files before processing or to define the target file name. 

Check the examples and the class documentation (UploadFilesCommand and UploadFolderCommand).

### Upload Files Command
Copy files from the file system to Nextcloud.
Provide a list of source and traget file names and optionally a callback function to process the file after successful upload.

Example: Upload files synchronously
```typescript
// typescript
// upload files synchronously
import Client, {
    CommandResultMetaData, CommandStatus,
    UploadFilesCommand, SourceTargetFileNames,
} from "nextcloud-node-client";

(async () => {
    const client = new Client();

    // create a list of files to upload
    const files: SourceTargetFileNames[] = [
        {
            sourceFileName: "C:\\Users\\horst\\Documents\\Borstenson Company Profile.pdf",
            targetFileName: "/Company Info/Borstenson Company Profile.pdf"
        },
        // add even more files ...
    ];

    // create the command object
    const uc: UploadFilesCommand = new UploadFilesCommand(client, { files });

    // start the upload synchronously
    await uc.execute();

    // use the result to do the needful
    const uploadResult: CommandResultMetaData = uc.getResultMetaData();

    if (uc.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
        console.log(uc.getBytesUploaded());
    } else {
        console.log(uploadResult.errors);
    }

})();
```

Example: Upload files asynchronously and process file after upload
```typescript
// typescript
import Client, {
    File, CommandResultMetaData,
    CommandStatus, UploadFilesCommand,
    SourceTargetFileNames,
} from "nextcloud-node-client";

(async () => {
    const client = new Client();

    // create a list of files to upload
    const files: SourceTargetFileNames[] = [
        {
            sourceFileName: "C:\\Users\\horst\\Documents\\Borstenson Company Profile.pdf",
            targetFileName: "/Company Info/Borstenson Company Profile.pdf"            
        },
        // add even more files ...
    ];
    // define a callback to process the uploaded file optionally
    const processFileAfterUpload = async (file: File): Promise<void> => {
        // set a tag and a comment
        await file.addTag("Company");
        await file.addComment(`Hello ${file.baseName} your mime type is ${file.mime}`);
        // do even more fancy stuff ...
        return;
    };

    // create the command object
    const uc: UploadFilesCommand =
        new UploadFilesCommand(client, { files, processFileAfterUpload });

    // start the upload asynchronously (will not throw exceptions!)
    uc.execute();

    // check the processing status as long as the comman is running
    while (uc.isFinished() !== true) {
        // wait one second
        await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();
        console.log(uc.getPercentCompleted() + "%");
    }

    // use the result to do the needful
    const uploadResult: CommandResultMetaData = uc.getResultMetaData();

    if (uc.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
        console.log(uc.getBytesUploaded());
    } else {
        console.log(uploadResult.errors);
    }

})();
```

### Upload Folder Command
Copy all files of a folder structure from the file system to Nextcloud.

Example: Upload all files of a folder recursively and synchronously.
```typescript
// typescript
import Client, {
    CommandResultMetaData, CommandStatus, UploadFolderCommand,
} from "nextcloud-node-client";

(async () => {
    const client = new Client();

    // define a source folder
    const folderName: string = "c:\\Users\\horst\\Company";

    // create the command object
    const uc: UploadFolderCommand = new UploadFolderCommand(client, { folderName }
    );

    // start the upload synchronously
    await uc.execute();

    // use the result to do the needful
    const uploadResult: CommandResultMetaData = uc.getResultMetaData();

    if (uc.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
    } else {
        console.log(uploadResult.errors);
    }

})();
```

Example: Upload all files of a folder recursively and ignore "*.tmp" files. Add a tag and comment after successful file upload.
```typescript
// typescript
import Client, {
    File,
    CommandResultMetaData,
    CommandStatus,
    UploadFolderCommand,
    SourceTargetFileNames,
} from "nextcloud-node-client";

(async () => {
    const client = new Client();

    // define a source folder
    const folderName: string = "c:\\Users\\horst\\Company";

    // define a callback to process the uploaded file optionally
    const processFileAfterUpload = async (file: File): Promise<void> => {
        // set a tag and a comment
        await file.addTag("Company");
        await file.addComment(`Hello ${file.baseName} your mime type is ${file.mime}`);
        // do even more fancy stuff ...
        return;
    };

    // define a callback to determine the target file name
    // or to filter out files
    const getTargetFileNameBeforeUpload = (fileNames: SourceTargetFileNames): string => {
        // do not copy *.tmp files
        if (fileNames.sourceFileName.endsWith(".tmp")) {
            return "";
        }
        return `/Company Information${fileNames.targetFileName}`;
    };

    // create the command object
    const uc: UploadFolderCommand = new UploadFolderCommand(
        client, { folderName, getTargetFileNameBeforeUpload, processFileAfterUpload }
    );

    // start the upload asynchronously (will not throw exceptions!)
    uc.execute();

    // check the processing status as long as the comman is running
    while (uc.isFinished() !== true) {
        // wait one second
        await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();
        console.log(uc.getPercentCompleted() + "%");
    }

    // use the result to do the needful
    const uploadResult: CommandResultMetaData = uc.getResultMetaData();

    if (uc.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
        console.log(uc.getBytesUploaded());
    } else {
        console.log(uploadResult.errors);
    }

})();
```
