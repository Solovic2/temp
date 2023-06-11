const oracledb = require('oracledb');

async function executeQuery(sql, binds = []) {
  let connection;
  const config = {
    user: 'complainments',
    password: '123',
    connectString: '62.117.51.154:1521/xe',
  };
  try {
    connection = await oracledb.getConnection(config);
    const result = await connection.execute(sql, binds, { outFormat: oracledb.OBJECT });
    return result.rows;
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

module.exports = executeQuery;