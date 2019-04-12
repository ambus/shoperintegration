# shoperintegration
Service to integration shoper online shop with local data.

Shoperintergration must communicate with the old DOS app. Communication will be done through changes to txt files.

### TODO
* [X] add logger to file§
* [X] add file watcher service to locate change in input file
* [X] refactor fileWatcher to use streams
    - [X] startWatch
    - [X] readFile
    - [X] deleteFile
    - [X] watchFile
* [ ] run fileWatcher on index.js
* [ ] add converter csv string to javascript object
* [ ] more..

