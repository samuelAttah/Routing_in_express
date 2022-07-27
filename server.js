const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const { logEvents, logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const PORT = process.env.PORT || 3500;

//CUSTOM MIDDLEWARE LOGGER
app.use(logger);

//Third party middleware
//CROSS ORIGIN RESOURCE SHARING
const whitelist = [
  "https://www.yoursite.com",
  "http://127.0.0.1:5500",
  "http://localhost:3500",
  "https://google.com/",
];

const corsOptions = {
  //the following checks if the origin is part of the whitelist.
  //NOTE || !origin below avoids blocking REST tools or server to server requests and should be used majorly in development.
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

//built in middleware to get form data from url
app.use(express.urlencoded({ extended: false }));

//built in middleware to read json files
app.use(express.json());

//built in middleware to read static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/", require("./routes/root"));
app.use("/subdir", require("./routes/subdir"));
app.use("/employees", require("./routes/api/employees"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    //we set the content-type response header to text
    res.type("txt").send("404 Not Found");
  }
});

//this handles the CORS errors. It sends the error from the middlewares to the browser as just a single line(custom error)
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
