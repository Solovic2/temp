const express = require('express');
const oracledb = require('oracledb');
const executeQuery = require('./db');
const app = express();

async function getUsers() {
  const sql = 'SELECT * FROM files';
  const users = await executeQuery(sql);
  console.log(users);
}

// create a route to test the database connection
app.get('/', (req, res) => {
  
    res.send(getUsers())

});

// start the server
app.listen(9000, () => {
  console.log('Server started on port 3000');
});