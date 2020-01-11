[![NPM Downloads](https://img.shields.io/npm/dm/nextcloud-node-client.svg?style=flat)](https://npmjs.org/package/nextcloud-node-client)
[![Dependency Status](https://david-dm.org/hobigo/nextcloud-node-client.svg?style=flat)](https://david-dm.org/hobigo/nextcloud-node-client)
[![codecov](https://codecov.io/gh/hobigo/nextcloud-node-client/branch/master/graph/badge.svg)](https://codecov.io/gh/hobigo/nextcloud-node-client)
# nextcloud-node-client
The nextcloud node client enables node.js applications to access nextcloud remotely using a rich TypeScript/JavaScript API.
## functional scope
* Folder and file operations
* Comments
* Tagging

*planned:*
* Events and event handler
* User management

## Quality
The module is under development and API may change until version 1.0.0 is delivered.
Tested with nextcloud 17.0.1

# Example
```typescript
  // typescript
  import Client, {File, Folder} from "nextcloud-node-client";

  (async() => {
    try {
        // create a new client using connectivity information from environment 
        const client = new Client();
        // create a folder structure
        const folder: Folder = await client.createFolder("folder/subfolder");
        // create file within the folder
        const file: File = await folder.createFile("myFile.txt", Buffer.from("My file content"));
        // add a tag to the file and create the tag if not existing
        await file.addTag("MyTag");
        // add a comment to the file
        await file.addComment("myComment");
        // get the file content
        const content: Buffer = await file.getContent();        
        // delete the folder including the file
        await folder.delete();
    } catch (e) {
          // some error handling
    }
 })();
```
# Documentation
* [Installation](##-installation)
* [Concepts](##-concepts)
* [Architecture](##-architecture)

## Concepts
The client comes with an object oriented API to access the APIs of nextcloud. The following object types are supported:
### Client 
The client is the root object and represents the connection to the nextcloud server. The client is used to get access to the root folder and the tag repository.

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
- get tags, add tag, remove tag
- add comment
- get comments
- move/rename
### File
- get name, id, base name, URL
- get content
- delete
- get tags, add tag, remove tag
- add comment
- get comments
- move/rename
### Tag
- get name, id
- delete*

\* admin permissions required

## Installation
``
npm install nextcloud-node-client
``

## Architecture

![alt text](https://raw.githubusercontent.com/hobigo/nextcloud-node-client/master/docs/media/ncnc-architecture.png)

## Security and access management
[Security and access management](docs/security_and_access_management.md)

[client](###-Client)

## Environment

## Creating a client
Creating a nextcloud client with reference to a service name

```typescript
  // typescript
  import { ICredentials, Client } from "nextcloud-node-client";

  (async() => {
    // service instance name from VCAP_SERVICES environment - "user-provided" section      
    const credentials: ICredentials = Client.getCredentialsFromEnv("myServiceInstanceName");
    try {
        const client = new Client(credentials.url, credentials.basicAuth);
        //  do cool stuff with the client
    } catch (e) {
          // some error handling
    }
 })();
```

```javascript
  // javascript
  const Client = require("nextcloud-node-client").Client;

  (async() => {
    // service instance name from VCAP_SERVICES environment - "user-provided" section      
    const credentials = Client.getCredentialsFromEnv("myServiceInstanceName");
    try {
        // service instance name from VCAP_SERVICES environment - "user-provided" section        
        const client = new Client(credentials.url, credentials.basicAuth);
        //  do cool stuff with the client
    } catch (e) {
          // some error handling
    }
 })();
```

Creating a nextcloud client with explicite credentials

```typescript
  // typescript
  import { Client } from "nextcloud-node-client";

  (async() => {
    try {
        const client = new Client("https://myNextcloudServer.com/remote.php/webdav", { username: "<my user>", password: "<my password>" } );
        //  do cool stuff with the client
    } catch (e) {
          // some error handling
    }
 })();
```

## Defining a nextcloud service instance
A nextcloud service instance is required to access the credentials of the nextcloud server.
Storing security configuration in the environment separate from code is based on The Twelve-Factor App methodology.
The service configuration is stored in the environment variable `VCAP_SERVICES` (refer to the Cloud Foundry documentation for details).
The nextcloud credentials are stored in the section for user provided services `user-provided`.
The client is able to access the service credentials by providing the instance name.

### template for VCAP_SERVICES

```
VCAP_SERVICES={
    "user-provided": [
        {
            "binding_name": null,
            "credentials": {
                "password": "<your password>",
                "url": "<your WebDAV url to nextcloud>",
                "username": "<your user name>"
            },
            "instance_name": "<your service instance name>",
            "label": "user-provided",
            "name": "<your service instance name>",
            "syslog_drain_url": "",
            "tags": [],
            "volume_mounts": []
        }
    ]
}
```

In one line

``
VCAP_SERVICES={
    "user-provided": [
        {
            "binding_name": null,
            "credentials": {
                "password": "<your password>",
                "url": "<your WebDAV url to nextcloud>",
                "username": "<your user name>"
            },
            "instance_name": "<your service instance name>",
            "label": "user-provided",
            "name": "<your service instance name>",
            "syslog_drain_url": "",
            "tags": [],
            "volume_mounts": []
        }
    ]
}
``

Find a template for a `.env` file in the root folder.

### CloudFoundry Integration
Cloud foundry apps use the credentials provided in the environment.
Create a user provided service from a json file to store the credentials securely in the environment.

cloud foundry command line:

``
cf create-user-provided-service myServiceInstanceName -p ./userProvidedService.json
``

Structure of the userProvidedService.json file

```
{
    "url": "<url - WebDAV endpoint of the nextcloud server>",
    "username": "<user name>",
    "password": "<password>"
}
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

## Development
set the NODE_ENV to "development" and locate the userProvidedService.json file in the root directory for local development.

Use ``npm run build-watch`` to build js files.

## Test

Use ``npm run test`` to execute automated tests
Use ``npm run test-d`` to execute automated tests with debug information

## License
Apache