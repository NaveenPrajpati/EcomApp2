const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const userRoutes=require("./routes/userRoutes")
const shopRoutes=require('./routes/shopRoutes')

app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname,"./uploads")));
app.use("/test", (req, res) => {
  res.send("Hello world!");
});


app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// import routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const conversation = require("./controller/conversation");
const message = require("./controller/message");
const withdraw = require("./controller/withdraw");

app.use("/api/v1/user", user);
app.use("/api/conversation", conversation);
app.use("/api/message", message);
app.use("/api/order", order);
app.use("/api/shop", shop);
app.use("/api/product", product);
app.use("/api/event", event);
app.use("/api/coupon", coupon);
app.use("/api/payment", payment);
app.use("/api/withdraw", withdraw);

//modification
app.use('/api/user',userRoutes)
app.use('/api/shop',shopRoutes)

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
