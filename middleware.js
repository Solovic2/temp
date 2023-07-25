// MiddleWare
const database = require('./db')
const requireAuth = async (req, res, next) => {
    const userSession = req.session.user;
    if(req.session && userSession){
        const user = await database.getUser(userSession.data.id);
        console.log(user);
        // console.log(user);
        if (userSession.loggedIn === true 
            && user && user.role === userSession.data.role
            ) {
          // User is authenticated, proceed to next middleware
          return next();
        } else {
          // User is not authenticated, return unauthorized response
          return res.redirect('http://localhost:3000/');
        }
    }else {
        // User is not authenticated, return unauthorized response
        return res.redirect('http://localhost:3000/');
      }
    
  };
  
  const isAdmin = (req, res, next) => {
    console.log(req.session);
    if (req.session && req.session.user && req.session.user.data.role === 'Admin') {
      // User is authenticated, proceed to next middleware
      return next();
    } else {
      // User is not authenticated, return unauthorized response
      return res.status(401).json({ error: "Unauthorized" });
    }
  };

module.exports =  {requireAuth, isAdmin};