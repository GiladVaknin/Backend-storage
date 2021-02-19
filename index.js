// const { json } = require("express");
const { log } = require("console");
const { json } = require("express");
const express = require("express");
let app = express();
const fs = require("fs");
const { parse } = require("path");

app.use(express.json());

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
    const binContent = fs.readFileSync(`./bins/${id}.Json`);
    res.send(binContent);
  } catch (e) {
    res.status(422).json({ message: "Invalid Record ID" });
  }
});

//POST METHOD
app.post("/b/:id", (req, res) => {
  const newTask = req.body;
  const id = req.params.id;
  const binContent = JSON.parse(fs.readFileSync(`./bins/${id}.json`));
  const myTodo = binContent["my-todo"];
  newTask.id = createId();
  while (idExist(newTask.id)) {
    newTask.id = createId();
  }
  myTodo.push(newTask);
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
  const newTask = req.body;
  const id = req.params.id;
  const taskId = newTask.id;
  const binContent = JSON.parse(fs.readFileSync(`./bins/${id}.json`));
  const myTodo = binContent["my-todo"];

  for (let taskNumber in myTodo) {
    if (myTodo[taskNumber].id === taskId) {
      myTodo.splice(taskNumber, 1);
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
