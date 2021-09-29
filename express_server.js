const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));

/* const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {longURL: "http://www.google.com"}
}; */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/* Generates a random string*/
function generateRandomString() {
  let randomString = "";
  const length = 6;
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++)
  randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  return randomString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  console.log(templateVars);
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {

  console.log(req.params);
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  //console.log(urlDatabase[req.params.shortURL].longURL);
  //console.log(req.params.shortURL === "b2xVn2")
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

/*app.post("/urls", (req, res) => {
  console.log(req.body.longURL);  // Log the POST request body to the console
  const longURL = req.body.longURL;
  
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});*/
app.get("/urls/new", (req, res) => {

  console.log(req.params);
  res.render("urls_new");
});



app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
   const shortURL = req.params.shortURL

   const longURL = urlDatabase[shortURL]
   res.redirect(longURL);
 });
 

 app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  //res.send("ok");
  res.redirect(`/urls/${shortURL}`);
});

console.log("edit resourse");
  //edit resource
  app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

   urlDatabase[shortURL] = longURL;
    
     res.redirect('/urls');
    
  });
  //delete using post
  app.post("/urls/:shortURL/delete", (req, res) => {

    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');

  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});