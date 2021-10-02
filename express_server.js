const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['abcdefghijkhnhsgdf', '12345qwerty!@#$%'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));


const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};
//users database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

/* Generates a random string*/
function generateRandomString() {
  let randomString = "";
  const length = 6;
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++)
  randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  return randomString;
}

// AUTHENTICATION HELPER FUNCTIONS

const findUserByEmail = function (email, users) {

  console.log(' request received to validate user ->',email);
  console.log('  available users ',users);
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      //console.log(user.email);
      return user;
    }
  }

  return false;
};


//Helper function
const urlsForUser = (id) => {
  const filteredURLs = {};
  const keys = Object.keys(urlDatabase);
  //console.log("keys", keys);
  for (let key of keys) {
    //console.log(urlDatabase[key]);
    if(urlDatabase[key]["userID"] === id ){
      
      filteredURLs[key] = urlDatabase[key];
    }
    //console.log("id", id);
    //console.log("urlid", urlDatabase[key]["userID"]);
  }
   return filteredURLs;
};




app.get("/", (req, res) => {
  //const id = req.cookies['user_id'];
  const id = getuser(req);
  const user = users[id];
  if (!user){
    return res.redirect("/login")
  }
  res.redirect("/urls");
  res.send("Hello!");
});

/*app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies['user_id']]};
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});*/

app.get("/urls", (req, res) => {
  // read the user id from the cookies
  //const userID = req.cookies['user_id'];
  const userID = getuser(req);
  //console.log(req.session);
  //console.log(userID);
  const user = users[userID]
  //console.log("user", user)
  // retrieve the user object from users db
  if(!user) {
    //return res.redirect("/login");
    return res.status(401).send("You must <a href='/login'>Login</a> first") ;
  }
  //userdatabase needs to pass if it is moved to helper file.
  const urls = urlsForUser(user.id);
  console.log("urls", urls)
  //const currentUser = users[userId];
  const templateVars = { urls, user };
  res.render("urls_index", templateVars);
});

/*app.get("/urls/new", (req, res) => {
  //if user then render otherwise redirect to login page
  if(req.cookies['user_id']){

    const user = users[req.cookies['user_id']];
    const templateVars = {user: user};
    //console.log("user" , user);
    //console.log(req.params);
    res.render("urls_new", templateVars);

  }else {
    res.redirect('/login');
  }
});*/

app.get("/urls/new", (req, res) => {
  console.log('request - > ',req);
  //const user = users[req.cookies['user_id']];
  const user = users[getuser(req)];
  //const templateVars = {userID: req.session.userID};

  const templateVars = {user: user};
  //console.log("user" , user);
  //console.log(req.params);
  res.render("urls_new", templateVars);
});
/*app.get("/urls/new", (req, res) => {
  // read the user id value from the cookies
  const userId = req.cookies['user_id'];
  if (!userId) {
    res.redirect("/login");
  
  // retrieve the user object from users db
  const currentUser = users[userId];
  const templateVars = { user: currentUser };
  res.render("urls_new", templateVars);
});*/


app.get("/urls/:shortURL", (req, res) => {
  //console.log(urlDatabase[req.params.shortURL].longURL);
  //console.log(req.params.shortURL === "b2xVn2")
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

/*app.post("/urls", (req, res) => {
  console.log(req.body.longURL);  // Log the POST request body to the console
  const longURL = req.body.longURL;
  
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});*/
/*app.get("/urls/new", (req, res) => {

  console.log(req.params);
  res.render("urls_new");
});*/



app.get("/urls", (req, res) => {
  //console.log("cookies", req.cookies);
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });
 /*app.get("/u/:shortURL", (req, res) => {
   const shortURL = req.params.shortURL

   const longURL = urlDatabase[shortURL].longURL
   res.redirect(longURL);
 });*/
 app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you are trying to access does not correspond with a long URL at this time.");
  }
});

 


 app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let userID = getuser(req);
  console.log("userID", userID)
  //urlDatabase[shortURL] = {};
  //console.log("shorturldb", urlDatabase[shortURL]);
  urlDatabase[shortURL] = {longURL, userID}
  //console.log("db", urlDatabase);
  //urlDatabase[shortURL] = {;
   // longURL: req.body.longURL,
  //};
  //console.log(urlDatabase);
  //res.send("ok");
  res.redirect(`/urls/${shortURL}`);
});

