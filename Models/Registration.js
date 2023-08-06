const database = require("../db");
const userModel = require("./User");

// Function to register
async function register(data) {
    try {
      data.role = "User";
      const id = await userModel.addUser(data);
      if(id ){
        const dataRows = await userModel.getUser(id);
        return dataRows;
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
      const getRowSql = `SELECT * FROM COMPLAINS_USERS WHERE USERNAME = :1`;
      const getRow = await database.execute(getRowSql, [username]);
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
  
  module.exports = {register, login};  