# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.1.0 - 2020-01-28
### Added
- client.getSystemInfo
- sharing api: client.createShare

## 1.0.7 - 2020-01-16
- Readme documentation update and badges
- Documentation pages

## 1.0.2 - 2020-01-12
### Changed
- testing: extend tests to reach code coverage 100%
- incompatible api changes: rename of all class names, new client constructor

## 0.3.1 - 2019-03-25
### Changed
- refactoring: getQuota without webdav client
- refactoring: createFolder without webdav client
- refactoring: deleteFile without webdav client
- refactoring: moveFile without webdav client
- refactoring: moveFolder without webdav client
- refactoring: getContent without webdav client
- refactoring: stat without webdav client
- refactoring: putFileContents without webdav client
- refactoring: getFileDownloadLink without webdav client
- refactoring: webdav client removed - optimized for nextcloud and proxy usage

## 0.3.0 - 2019-03-21
### Changed
- incompatible api change: proxy in client constructor has a new type

## 0.2.0 - 2019-03-20
### Changed
- incompatible api change: constructor supports direct credentials and proxy instead of instance name only

## 0.1.9 - 2019-03-19
### Added
- optional proxy agent in constructor

## 0.1.8 - 2019-02-10
### Changed
- incompatible api change: Client factory method deleted. The client constructor has now the reference to the service instance name only. the documentation to define the service instance and the VCAP_SERVICES structure has been added
- usage of .env now supported in development
- new implementation of getDirectoryContents for performance reasons
### Fixed
- fixed bug: get user provided services instance from cloud foundry envionment vcap services

## 0.1.7 - 2019-01-27
### Added
- get UI link of file and folder
- get and remove tags of file and folder

## 0.1.6 - 2019-01-15
### Added
- examples in documentation
- new method folder.containsFile 
- add and get comments for file and folder
### Fixed
- fixed javascript example in read.me
- missing NCTag type export on NCClient

## 0.1.4 - 2019-01-13
### Added
- Support of subdirectories in nextcloud webdav url. Fixes the problem with tagging methods return a 404 
- Delete all tags
### Changed
- incompatible api change: Tag.id changed from string to number
### Fixed
- fixed performance problems getFile and getFolder
- fixed getTags returns exception if only one tag is available
- npm install not working properly

## 0.1.3 - 2019-01-09
### Added
- provide credentials in client factory
## 0.1.0 - 2019-01-09
### Added
- first initial version with apis for the client, file, folder and tags

