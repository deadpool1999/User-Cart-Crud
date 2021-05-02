const express = require("express");
require("./db/mongoose");

const userRouter = require("./routers/user");
const itemRouter = require("./routers/item");

const app = express();

app.use(express.json());
app.use("/users", userRouter);
app.use("/items", itemRouter);

module.exports = app;