/*const userID = req.cookies['user_id'];
  //console.log(userID);
  const user = users[userID]
  //console.log("user", user)
  // retrieve the user object from users db
  if(!user) {
    return res.redirect("/login");
    //return res.status(401).send("You must <a href='/l//ogin'>Login</a> first") ;
  }
  //userdatabase needs to pass if it is moved to helper file.
  const urls = urlsForUser(user.id);
  console.log("urls", urls)
  //const currentUser = users[userId];
  const templateVars = { urls, user };
  res.render("urls_index", templateVars);*/


  //edit resource
  app.post("/urls/:shortURL", (req, res) => {
    console.log(' print me .... ')
    const userID = getuser(req);
    const user = users[userID]
    const userallowedurls =[];
    //validate user exists 
    if(!user) {
      //return res.redirect("/login");
      return res.status(401).send("You must <a href='/login'>Login</a> first") ;
    } 
    

    //get the urls this user is authorizer for 
    //userallowedurls = urlsForUser(user.id);

    //get the url from URL database

    //add if statement to ask if the shorturl in question does not belong to the user
     const urls = urlsForUser(user.id);
     console.log(urls);
    if(!urls) {
     return  res.status(401).send("You must <a href='/login'>Login</a> with correct credentials");
    }

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
  });

  //delete using post
  app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  });

  
//registering
app.get('/register', (req, res) => {
  console.log(' gagan: request received to register user .... ');
  console.log('request -> register -> ', req.session.user_id);
  //const id = req.cookies['user_id'];
  const templateVars = { user: users[req.session.user_id] };

    //res.redirect('/register');
    
    //const templateVars = {username: req.cookies["username"]};
    res.render('register', templateVars);
});

app.post("/register", (req, res) => {
  const userID = Math.random().toString(36).substring(2, 8);
  // Extract the email and password from the form
  // req.body (body-parser) => get the info from our form
  const email = req.body.email;
  const password = req.body.password;
  console.log(' request received to register user - > ', email + '  ' + password);
  const userFound = findUserByEmail(email, users);
  console.log(' Did user existed  ? ',userFound);

  console.log('userFound:', userFound);

  if (userFound) {
    res.status(400).send('Sorry, that user already exists!');
    console.log(' existing the register process >> 1 ');
    return;
  } 
   if(email === "" || password === ""){
    res.status(400).send('Please enter both email and password');
    console.log(' existing the register process >> 2 ');
    return;
  }

  console.log(' saving the new user -> ', userID + ' ' + req.body.email + '' +req.body.password);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  
  };
  
  // Setting the cookie in the user's browser
  //req.session('user_id', userID);
  req.session.user_id = userID;
  console.log(' setting user_id in session .. >> ', getuser(req));

  res.redirect('/urls');

  
 });



 const getuser = function ( req ){
    return req.session.user_id;
  }


 // login page - GET
 app.get("/login", (req, res) => {

  const templateVars = { user: null};
 res.render("urls_login", templateVars);
});

//login page post
app.post("/login", (req, res) => {
//const userID = Math.random().toString(36).substring(2, 8);

  //console.log(req.body);
const email = req.body.email;
//console.log("email", email);
//console.log("database", users);
const password = req.body.password;
const userFound = findUserByEmail(email, users);
console.log("userfound", userFound);
//if (userFound && userFound.password === //password) {
  if (userFound && bcrypt.compareSync(req.body.password, userFound.password)) {
  const userID = userFound.id;
  console.log("userid", userID);
  //res.cookie('user_id', userID);
  req.session.user_id = userID;
  console.log("sessionid", req.session.user_id);

  res.redirect('/urls');
} else
 res.status(403).send("Please enter correct email and password. Please <a href='/login'>Login</a>");

});
//logout
app.post("/logout", (req, res) => {
//res.clearCookie('user_id', {path:'/'});
res.clearCookie('session');
  res.clearCookie('session.sig');
res.redirect("/urls");
});


 //app is listening
 app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});