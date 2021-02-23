// const { json } = require("express");
const { log } = require("console");
const { json } = require("express");
const express = require("express");
let app = express();
const fs = require("fs");
const { get } = require("http");
const { parse } = require("path");

app.use(express.json());

app.use(function (req, res, next) {
  setTimeout(next, 1000);
});

//PUT METHOD
app.put("/b/:id", (req, res) => {
  let body = req.body;
  let id = req.params.id;
  const binExist = fs.existsSync(`./bins/${id}.json`);
  if (!binExist) {
    res.status(404).json({
      message: "Bin not found",
      success: false,
    });
    return;
  }

  fs.writeFileSync(`./bins/${id}.json`, JSON.stringify(body, null, 4));

  const successMesseage = {
    success: true,
    data: body,
    version: 1,
    parentId: id,
  };
  res.send(successMesseage);
});

//GET METHOD
app.get("/b/:id", (req, res) => {
  const id = req.params.id;
  try {
    const binContent = JSON.parse(fs.readFileSync(`./bins/${id}.json`));
    res.json(binContent);
  } catch (e) {
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (format.test(id)) res.status(422).json({ message: "Invalid Record ID" });
    else res.status(404).json({ message: "Bin is not found" });
  }
});

//POST METHOD
app.post("/b/:id", (req, res) => {
  const newData = req.body;
  const id = req.params.id;
  const binContent = JSON.parse(fs.readFileSync(`./bins/${id}.json`));
  newData.id = createId();
  while (idExist(newData.id)) {
    newData.id = createId();
  }
  binContent.push(newData);
  fs.writeFileSync(`./bins/${id}.json`, JSON.stringify(binContent, null, 4));
  res.send(binContent);
});

//This method creates an random id for each task.
function createId() {
  let str = "abcdefghijklmnopqrstuvwxyz";
  str += str.toUpperCase();
  str += "1234567890";
  let arr = str.split("");
  let id = "";

  for (let i = 1; i <= 10; i++) {
    let rnd = Math.floor(Math.random() * 62);
    id += arr[rnd];
  }

  return id;
}

//This method checks if the id already exist in one of the tasks.
function idExist(id) {
  let existsIDs = JSON.parse(fs.readFileSync(`./bins/ids.json`));
  for (let i = 0; i < existsIDs.length; i++) {
    if (id === existsIDs[i]) {
      return true;
    }
  }
  existsIDs.push(id);
  fs.writeFileSync(`./bins/ids.json`, JSON.stringify(existsIDs, null, 4));
  return false;
}

//DELETE METHOD
app.delete("/b/:id", (req, res) => {
  const deletedData = req.body;
  const id = req.params.id;
  const dataId = deletedData.id;
  const binContent = JSON.parse(fs.readFileSync(`./bins/${id}.json`));
  const data = binContent;
  for (let fileNumber in data) {
    if (data[fileNumber].id === dataId) {
      data.splice(taskNumber, 1);
      break;
    }
  }

  fs.writeFileSync(`./bins/${id}.json`, JSON.stringify(binContent, null, 4));
  res.send(binContent);
});

//GETALL METHOD
app.get("/b", (req, res) => {
  try {
    const bins = fs.readdirSync(`./bins`);
    const files = [];
    for (file in bins) {
      let link = JSON.parse(fs.readFileSync(`./bins/${bins[file]}`));
      files.push(link);
    }
    res.send(files);
  } catch (e) {
    res.status(422).json({ message: "Invalid Record ID" });
  }
});

//PORT
app.listen(3000, () => {
  console.log("listening on 3000.");
});

module.exports = app;
