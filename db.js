const oracledb = require('oracledb');

// Define the database configuration parameters
const dbConfig = {
  user: 'complain',
  password: '123',
  connectString: '62.117.51.155:1521/xe',
};

async function execute(query, params) {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(query, params);
    await conn.commit();
    return result;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

// Function to get path 
async function getPathID(path) {
  try {
    const getRowSql = `SELECT ID FROM FILES WHERE PATH = :1`;
    const getRow = await execute(getRowSql, [path]);
    return getRow.rows[0][0];
  } catch (err) {
    console.error(err);
  }
}
// Function to check if the path is already in database
async function isDataInDataBase(path) {
  try {
    const getRowSql = `SELECT COUNT(PATH) FROM FILES WHERE PATH = :1`;
    const getRow = await execute(getRowSql, [path]);
    return getRow.rows[0] > 0;
  } catch (err) {
    console.error(err);
  }
}

// Function to get the data from database
async function getData() {
  try {
    const getDataSql = `SELECT * FROM FILES`;
    const getDataRows = await execute(getDataSql,[]);
    return getDataRows.rows;
  } catch (err) {
    console.error(err);
  }
}

// Function to add data to the database
async function addData(path, info = '', mobile = '', date = '', type = '') {
  try {
    const insertSql = `INSERT INTO FILES (PATH, INFO, MOBILE, FILEDATE, FILETYPE) VALUES (:1, :2, :3, :4, :5)`;
    const getRow  = await execute(insertSql, [path, info, mobile, date, type]);
    console.log('Data added to database ' + path);
  } catch (err) {
    console.error(err);
  }
}
// Function to update data in the database
async function updateData(id, path, info, datetime) {
  try {
    const updateSql = `UPDATE FILES SET PATH = :1, INFO = :2, DATETIME = :3 WHERE ID = :4`;
    const updateRow= await execute(updateSql, [path, info, datetime, id]);
    console.log('Data updated in database');
  } catch (err) {
    console.error(err);
  }
}
// Function to delete data from the database
async function deleteData(id) {
  try{
    const deleteSql = `DELETE FROM FILES WHERE ID = :1`;
    const deleteRow = await execute(deleteSql, [id]);
    console.log('Data deleted from database');
  } catch (err) {
    console.error(err);
  }
}

module.exports = { getPathID, isDataInDataBase, getData, addData, updateData, deleteData };