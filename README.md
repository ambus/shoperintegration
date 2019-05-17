# shoperintegration ![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/ambus/shoperintegration.svg?style=for-the-badge)
Service to integration shoper online shop with local data.

Shoperintergration must communicate with the old DOS app. Communication will be done through changes on txt files.

### TODO
* [X] add logger to file
* [X] add file watcher service to locate change in input file
* [X] refactor fileWatcher to use streams
    - [X] startWatch
    - [X] readFile
    - [X] deleteFile
    - [X] watchFile
* [X] add converter csv string to javascript object
* [X] run fileWatcher on index.js
* [X] add tokenGenerator function
* [X] repair webpack build
* [X] add service to get token from shoper api
* [ ] add shoperStock service
    - [x] get the connection token
    - [x] retry if catch error
    - [X] if catch error retry run task the specified numbers of times
    - [X] if task always return error send @ to specific persons - from config
    - [X] get item form shoper to compare
    - [X] send new data to shoper
* [X] fix email message when stream catch error and complite stream
* [ ] fix email sendMessage - inside use SendMessageObservable
* [ ] add info about version on tag (like lazygit repo)
* [ ] more..

### Stats
#### GitHub commit activity
![GitHub last commit](https://img.shields.io/github/last-commit/ambus/shoperintegration.svg?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/ambus/shoperintegration.svg?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/ambus/shoperintegration.svg?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/ambus/shoperintegration.svg?style=for-the-badge)

#### File Size
![GitHub repo size](https://img.shields.io/github/repo-size/ambus/shoperintegration.svg?style=for-the-badge)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ambus/shoperintegration.svg?style=for-the-badge)