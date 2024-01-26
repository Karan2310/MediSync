require("dotenv").config();
const db = require("./config/db");
// db();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const IndexRoute = require("./routes/index");
const ClientSideRoute = require("./routes/clientSide");
const CookieRoute = require("./routes/cookie");

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/field", IndexRoute);
app.use("/api/auth/client", ClientSideRoute);
app.use("/api/cookie", CookieRoute);

app.use(errorHandler);

app.listen(port, () => console.log(`http://localhost:${port}`));
