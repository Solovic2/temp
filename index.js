const express = require('express');
const fs = require('fs');
const oracledb = require('oracledb');
const chokidar = require('chokidar');
const bcrypt = require('bcrypt');
const database = require('./db');
const WebSocket = require('ws');
var cors = require('cors')
const folderPath = "C:\\Users\\islam\\Desktop\\temp";
const app = express();
app.use(express.json());
app.use(cors());

// WebSocket for notification
const wss = new WebSocket.Server({ port: 8000 });
wss.on('connection', (ws) => {
  console.log('WebSocket connected');
});


// Split The Path
// element will be phoneNumber-day-month-year.[txt/wav]
// info => [phoneNumber or '', day-month-year, txt or wav]
const splitPath = (element) => {
  const path = element.split(/[\\\.]/);
  console.log(path)
  const splitter = path[path.length - 2].split('-');
  const info = []
  if(splitter[0].length === 11 ){
      info.push(splitter[0])
      info.push(splitter[1] + "-" + splitter[2] + "-" + splitter[3])
  }else{
    info.push('')
    info.push(splitter[0] + "-" + splitter[1] + "-" + splitter[2])
  }
  info.push(path[path.length - 1])
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
// Read And Put Into Database
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




// create a route to get data from the database 
app.get('/', async (req, res) => {
    const data = await database.getData();
    res.json(data)
});

app.post('/register', async (req, res) => {
  try{
    const  info  = req.body.data;
    let dataInfo = {};
    const saltRounds = 10;
    bcrypt.hash(info.password, saltRounds, async function(err, hash) {
    // Store hash in database
    dataInfo = {
      username: info.username,
      password: hash,
    };
    const data = await database.register(dataInfo);
    if(data === 0){
      res.sendStatus(404)
    } 
    else {
      res.json(data)
    }
  });
  
  }
  catch (error) {
    console.error('Error updating database:', error);
    res.sendStatus(500);
  }
  
});
app.post('/login', async (req, res) => {
  try{
    const  {username, password}  = req.body.data;
  
    const data = await database.login(username);
    if(data){
      const match = await bcrypt.compare(password, data);
      if (match) {
        
        // Passwords match, redirect to dashboard
        res.json("Ok")
      } else {
        // Passwords do not match, display error message
         res.status(400).json({ error: 'كلمة السر غير صحيحة'});
      }
    } 
    else {
      res.status(400).json({ error: 'إسم المستخدم ليس موجوداً الرجاء تسجيل الدخول'});
    }  
  }
  catch (error) {
    console.error('Error updating database:', error);
    res.sendStatus(500);
  }
  
});
app.post('/login', async (req, res) => {
  const { username , password } = req.body;

 
  // Check if email exists in database
  // ...
  

  // Get hashed password from database
  const hash = '...'; // get hash from database
  const match = await bcrypt.compare(password, hash);

  if (match) {
    // Passwords match, redirect to dashboard
    res.redirect('/dashboard');
  } else {
    // Passwords do not match, display error message
    res.render('login', { error: 'Invalid email or password' });
  }
  console.log(dataInfo);
  const data = await database.register(dataInfo);
  res.json(data)

});

// create a route to get data today
app.get('/dateToday/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const data = await database.getDataToday(date)
    res.json(data)
  } catch (error) {
    console.error('Error updating database:', error);
    res.sendStatus(500);
  }
});

// API For Get The File Text
app.get('/file/:filePath', (req, res) => {
  const filePath = folderPath + "\\" +req.params.filePath;
  console.log(req.params.filePath)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send('File not found');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=${filePath}`);
      res.send(data);
    }
  });
});

// API For Get The Audio File
app.get('/audio/:filePath', (req, res) => {
  const filePath = folderPath + "\\" +req.params.filePath;
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send('File not found');
    } else {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(data);
    }
  });
});

// API To Update The Database With The New Reply
app.post('/update-complain/:id', async (req, res) => {
  
  try {
    const id = req.params.id;
    const  {info}  = req.body;
    await database.updateData(info, id)
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating database:', error);
    res.sendStatus(500);
  }
});
// API For Delete The Shakwa 
app.delete('/delete-complain/:id', async (req, res) => {
  try {
    const path = await database.getPathFromID(req.params.id);
    await fs.promises.unlink(path);
    console.log("File Deleted")

  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).send('Internal server error');
  }
});

// Watch files when add or delete
const watcher = chokidar.watch(folderPath, {
  persistent: true,
  ignoreInitial: true,
});
watcher
  .on('add', async path => {
    console.log(`File ${path} has been added`)
    const data = splitPath(path)
    console.log(data)
    const result = await database.addData(path, '', data[0], data[1], data[2])
    let item = {
      type: 'add',
      data : {
        path: path,
        info:'',
        id: result,
        mobile: data[0],
        fileDate: data[1],
        fileType: data[2]
      }
    };
    const message = JSON.stringify(item);
    wss.clients.forEach((client) => {
      client.send(message);
    });
  })
  .on('unlink', async path => {
    console.log(`File ${path} has been removed`)
    const id = await database.getPathID(path)
    await database.deleteData(id)
    let message = {
      type: 'delete',
      data : {
        id: id
      },
    }
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  })
  .on('error', error => console.log(`Watcher error: ${error}`));
// start the server
app.listen(9000, () => {
  console.log('Server started on port 9000');
});