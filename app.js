const express = require("express");
const date = require(__dirname + "/date.js");
require('dotenv').config();

var capitalize = require('lodash.capitalize');

const mongoose = require("mongoose");
main().catch((err) => console.log(err));

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extend: true }));
app.use(express.static("public"));

async function main() {
  await mongoose.connect(process.env.MONGODB_KEY);

  const toDoItemsSchema = new mongoose.Schema({
    toDoItems: String,
  });

  const ToDoItem = new mongoose.model("ToDoItem", toDoItemsSchema);

  const item1 = new ToDoItem({
    toDoItems: "Welcome to your todolist!",
  });
  const item2 = new ToDoItem({
    toDoItems: "Hit the + button to add a new item.",
  });
  const item3 = new ToDoItem({
    toDoItems: "<-- Hit this to delete an item.",
  });

  const defaultItems = [item1, item2, item3];

  // let items = ToDoItem.find({});
  const listSchema = new mongoose.Schema({
    name: String,
    list: [toDoItemsSchema],
  });

  const List = new mongoose.model("List", listSchema);
  
  let day = date.getDate();
  let count = true;
  app.get("/", (req, res) => {
    ToDoItem.find({}, (err, result) => {
      if (result.length === 0 && count === true) {
        ToDoItem.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Success!");
            count = false;
          }
        });
        res.redirect("/");
      } else {
        res.render("index", { listTitle: day, newListItem: result });
      }
    });
  });

  app.post("/", async (req, res) => {
    let item = req.body.newListItem;
    let checkTitle = req.body.list;
    const newItem = new ToDoItem({
      toDoItems: item,
    });
    if (checkTitle === day) {
      await newItem.save();
      res.redirect("/");
    } else {
      List.findOne({name: checkTitle},async (err, result)=>{
        result.list.push(newItem);
        await result.save();
        res.redirect("/"+checkTitle);
      })
    }

  });

  app.post("/delete", (req, res) => {
    const id = req.body.checkBox
    const listTitle = req.body.listName;
    if (listTitle === day) {
      ToDoItem.deleteOne({ _id: id }, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("ToDoItem delete success!");
      }
    });
    res.redirect("/");
    } else {
      List.findOne({name:listTitle},async (err,result)=>{
        // console.log(result.list);
        result.list.pull(id);
        await result.save(err => {
          if (err) console.error("Pull unsuccessful");
          // mongoose.connection.close();
        });
        res.redirect("/"+listTitle);
        // if (!err) {
        //   result.list.deleteOne({_id:id},(err)=>{
        //     if (err) {
        //       console.log(err);
        //     } else {
        //       res.redirect("/"+lisTitle);
        //       console.log(listTitle + " delete success!");
        //     }
        //   })
        // }
      })
    }

  });

  app.get("/:newTag", (req, res) => {
    const newTag = capitalize(req.params.newTag);
    List.findOne({ name: newTag }, async (err, result) => {
      if (!err) {
        if (!result) {
          const lists = new List({
            name: newTag,
            list: defaultItems,
          });
          await lists.save();
          res.redirect("/" + newTag);
        } else {
          res.render("index", { listTitle: newTag, newListItem: result.list });
        }
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// var today = new Date();
// var day = ['Sunday',"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
// var currentDay = day[today.getDay()];

// // if (currentDay === 6 || currentDay === 0) {
// //   day = "Yay it's the weekend!";
// // } else {
// //   day = "Boo! I have to work!";
// // }
// res.render('index', {kindOfDay: currentDay});
