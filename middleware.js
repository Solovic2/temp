// MiddleWare
const database = require('./db')
const requireAuth = async (req, res, next) => {
  console.log(req.cookies);
    const { user } = req.cookies;
    const userSession = user ? JSON.parse(user) : false;
    if(userSession){
        const user = await database.getUser(userSession.data.id);
        if (userSession.loggedIn === true 
            && user && user.role === userSession.data.role
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
    console.log(req.cookies);
    const { user } = req.cookies;
    const userSession = user ? JSON.parse(user) : false;
    if(userSession){
        const user = await database.getUser(userSession.data.id);
        if (userSession.loggedIn === true 
            && user && user.role === userSession.data.role && user.role === 'Admin'
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