const express = require('express');
const fs = require('fs');
const oracledb = require('oracledb');
const chokidar = require('chokidar');
const database = require('./db');
const folderPath = "E:\\Islam\\temp";
const app = express();


function readFiles() {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      files.forEach((file) => {
        console.log(file);
      });
    }
  });
}
readFiles()
// create a route to test the database connection
app.get('/', (req, res) => {
    
    res.send("Hello")
});


// const watcher = chokidar.watch(folderPath, {
//   persistent: true,
//   ignoreInitial: true,
// });
// watcher.on('all', (event, path) => {
//   console.log(event, path);
//   readFiles();
// });
// watcher
//   .on('add', path => console.log(`File ${path} has been added`))
//   .on('change', path => console.log(`File ${path} has been changed`))
//   .on('unlink', path => console.log(`File ${path} has been removed`))
//   .on('error', error => console.log(`Watcher error: ${error}`));
// start the server
app.listen(9000, () => {
  console.log('Server started on port 9000');
});