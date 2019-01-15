# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

