# nextcloud-node-client
The nextcloud node client provides a TypeScript/JavaScript api for node applications that access nextcloud remotely.

The client supports basic file and folder operations and tagging. 
The usage within browsers is not supported

## Concepts
### Client 
The client is the root object and represents the connection to the nextcloud server.

### Folder
The folder is the representation of a nextcloud folder. The folder may contain many files. All files of a folder are deleted, if the folder is deleted.

### File
The file is the representation of a nextcloud file. Every file is contained in a folder.

### Tag
Tags are used to filter for file and folders. Tags can be created and assigned to files or folders.

## API overview
The api usage is currently not yet documented. 
Please refer to test file and the docs folder with the generated documentation.

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
- get name, id, base name, url
- delete
- create sub folders 
- get sub folder
- create file
- get files
- add tag
- move/rename
### File
- get name, id, base name, url
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

## CloudFoundry Integration
Cloud foundry apps use the credentials provided in the environment.
Create a user provided service from a json file to store the credentials securely in the environment.

``
cf create-user-provided-service ups-nextcloud -p ./userProvidedService.json
``

Structure of the userProvidedService.json file

```
{
    "url": "<url endpoint of the WebDAV server>",
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