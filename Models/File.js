const oracledb = require("oracledb");
const database = require("../db");

// Function to get paths which matches the paths in database
async function isDisabledFile(paths) {
  try {
    const inClause = paths.map((p) => `'${p}'`).join(", ");
    const getRowSql = `SELECT PATH, INFO, FLAG FROM COMPLAINS_FILES WHERE PATH IN (${inClause})`;
    const getRow = await database.execute(getRowSql, []);
    return getRow.rows;
  } catch (err) {
    console.error(err);
  }
}
// Function to check if File in DB
async function isFileInDB(path) {
  try {
    const getRowSql = `SELECT COUNT(PATH) FROM COMPLAINS_FILES WHERE (PATH = :1)`;
    const getRow = await database.execute(getRowSql, [path]);
    return getRow.rows[0] > 0;
  } catch (err) {
    console.error(err);
  }
}
// Function to add data to the database
async function addData(path, info = "", flag = 1) {
  try {
    const insertSql = `INSERT INTO COMPLAINS_FILES (PATH, INFO, FLAG) VALUES (:1, :2, :3) RETURNING id INTO :output_id`;
    const getRow = await database.execute(insertSql, [
      path,
      info,
      flag,
      { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    ]);
    console.log(`Path: ${path} added to database ` );
    return getRow.outBinds[0][0];
  } catch (err) {
    console.error(err);
  }
}
// Function to update data in the database
async function updateData(info, path) {
  try {
    const updateSql = `UPDATE COMPLAINS_FILES SET INFO = :1 WHERE PATH = :2`;
    const updateRow = await database.execute(updateSql, [info, path]);
    console.log("Info is updated in database");
  } catch (err) {
    console.error(err);
  }
}
// Function to update flag
async function updateFlag(flag, path) {
  try {
    const updateSql = `UPDATE COMPLAINS_FILES SET FLAG = :1 WHERE PATH = :2`;
    const updateRow = await database.execute(updateSql, [flag, path]);
    console.log("Flag is  updated in database");
  } catch (err) {
    console.error(err);
  }
}
// Function to delete data from the database
async function deleteData(path) {
  try {
    const deleteSql = `DELETE FROM COMPLAINS_FILES WHERE PATH = :1`;
    const deleteRow = await database.execute(deleteSql, [path]);
    console.log(`Data with path: ${path} has been deleted from database`);
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  isDisabledFile,
  isFileInDB,
  updateFlag,
  addData,
  updateData,
  deleteData,
};
