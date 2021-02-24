const { idExist, app } = require("./index");
const request = require("supertest");
const { describe } = require("yargs");
const { test, expect } = require("@jest/globals");
const { response } = require("express");
const fs = require("fs");
const binContent = JSON.parse(fs.readFileSync(`./bins/bin.json`));

test("Can get a bin by id", async () => {
  const binData = await request(app).get("/b/bin");
  const data = JSON.parse(binData.text);
  expect(data).toEqual(binContent);
});

test("Illegal id", () => {
  request(app)
    .get("/b/illegal")
    .catch((e) => {
      expect(e.status).toBe(422);
    });
});

test("if a bin is not found an", () => {
  request(app)
    .get("/b/notFound")
    .catch((e) => {
      expect(e.status).toBe(404);
    });
});

test("can add a new bin", async () => {
  const req = (await request(app).post("/b/bin").send({ text: "added" })).text;
  const arr = JSON.parse(req);
  expect(idExist(arr[arr.length - 1]["id"])).toBeTruthy();
});

test("Bonus!can not add a bin with illegal body", async () => {
  const req = await request(app).post("/b/bin").send({});

  expect(req.status).toBe(400);
});

test("can update a bin by id", async () => {
  const newBin = [{ text: "newBin" }];
  const req = await request(app).put("/b/bin").send(newBin);
  expect(req.status).toBe(200);
});
