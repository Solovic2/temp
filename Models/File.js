const oracledb = require('oracledb');
const database = require("../db");

// Function to get path ID 
async function getPathID(path) {
    try {
      const getRowSql = `SELECT ID FROM COMPLAINS_FILES WHERE PATH = :1`;
      const getRow = await database.execute(getRowSql, [path]);
      return getRow.rows[0][0];
    } catch (err) {
      console.error(err);
    }
  }
  
  // Function to get path From ID 
  async function getPathFromID(id) {
    try {
      const getRowSql = `SELECT PATH FROM COMPLAINS_FILES WHERE ID = :1`;
      const getRow = await database.execute(getRowSql, [id]);
      return getRow.rows[0][0];
    } catch (err) {
      console.error(err);
    }
  }
  // Function to check if the path is already in database
  async function isDisabledFile(paths) {
    try {
      const inClause = paths.map(p => `'${p}'`).join(', ');
      const getRowSql = `SELECT PATH, INFO, FLAG FROM COMPLAINS_FILES WHERE PATH IN (${inClause})`;
      const getRow = await database.execute(getRowSql, []);
      return getRow.rows;
      
    } catch (err) {
      console.error(err);
    }
  }
  async function isFileInDB(path) {
    try {

      const getRowSql = `SELECT COUNT(PATH) FROM COMPLAINS_FILES WHERE (PATH = :1)`;
      const getRow = await database.execute(getRowSql, [path]);
      return getRow.rows[0] > 0;
    } catch (err) {
      console.error(err);
    }
  }
  // Function to get the data from database
  async function getData() {
    try {
      const getDataSql = `SELECT * FROM COMPLAINS_FILES`;
      const getDataRows = await database.execute(getDataSql,[]);
      let jsonData = [];
  
      for (let i = 0; i < getDataRows.rows.length; i++) {
        let row = getDataRows.rows[i];
      
        // create a new object for each row with the desired fields
        let newItem = {
          path: row[0],
          info: row[1],
          id : row[2],
          mobile: row[4],
          fileType: row[5],
          fileDate: row[6],
          
        };
      
        // add the new item to the JSON array
        jsonData.push(newItem);
      }
      return jsonData;
    } catch (err) {
      console.error(err);
    }
  }
  // Function to get the data today
  async function getDataToday(fileDate) {
    try {
      const getDataSql = `SELECT * FROM COMPLAINS_FILES WHERE FILEDATE = :1`;
      const getDataRows = await database.execute(getDataSql,[fileDate]);
      let jsonData = [];
  
      for (let i = 0; i < getDataRows.rows.length; i++) {
        let row = getDataRows.rows[i];
      
        // create a new object for each row with the desired fields
        let newItem = {
          path: row[0],
          info: row[1],
          id : row[2],
          mobile: row[4],
          fileType: row[5],
          fileDate: row[6],
          
        };
      
        // add the new item to the JSON array
        jsonData.push(newItem);
      }
      return jsonData;
    } catch (err) {
      console.error(err);
    }
  }
  // Function to add data to the database
  async function addData(path, info = '', flag = 1) {
    try {
      const insertSql = `INSERT INTO COMPLAINS_FILES (PATH, INFO, FLAG) VALUES (:1, :2, :3) RETURNING id INTO :output_id`;
      const getRow  = await database.execute(insertSql, [path, info, flag, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }]);
      console.log('Data added to database ' + path);
      return getRow.outBinds[0][0];
    } catch (err) {
      console.error(err);
    }
  }
  // Function to update data in the database
  async function updateData(info, path) {
    try {
      const updateSql = `UPDATE COMPLAINS_FILES SET INFO = :1 WHERE PATH = :2`;
      const updateRow= await database.execute(updateSql, [info, path]);
      console.log('Data updated in database');
    } catch (err) {
      console.error(err);
    }
  }

  async function updateFlag(flag, path) {
    try {
      const updateSql = `UPDATE COMPLAINS_FILES SET FLAG = :1 WHERE PATH = :2`;
      const updateRow = await database.execute(updateSql, [flag, path]);
      console.log('Data updated in database');
    } catch (err) {
      console.error(err);
    }
  }
  // Function to delete data from the database
  async function deleteData(path) {
    try{
      const deleteSql = `DELETE FROM COMPLAINS_FILES WHERE PATH = :1`;
      const deleteRow = await database.execute(deleteSql, [path]);
      console.log('Data deleted from database');
    } catch (err) {
      console.error(err);
    }
  }
  async function deleteAllData() {
    try{
      const deleteSql = `TRUNCATE TABLE COMPLAINS_FILES`;
      const deleteRow = await database.execute(deleteSql,[]);
      console.log('All Data deleted from database');
    } catch (err) {
      console.error(err);
    }
  }

  module.exports = { getPathFromID, getPathID, isDisabledFile,isFileInDB,updateFlag, getData, getDataToday, addData, updateData, deleteData, deleteAllData };