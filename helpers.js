/* Generates a random string*/
function generateRandomString() {
  let randomString = "";
  const length = 6;
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++)
  randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  return randomString;
}

// Authenticates user

const findUserByEmail = function (email, users) {

  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      //console.log(user.email);
      return user;
    }
  }
  return false;
};


//looking for urls for user
const urlsForUser = (id,urlDatabase) => {
  const filteredURLs = {};
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if(urlDatabase[key]["userID"] === id ){
       filteredURLs[key] = urlDatabase[key];
    }
  }
   return filteredURLs;
};

//setting cookies
const getuser = function ( req ){
  return req.session.user_id;
};



module.exports = { findUserByEmail, generateRandomString, urlsForUser, getuser };
