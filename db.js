const oracledb = require('oracledb');
// Define the database configuration parameters
const dbConfig = {
  user: 'complain',
  password: '123',
  connectString: 'localhost:1521/xe',
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

// Function to register
async function register(data) {
  try {
    // console.log(data.username);
    const isUser = await getUserName(data.username);
    console.log(isUser + " ddd");
    if(!isUser){
      const insertSql = `INSERT INTO USERS (USERNAME, PASSWORD, ROLE) VALUES (:1, :2, :3) RETURNING id INTO :output_id`;
      const getRow  = await execute(insertSql, [data.username, data.password, "User", { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }]);
      console.log('User added to database ' );
      return getRow.outBinds[0][0];
    }else{
      return 0;
    }
    
  } catch (err) {
    console.error(err);
  }
}

// Function to login
async function login(username) {
  try {
    const getRowSql = `SELECT * FROM USERS WHERE USERNAME = :1`;
    const getRow = await execute(getRowSql, [username]);
    if(getRow.rows[0]){
      const data = {
        id : getRow.rows[0][0],
        username:getRow.rows[0][1],
        password: getRow.rows[0][2],
        role: getRow.rows[0][3]
      }
      return data;
    }
    
    return getRow.rows[0];
  } catch (err) {
    console.error(err);
  }
}

// Function to get UserName
async function getUserName(username) {
  try {
    const getRowSql = `SELECT ID FROM USERS WHERE USERNAME = :1`;
    const getRow = await execute(getRowSql, [username]);
    return getRow.rows[0][0];
  } catch (err) {
    console.error(err);
  }
}
// Function to get User By UserID
async function getUser(id) {
  try {
    
    const getRowSql = `SELECT * FROM USERS WHERE ID = :1`;
    const getRow = await execute(getRowSql, [id]);
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
    const getRowSql = `SELECT * FROM USERS`;
    const getRow = await execute(getRowSql, []);
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
// Function to add data to the database
async function addUser(data) {
  try {
    const isUser = await getUserName(data.username);
    if(!isUser){
      const {username, password, role} = data;
      const insertSql = `INSERT INTO USERS (USERNAME, PASSWORD, ROLE) VALUES (:1, :2, :3) RETURNING id INTO :output_id`;
      const getRow  = await execute(insertSql, [username, password, role, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }]);
      console.log(getR);
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

    let updateSql = `UPDATE USERS SET USERNAME = :1, ROLE = :2 WHERE ID = :3`;
    let params = [data[0], data[2],id]; 
    if(data[1] !== ''){
      updateSql = `UPDATE USERS SET USERNAME = :1, PASSWORD = :2, ROLE = :3 WHERE ID = :4`;
      params = [data[0], data[1], data[2], id]; 
    }
    const updateRow = await execute(updateSql, params);
    console.log('UserData updated in database');
  } catch (err) {
    console.error(err);
  }
}
// Function to Delete User
async function deleteUser(id) {
  try {
    const deleteSql = `DELETE FROM USERS WHERE ID = :1`;
    const deleteRow = await execute(deleteSql, [id]);
    console.log('Data deleted from database' + deleteRow.rowsAffected);
    return deleteRow.rowsAffected;
  } catch (err) {
    console.error(err);
  }
}

// Function to get path ID 
async function getPathID(path) {
  try {
    const getRowSql = `SELECT ID FROM FILES WHERE PATH = :1`;
    const getRow = await execute(getRowSql, [path]);
    return getRow.rows[0][0];
  } catch (err) {
    console.error(err);
  }
}

// Function to get path From ID 
async function getPathFromID(id) {
  try {
    const getRowSql = `SELECT PATH FROM FILES WHERE ID = :1`;
    const getRow = await execute(getRowSql, [id]);
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
    const getDataSql = `SELECT * FROM FILES WHERE FILEDATE = :1`;
    const getDataRows = await execute(getDataSql,[fileDate]);
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
async function addData(path, info = '', mobile = '', date = '', type = '') {
  try {
    const insertSql = `INSERT INTO FILES (PATH, INFO, MOBILE, FILEDATE, FILETYPE) VALUES (:1, :2, :3, :4, :5) RETURNING id INTO :output_id`;
    const getRow  = await execute(insertSql, [path, info, mobile, date, type, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }]);
    console.log('Data added to database ' + path);
    return getRow.outBinds[0][0];
  } catch (err) {
    console.error(err);
  }
}
// Function to update data in the database
async function updateData(info, id) {
  try {
    const updateSql = `UPDATE FILES SET INFO = :1 WHERE ID = :2`;
    const updateRow= await execute(updateSql, [info, id]);
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

module.exports = { register, login, getAllUsers, getUser, getUserName,addUser,  updateUser, deleteUser, getPathFromID, getPathID, isDataInDataBase, getData, getDataToday, addData, updateData, deleteData };