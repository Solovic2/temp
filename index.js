const express = require('express');
const fs = require('fs');
const oracledb = require('oracledb');
const chokidar = require('chokidar');
const database = require('./db');
const folderPath = "E:\\Islam\\temp";
const app = express();


// element will be phoneNumber-day-month-year.[txt/wav]
// info => [phoneNumber or '', day-month-year, txt or wav]
const splitPath = (element) => {
  const path = element.split("\\");
  const splitter = path[path.length - 1].split('-');
  splitter[3] = splitter[3].split(".");
  const info = []
  if(splitter[0].length === 11 ){
      info.push(splitter[0])
  }else{
    info.push('')
  }
  info.push(splitter[1] + "-" + splitter[2] + "-" + splitter[3][0])
  info.push(splitter[3][1])
  return info;
};

// Get Files With Last Modified
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
    .then(async (sortedFiles) => {
        console.log(sortedFiles)
        for (let i = 0; i < sortedFiles.length; i++){
          if(!await database.isDataInDataBase(sortedFiles[i].path)){
            const data = splitPath(sortedFiles[i].path)
            await database.addData(sortedFiles[i].path, '', data[0], data[1], data[2])
          }else{
            console.log("this path is already in db")
          }
          
        }
      }
    )
    .catch((err) => console.error(err));

}
readAndPutIntoDB()




// create a route to test the database connection
app.get('/', async (req, res) => {
    const data = await database.getData();
    res.json(data)
});

// Watch files when add or delete
const watcher = chokidar.watch(folderPath, {
  persistent: true,
  ignoreInitial: true,
});
watcher
  .on('add', path => {
    console.log(`File ${path} has been added`)
    database.addData(path)
  })
  .on('unlink', async path => {
    console.log(`File ${path} has been removed`)
    const id = await database.getPathID(path)
    database.deleteData(id)
  })
  .on('error', error => console.log(`Watcher error: ${error}`));
// start the server
app.listen(9000, () => {
  console.log('Server started on port 9000');
});