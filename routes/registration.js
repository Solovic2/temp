const express = require("express");
const router = express.Router();
const registerationModel = require("../Models/Registration");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
router.post("/register", async (req, res) => {
  try {
    const info = req.body.data;
    let dataInfo = {};
    const saltRounds = 10;
    bcrypt.hash(info.password, saltRounds, async function (err, hash) {
      // Store hash in database
      dataInfo = {
        username: info.username,
        password: hash,
      };
      const data = await registerationModel.register(dataInfo);
      if (data === 0) {
        res.sendStatus(404);
      } else {
        const user = {
          data: data,
          loggedIn: true,
        };
        const options = {
          httpOnly: false,
          secure: true,
          signed: true,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        };
        const token = jwt.sign(
          { id: data.id, username: data.username, role: data.role },
          process.env.SECRET_KEY
        );
        res.cookie("user", token, options);
        res.status(200).json(user);
      }
    });
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body.data;

    const data = await registerationModel.login(username);
    if (data) {
      const match = await bcrypt.compare(password, data.password);
      if (match) {
        // Passwords match
        const user = {
          data: data,
          loggedIn: true,
        };

        const options = {
          httpOnly: false,
          secure: true,
          signed: true,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        };
        const token = jwt.sign(
          { id: data.id, username: data.username, role: data.role },
          process.env.SECRET_KEY
        );
        res.cookie("user", token, options);
        res.status(200).json(user);
      } else {
        // Passwords do not match, display error message
        res.status(400).json({ error: "كلمة السر غير صحيحة" });
      }
    } else {
      res
        .status(400)
        .json({ error: "إسم المستخدم ليس موجوداً الرجاء تسجيل الدخول" });
    }
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
