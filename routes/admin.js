const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware");
const userModel = require("../Models/User");
const bcrypt = require("bcrypt");
router.get("/users", isAdmin, async (req, res) => {
  const data = await userModel.getAllUsers();
  res.json(data);
});
router.post("/addUser", isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body.data;
    bcrypt.hash(password, 10, async function (err, hash) {
      // Store hash in database
      dataInfo = {
        username: username,
        password: hash,
        role: role,
      };
      const data = await userModel.addUser(dataInfo);
      if (data === 0) {
        res.status(400).json({ error: "هذا المستخدم موجود من قبل" });
      } else {
        const userData = {
          id: data,
          username: username,
          role: role,
        };
        res.json(userData);
      }
    });
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});
router.get("/edit/:id", isAdmin, async (req, res) => {
  const id = req.params.id;
  const data = await userModel.getUser(id);
  res.json(data);
});
router.post("/update/:id", isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { username, password, role } = req.body.data;
    let hashPassword = password;
    if (password !== "") {
      bcrypt.hash(password, 10, async function (err, hash) {
        hashPassword = hash;
        const data = [username, hashPassword, role];

        try {
          await userModel.updateUser(data, id);
        } catch (error) {
          res.status(400).json({ error: "هذا المستخدم موجود من قبل" });
        }
        console.log(`User : ${data.username} Updated With New Password!`);
        res.sendStatus(200);
      });
    } else {
      const data = [username, hashPassword, role];
      try {
        await userModel.updateUser(data, id);
        console.log(`User : ${data.username} Updated With Same Password!`);
        res.sendStatus(200);
      } catch (error) {
        res.status(400).json({ error: "هذا المستخدم موجود من قبل" });
      }
    }
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});
router.delete("/delete/:id", isAdmin, async (req, res) => {
  try {
    const deleteUser = await userModel.deleteUser(req.params.id);
    res.json(deleteUser);
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).send("Internal server error");
  }
});
module.exports = router;
