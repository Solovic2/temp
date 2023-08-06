const oracledb = require('oracledb');
// Define the database configuration parameters
const dbConfig = {
  user: 'complains',
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

module.exports = { execute };