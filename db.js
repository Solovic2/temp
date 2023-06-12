const oracledb = require('oracledb');

// Define the database configuration parameters
const dbConfig = {
  user: 'complain',
  password: '123',
  connectString: '62.117.51.155:1521/xe',
};

// Establish a database connection
async function connect() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('Connected to database');
    return connection;
  } catch (err) {
    console.error(err);
  }
}

// Function to get data to by ID
async function getData(id) {
  let connection;
  try {
    connection = await connect();
    const getRowSql = `SELECT ID FROM FILES WHERE ID = :1`;
    const getRow = await connection.execute(getRowSql, [id]);
    await connection.commit();
    return getRow
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
// Function to add data to the database
async function addData(path, info) {
  let connection;
  try {
    connection = await connect();
    const insertSql = `INSERT INTO FILES (PATH, INFO) VALUES (:1, :2)`;
    await connection.execute(insertSql, [path, info]);
    await connection.commit();
    console.log('Data added to database ' + path);
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

// Function to update data in the database
async function updateData(path, info, datetime, id) {
  let connection;
  try {
    connection = await connect();
    const updateSql = `UPDATE FILES SET PATH = :1, INFO = :2, DATETIME = :3 WHERE ID = :4`;
    await connection.execute(updateSql, [path, info, datetime, id]);
    await connection.commit();
    console.log('Data updated in database');
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

// Function to delete data from the database
async function deleteData(id) {
  let connection;
  try {
    connection = await connect();
    const deleteSql = `DELETE FROM FILES WHERE ID = :1`;
    await connection.execute(deleteSql, [id]);
    await connection.commit();
    console.log('Data deleted from database');
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

module.exports = { connect, addData, updateData, deleteData };