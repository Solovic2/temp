const express = require("express");
const router = express.Router();
const fs = require("fs");
const { requireAuth } = require("../middleware");
const fileModel = require("../Models/File");
const WebSocket = require("ws");
const chokidar = require("chokidar");
const folderPath = process.env.FOLDER_PATH;
// WebSocket for notification
const wss = new WebSocket.Server({ port: 8000 });
wss.on("connection", (ws) => {
  console.log("WebSocket connected");
});
// Watching Files
const watcher = chokidar.watch(folderPath, {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,
});
watcher
  .on("add", async (path) => {
    console.log(`File ${path} has been added`);
    const data = splitPath(path);
    let item = {
      type: "add",
      data: {
        path: path,
        info: "",
        mobile: data[0],
        fileDate: data[1],
        fileType: data[2],
      },
    };
    const message = JSON.stringify(item);
    wss.clients.forEach((client) => {
      client.send(message);
    });
  })
  .on("unlink", async (path) => {
    console.log(`File ${path} has been removed`);
    if (await fileModel.isFileInDB(path)) {
      await fileModel.deleteData(path);
    }

    let message = {
      type: "delete",
      data: {
        path: path,
      },
    };
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  })
  .on("error", (error) => console.log(`Watcher error: ${error}`));

// Split The Path
// element will be phoneNumber-day-month-year.[txt/wav]
// info => [phoneNumber or '', day-month-year, txt or wav]
const splitPath = (element) => {
  const path = element.split(/[\\\.]/);
  const splitter = path[path.length - 2].split("-");
  const info = [];
  if (splitter[0].length === 11) {
    info.push(splitter[0]);
    info.push(splitter[1] + "-" + splitter[2] + "-" + splitter[3]);
  } else {
    info.push("");
    info.push(splitter[0] + "-" + splitter[1] + "-" + splitter[2]);
  }
  info.push(path[path.length - 1]);
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
          if (count === 0) resolve(files);
          files.forEach((file) => {
            const filePath = directoryPath + "\\" + file;
            fs.stat(filePath, (err, stats) => {
              if (err) {
                console.error(err);
              } else {
                filesWithTime.push({
                  path: filePath,
                  name: file,
                  time: stats.mtime.getTime(),
                });
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
  // Read And Put Into Database
  async function readAllFiles(folderPath) {
    try {
      let allFiles = [];
      let paths = [];
      const sortedFiles = await getSortedFilesByLastModifiedTime(folderPath);
      for (let i = 0; i < sortedFiles.length; i++) {
        paths.push(sortedFiles[i].path);
      }
      const disabledFiles = await fileModel.isDisabledFile(paths);
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const data = splitPath(path);
        // Check if path exists in disabledFiles
        const index = disabledFiles.findIndex((df) => df[0] === path);
        if (index !== -1) {
          const fileData = {
            path: path,
            info: disabledFiles[index][1],
            mobile: data[0],
            fileDate: data[1],
            fileType: data[2],
          };
          allFiles.push(fileData);
        } else {
          const fileData = {
            path: path,
            info: "",
            mobile: data[0],
            fileDate: data[1],
            fileType: data[2],
          };
          allFiles.push(fileData);
        }
      }
      return allFiles;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
// Get Today Shakawa
function getDataToday(files, date) {
    try {
      let jsonData = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].fileDate === date) {
          jsonData.push(files[i]);
        }
      }
      return jsonData;
    } catch (err) {
      console.error(err);
    }
  }
// create a route to get data from the database
router.get("/", requireAuth, async (req, res) => {
  const files = await readAllFiles(folderPath);
  res.json(files);
});

// create a route to get data today
router.get("/dateToday/:date", requireAuth, async (req, res) => {
  try {
    const date = req.params.date;
    const files = await readAllFiles(folderPath);
    const data = getDataToday(files, date);
    res.json(data);
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});

// API For Get The File Text
router.get("/file/:filePath", requireAuth, (req, res) => {
  const filePath = folderPath + "\\" + req.params.filePath;
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send("File not found");
    } else {
      res.setHeader("Content-Type", "routerlication/octet-stream");
      res.setHeader("Content-Disposition", `attachment;`);
      res.send(data);
    }
  });
});

// API For Get The Audio File
router.get("/audio/:filePath", requireAuth, (req, res) => {
  const filePath = folderPath + "\\" + req.params.filePath;
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send("File not found");
    } else {
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(data);
    }
  });
});

// API To Update The Database With The New Reply
router.post("/update-complain/:path", requireAuth, async (req, res) => {
  try {
    const path = req.params.path;
    const { info } = req.body;
    if (await fileModel.isFileInDB(path)) {
      await fileModel.updateData(info, path);
    } else {
      await fileModel.addData(path, info, 0);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});
// API For Delete The Shakwa
router.post("/delete-complain/:path", requireAuth, async (req, res) => {
  try {
    const path = req.params.path;
    if (await fileModel.isFileInDB(path)) {
      await fileModel.updateFlag(1, path);
    } else {
      await fileModel.addData(path, "", 1);
    }
    console.log(`File: ${path} is hided Successfuly`);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error hidding card:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
