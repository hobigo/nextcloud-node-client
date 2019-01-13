# nextcloud-node-client
The nextcloud node client provides a TypeScript/JavaScript API for node applications to access nextcloud remotely.

Basic file and folder operations and tagging are supported. 
The usage within browsers is not supported.

Tested with nextcloud 14.0.4 and 15.0.1

## Concepts
### Client 
The client is the root object and represents the connection to the nextcloud server.

### Folder
The folder is the representation of a nextcloud folder. It may contain many files. All files of a folder are deleted, if the folder is deleted.

### File
The file is the representation of a nextcloud file. Every file is contained in a folder.

### Tag
Tags are used to filter for file and folders. Tags can be created and assigned to files or folders.

## API overview
The API usage is currently not yet documented. 
Please refer to test file and the ``/docs`` folder with the generated documentation.

### Client
- factory method for client 
- create folder
- get folder
- create file
- get file
- create tag*
- get tags, by name, by id
- get quota
### Folder
- get name, id, base name, URL
- delete
- create sub folders 
- get sub folder
- create file
- get files
- add tag
- move/rename
### File
- get name, id, base name, URL
- get content
- delete
- add tag
- move/rename
### Tag
- get name, id
- delete*

\* admin permissions required

## Installation
``
npm install nextcloud-node-client
``

## Creating a client
Creating a client with credentials

```typescript
  // typescript
  import { ICredentials, NCClient } from "nextcloud-node-client";

  (async() => {
    const credentials: ICredentials = {
            basicAuth:
            {
                password: "<your password>",
                username: "<your user>",
            },
            url: "< nextcloud webdav url https://your-nextcloud-server.com/remote.php/webdav/>",
        };
    try {
        const client = await NCClient.clientFactory(credentials);
        //  do cool stuff with the client
    } catch (e) {
          // some error handling
    }
 })();
```

```javascript
  // javascript
  const NCClient = require("nextcloud-node-client").NCClient;

  (async() => {
    const credentials = {
            basicAuth:
            {
                password: "<your password>",
                username: "<your user>",
            },
            url: "< nextcloud webdav url https://your-nextcloud-server.com/remote.php/webdav/>",
        };
    try {
        const client = await NCClient.clientFactory(credentials);
        //  do cool stuff with the client
    } catch (e) {
          // some error handling
    }
 })();
```
## API
### Quota
```javascript
    q = await client.getQuota();  
    // { used: 479244777, available: 10278950773 }
```

### Create folder
```javascript
    // create folder
    const folder = await client.createFolder("/products/brooms");
    // create subfolder
    const subfolder = await folder.createSubFolder("soft brooms");
    // "/products/brooms/soft brooms"
    
```

### Get folder(s)
```javascript
    // get folder
    const folder = await client.getFolder("/products");
    // get subfolders
    const subfolders = await folder.getSubFolders();    
```

### Delete folder
```javascript
    // get folder
    const folder = await client.getFolder("/products");
    await folder.delete();
```
### Create file
```javascript
    const folder = await client.getFolder("/products");
    const file = folder.createFile("MyFile.txt", new Buffer("My new file"));
```
### Get file
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    // or
    const folder = await client.getFolder("/products");
    const file = await folder.getFile("MyFile.txt");
    // file: name, baseName, lastmod, size, mime
```
### Get file content
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    const buffer = await file.getContent();
```
### Get file Url
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    const url = await file.getUrl();
```
### Add tag to file
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    await file.addTag("myTag");
```
### Delete file
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    await file.delete();
```
### Get files
```javascript
    const folder = await client.getFolder("/products");
    const files = await folder.getFiles();
```
### Move and/or rename file
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    await file.move("/products/brooms/MyFileRenamed.txt");
```

## CloudFoundry Integration
Cloud foundry apps use the credentials provided in the environment.
Create a user provided service from a json file to store the credentials securely in the environment.

``
cf create-user-provided-service ups-nextcloud -p ./userProvidedService.json
``

Structure of the userProvidedService.json file

```
{
    "url": "<url - WebDAV endpoint of the nextcloud server>",
    "username": "<user name>",
    "password": "<password>"
}
```

## Development
set the NODE_ENV to "development" and locate the userProvidedService.json file in the root directory for local development.

Use ``npm run build-watch`` to build js files.

## Test

Use ``npm run test`` to execute automated tests
Use ``npm run test-d`` to execute automated tests with debug information

## License
Apache