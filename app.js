var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const productRouter = require("./routes/product");
const ordersRouter = require("./routes/orders");

const mongoose = require("mongoose");
const feedback = require("./routes/Feedback");
// const { Category } = require("./routes/Category");
const Businesses = require("./routes/businesses");
const UserFav = require("./routes/fav");

var app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productRouter);
app.use("/orders", ordersRouter);
app.use("/feedback", feedback);
// app.use("/Category", Category);
app.use("/businesses", Businesses);
app.use("/Favourite", UserFav);
// app.use('/api/products',  productRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
mongoose
  .connect(
    "mongodb+srv://awais:awais@cluster0.tpfm3.mongodb.net/BaltiApp?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to Mongo...."))
  .catch((error) => console.log(error.message));

module.exports = app;
