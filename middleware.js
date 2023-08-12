// MiddleWare
const userModel = require('./Models/User')
const jwt = require('jsonwebtoken');
const requireAuth = async (req, res, next) => {
    const  user  = req.signedCookies.user;
    const userCookie = user ? (user) : false;
    if(userCookie){
        // const token = req.signedCookies.user;
        const userToken = jwt.verify(userCookie, process.env.SECRET_KEY);
        const user = await userModel.getUser(userToken.id);
        if (user && user.role === userToken.role
            ) {
          // User is authenticated, proceed to next middleware
          return next();
        } else {
          // User is not authenticated, return unauthorized response
          return res.status(401).json({ error: "Unauthorized" });
        }
    }else {
        // User is not authenticated, return unauthorized response
        return res.status(401).json({ error: "User not found" });
      }
    
  };
  
  const isAdmin = async (req, res, next) => {
    const  user  = req.signedCookies.user;
    const userCookie = user ? (user) : false;
    
    if(userCookie){
      const userToken = jwt.verify(userCookie, process.env.SECRET_KEY);
        const user = await userModel.getUser(userToken.id);
        if (user && user.role === userToken.role && user.role === 'Admin'
            ) {
          // User is authenticated, proceed to next middleware
          return next();
        } else {
          // User is not authenticated, return unauthorized response
          return res.status(401).json({ error: "Unauthorized" });
        }
    }else {
        // User is not authenticated, return unauthorized response
        return res.status(401).json({ error: "User not found" });
    }
  };

module.exports =  {requireAuth, isAdmin};