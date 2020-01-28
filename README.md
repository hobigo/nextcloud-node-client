# nextcloud-node-client
 <img src="https://raw.githubusercontent.com/hobigo/nextcloud-node-client/master/ncnc-logo.png" width="100"  style="max-width:100%;">

Access nextcloud remotely from node.js applications with a rich and simple TypeScript/JavaScript API.

![](https://github.com/hobigo/nextcloud-node-client/workflows/CI/badge.svg)
[![NPM Downloads](https://img.shields.io/npm/dm/nextcloud-node-client.svg?style=flat)](https://npmjs.org/package/nextcloud-node-client)
[![Dependency Status](https://david-dm.org/hobigo/nextcloud-node-client.svg?style=flat)](https://david-dm.org/hobigo/nextcloud-node-client)
[![codecov](https://codecov.io/gh/hobigo/nextcloud-node-client/branch/master/graph/badge.svg)](https://codecov.io/gh/hobigo/nextcloud-node-client)
[![Install Size](https://packagephobia.now.sh/badge?p=commander)](https://packagephobia.now.sh/result?p=nextcloud-node-client)
[![documentation](https://img.shields.io/website-up-down-green-red/https/hobigo.github.io/nextcloud-node-client.svg?label=documentation-website)](https://hobigo.github.io/nextcloud-node-client)
[![Gitter](https://badges.gitter.im/nextcloud-node-client/community.svg)](https://gitter.im/nextcloud-node-client/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)


The nextcloud node client supports folder and file operations including tagging and comments.
User management, event subscription and event handling is on the roadmap.

# Example
```typescript
// typescript
import Client, { File, Folder, Tag, } from "nextcloud-node-client";

(async () => {
    try {
        // create a new client using connectivity information from environment 
        const client = new Client();
        // create a folder structure if not available
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
        console.log(e);
    }
})();
```
# Documentation
* [Installation](##-installation)
* [Security and access management](##-security-and-access-management)
* [Concepts](##-concepts)
* [API](##-api)
* [Architecture](##-architecture)

## Installation
``
npm install nextcloud-node-client
``

## Security and access management
The client requires the WebDAV url of the nextcloud server and the credentials. 

Use an app specific password generated in the security - devices & sessions section of the nextcloud settings.

### Environment
Credentials can be specified in the environment:
```
NEXTCLOUD_USERNAME= "<your user name>"
NEXTCLOUD_PASSWORD = "<your password>"
NEXTCLOUD_URL= "https://<your nextcloud host>/remote.php/webdav"
```

The cloud service configuration `VCAP_SERVICES` can be used alternativley (refer to the Cloud Foundry documentation for details).

The nextcloud credentials are stored in the section for user provided services `user-provided`.
The client is able to access the service credentials by providing the instance name.
```json
{
    "user-provided": [
        {
            "credentials": {
                "password": "<your password>",
                "url": "https://<your nextcloud host>/remote.php/webdav",
                "username": "<your user name>"
            },
            "name": "<your service instance name>"
        }
    ]
}
```

### Creating a client
Creating a nextcloud client 

```typescript
  // uses the environment to initialize
  import Client from "nextcloud-node-client";
  const client = new Client();
```

```typescript
  // uses explicite credentials
  import Client, { Server } from "nextcloud-node-client";
  const server: Server = new Server(
            { basicAuth:
                { password: "<your password>",
                  username: "<your user name>",
                },
                url: "https://<your nextcloud host>/remote.php/webdav",
            });

  const client = new Client(server);
```

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

## API
This is an overview of the client API.
Details can be found in the [API docs](https://hobigo.github.io/nextcloud-node-client)


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

### API Examples
#### Quota
```typescript
    const q: IQuota = await client.getQuota();  
    // { used: 479244777, available: 10278950773 }
```

#### Sytem information
```typescript
    const si: ISystemInfo = await client.getSystemInfo();  
```

#### Create folder
```typescript
    // create folder
    const folder: Folder = await client.createFolder("/products/brooms");
    // create subfolder
    const subfolder: Folder = await folder.createSubFolder("soft brooms");
    // "/products/brooms/soft brooms"
    
```

#### Get folder(s)
```typescript
    // get folder
    const folder: Folder = await client.getFolder("/products");
    // get subfolders
    const subfolders: Folder[] = await folder.getSubFolders();    
```

#### Delete folder
```typescript
    // get folder
    const folder: Folder = await client.getFolder("/products");
    await folder.delete();
```
#### Create file
```javascript
    const folder = await client.getFolder("/products");
    const file = folder.createFile("MyFile.txt", new Buffer("My new file"));
```
#### Get file
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    // or
    const folder = await client.getFolder("/products");
    const file = await folder.getFile("MyFile.txt");
    // file: name, baseName, lastmod, size, mime
```
#### Get file content
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    const buffer = await file.getContent();
```
#### Get file Url
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    const url = await file.getUrl();
```
#### Add tag to file
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    await file.addTag("myTag");
```
#### Delete file
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    await file.delete();
```
#### Get files
```javascript
    const folder = await client.getFolder("/products");
    const files = await folder.getFiles();
```
#### Move and/or rename file
```javascript
    const file = await client.getFile("/products/MyFile.txt");
    await file.move("/products/brooms/MyFileRenamed.txt");
```

#### Create, change and delete a share
```typescript
    const file = await client.getFile("/products/MyFile.txt");
    // share the file (works also for folder)
    const createShare: ICreateShare = { fileSystemElement: file };
    const share: Share = await client.createShare(createShare);
    await share.setPassword("some password");
    await share.setNote("some note\nnew line");
    await share.setExpiration(new Date(2020, 11, 5));        
    await share.delete();
```


## Architecture
The nextcloud node client can be used by node applications to extend the nextcloud functionality remotely. The client uses only HTTP apis of nextcloud for access.


![alt text](https://raw.githubusercontent.com/hobigo/nextcloud-node-client/master/ncnc-architecture.png)


## Quality
Tested with nextcloud 17.0.1, 18.0.0

## License
Apache