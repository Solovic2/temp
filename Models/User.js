
const oracledb = require('oracledb');
const database = require("../db");

// Function to get UserName
async function getUserName(username) {
    try {
      const getRowSql = `SELECT ID FROM COMPLAINS_USERS WHERE USERNAME = :1`;
      const getRow = await database.execute(getRowSql, [username]);
      // If there are a user.
      if( getRow.rows[0]){
        return getRow.rows[0][0];
      }else{
        return 0;   // If there aren't a user return 0.
      }
      
    } catch (err) {
      console.error(err);
    }
  }
  // Function to get User By UserID
  async function getUser(id) {
    try {
      
      const getRowSql = `SELECT * FROM COMPLAINS_USERS WHERE ID = :1`;
      const getRow = await database.execute(getRowSql, [id]);
      if (getRow.rows[0]) {
        const data = {
          id: getRow.rows[0][0],
          username: getRow.rows[0][1],
          role: getRow.rows[0][3]
        }
        return data;
      }
  
      return getRow.rows[0];
  
    } catch (err) {
      console.error(err);
    }
  }
  // Function to All Users 
  async function getAllUsers() {
    try {
      const getRowSql = `SELECT * FROM COMPLAINS_USERS`;
      const getRow = await database.execute(getRowSql, []);
      let jsonData = [];
      if (getRow.rows.length > 0) {
        for (let i = 0; i < getRow.rows.length; i++) {
          let row = getRow.rows[i];
      
          // create a new object for each row with the desired fields
          let newItem = {
            id: row[0],
            username: row[1],
            role: row[3],
          };
          // add the new item to the JSON array
          jsonData.push(newItem);
        }
      }
      
      return jsonData;
    } catch (err) {
      console.error(err);
    }
  }
  // Function to add user to the database
  async function addUser(data) {
    try {
      const isUser = await getUserName(data.username);
      if(!isUser){
        const {username, password, role} = data;
        const insertSql = `INSERT INTO COMPLAINS_USERS (USERNAME, PASSWORD, ROLE) VALUES (:1, :2, :3) RETURNING id INTO :output_id`;
        const getRow  = await database.execute(insertSql, [username, password, role, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }]);
        console.log('User added to database');
        return getRow.outBinds[0][0];
      }else{
        return 0;
      }
    } catch (err) {
      console.error(err);
    }
  }
  // Function to Update User
  async function updateUser(data, id) {
    try {
  
      let updateSql = `UPDATE COMPLAINS_USERS SET USERNAME = :1, ROLE = :2 WHERE ID = :3`;
      let params = [data[0], data[2],id]; 
      if(data[1] !== ''){
        updateSql = `UPDATE COMPLAINS_USERS SET USERNAME = :1, PASSWORD = :2, ROLE = :3 WHERE ID = :4`;
        params = [data[0], data[1], data[2], id]; 
      }
      const updateRow = await database.execute(updateSql, params);
      console.log('UserData updated in database');
    } catch (err) {
      res.status(400).json({ error: "This user already exists" });
    }
  }
  // Function to Delete User
  async function deleteUser(id) {
    try {
      const deleteSql = `DELETE FROM COMPLAINS_USERS WHERE ID = :1`;
      const deleteRow = await database.execute(deleteSql, [id]);
      console.log('Data deleted from database' + deleteRow.rowsAffected);
      return deleteRow.rowsAffected;
    } catch (err) {
      console.error(err);
    }
  }

  module.exports = {getAllUsers, getUser, getUserName,addUser,  updateUser, deleteUser};