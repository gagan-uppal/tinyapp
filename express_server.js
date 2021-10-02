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
  res.send("Hello!");
});


//takes to urls
app.get("/urls", (req, res) => {
  const userID = getuser(req);
  const user = users[userID]
  if(!user) {
    return res.status(401).send("You must <a href='/login'>Login</a> first") ;
  }
  const urls = urlsForUser(user.id,urlDatabase);
  console.log("urls", urls)
  const templateVars = { urls, user };
  res.render("urls_index", templateVars);
});


//create new urls
app.get("/urls/new", (req, res) => {
  console.log('request - > ',req);
  const user = users[getuser(req)];

  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});



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
  urlDatabase[shortURL] = {longURL, userID}
  
  res.redirect(`/urls/${shortURL}`);
});


  //edit resource
  app.post("/urls/:shortURL", (req, res) => {
    console.log(' print me .... ')
    const userID = getuser(req);
    const user = users[userID]
    const userallowedurls =[];
    if(!user) {
      return res.status(401).send("You must <a href='/login'>Login</a> first") ;
    } 
    

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
    console.log(' existing the register process >> 1 ');
    return;
  } 
   if(email === "" || password === ""){
    res.status(400).send('Please enter both email and password');
    console.log(' existing the register process >> 2 ');
    return;
  }

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


 // login page - GET
 app.get("/login", (req, res) => {

  const templateVars = { user: null};
 res.render("urls_login", templateVars);
});

//login page post
app.post("/login", (req, res) => {

const email = req.body.email;
const password = req.body.password;
const userFound = findUserByEmail(email, users);
console.log("userfound", userFound);
  if (userFound && bcrypt.compareSync(req.body.password, userFound.password)) {
  const userID = userFound.id;
  console.log("userid", userID);
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