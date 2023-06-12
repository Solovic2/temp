const express = require('express');
const fs = require('fs');
const oracledb = require('oracledb');
const chokidar = require('chokidar');
const database = require('./db');
const folderPath = "E:\\Islam\\temp";
const app = express();


function getSortedFilesByLastModifiedTime(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const filesWithTime = [];
        let count = files.length;
        files.forEach((file) => {
          const filePath = directoryPath + "\\" + file;
          fs.stat(filePath, (err, stats) => {
            if (err) {
              console.error(err);
            } else {
              filesWithTime.push({path: filePath ,name: file, time: stats.mtime.getTime() });
            }
            count--;
            if (count === 0) {
              const sortedFiles = filesWithTime.sort((a, b) => b.time - a.time);
              resolve(sortedFiles);
            }
          });
        });
      }
    });
  });
}

function readAndPutIntoDB(){
  getSortedFilesByLastModifiedTime(folderPath)
    .then((sortedFiles) => {
      sortedFiles.forEach(element => {
        database.addData(element.path)
      })
    }
    )
    .catch((err) => console.error(err));

}

readAndPutIntoDB()


// element will be phoneNumber-day-month-year.[txt/wav]
// info => [phoneNumber or '', day-month-year, txt or wav]
const splitString = (element) => {
  const splitter = element.split('-');
  splitter[3] = splitter[3].split(".");
  const info = []
  if(splitter[0].length === 11 ){
      info.push(splitter[0])
  }else{

  }
  info.push(splitter[1] + "-" + splitter[2] + "-" + splitter[3][0])
  info.push(splitter[3][1])
  return info;
};

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