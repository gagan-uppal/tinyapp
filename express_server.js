const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { findUserByEmail, generateRandomString, urlsForUser, getuser } = require('./helpers');

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
};


app.get("/", (req, res) => {
  const id = getuser(req);
  const user = users[id];
  if (!user){
    return res.redirect("/login")
  }
  res.redirect("/urls");
});


//takes to urls
app.get("/urls", (req, res) => {
  const userID = getuser(req);
  const user = users[userID]
  if(!user) {
    return res.status(401).redirect("/login");
  }
  const urls = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls, user };

  res.render("urls_index", templateVars);
});


//create new urls
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!userId) {
    return res.status(401).redirect("/login");
  }
  const templateVars = {user};
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send("<h1>You Are Not Logged In <a href='/login'>Go Back</a></h1>");
  }

  const shortURL = req.params.shortURL;
  const urlObj = urlDatabase[shortURL];

  if (!urlObj) {
    return res.status(403).send("Unable to find URL");
  }

  if (urlObj.userID !== userId) {
    return res.status(403).send("You Do Not Have Right Access");
  }

  const longURL = urlObj.longURL;
  const user = users[userId];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
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

 
 app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("Page not found");
  }
  res.redirect(url.longURL);
});

 //post request /urls
 app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let userID = getuser(req);

  if (!userID) {
    return res.status(400).send("Not Allowed to Access");
  }

  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

  //edit resource
app.post("/urls/:shortURL", (req, res) => {
  const userID = getuser(req);

  if (!userID) {
    return res.status(403).send("<h1>You Need To Log In First</h1>");
  }

  const shortURL = req.params.shortURL;
  const urlObj = urlDatabase[shortURL];
  if (userID !== urlObj.userID) {
   return res.status(403).send("<h1>You do not have access rights</h1>");
  }

  urlObj.longURL = req.body.longURL;
    res.redirect('/urls');
  });

  //delete using post
  app.post("/urls/:shortURL/delete", (req, res) => {
    const userID = req.session.user_id;
    if (!userID) {
      return res.status(403).send("<h1>You Need To Log In</h1>");
  }

   const shortURL = req.params.shortURL;
   const urlObj = urlDatabase[shortURL];
   if (!urlObj) {
    return res.status(403).send("<h1>URL Does Not Exist</h1>");
   }

   delete urlDatabase[req.params.shortURL];
   res.redirect('/urls');
  });

  
//registering new user
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('register', templateVars);
});

//post registering
app.post("/register", (req, res) => {
  const userID = Math.random().toString(36).substring(2, 8);
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUserByEmail(email, users);

  if (userFound) {
    res.status(400).send('Sorry, that user already exists!');
    return;
  } 
   if(email === "" || password === ""){
    res.status(400).send('Please enter both email and password');
    return;
  }

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  
  };
  
  // Setting the cookie in the user's browser
  req.session.user_id = userID;

  res.redirect('/urls');
  });


 // login page - GET
 app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null};
  res.render("urls_login", templateVars);
});

//login page post
app.post("/login", (req, res) => {

const email = req.body.email;
const password = req.body.password;
const userFound = findUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(req.body.password, userFound.password)) {
  const userID = userFound.id;
  req.session.user_id = userID;
  res.redirect('/urls');
} else
 res.status(403).send("Please enter correct email and password. Please <a href='/login'>Login</a>");

});

//logout
app.post("/logout", (req, res) => {

res.clearCookie('session');
res.clearCookie('session.sig');
res.redirect("/urls");
});


 //app is listening
 app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});