//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// then we will create new database inside MongoDB
// mongodb://localhost:27017/todolistDB
// mongodb+srv://mani16032:mani16032@test.3pfif5i.mongodb.net/?retryWrites=true&w=majority
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

// we will delete this in order to be able to use mongo and mongoose instead
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit to delet an item>"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
// here in find we will get an array back thats why we check if it is empty
  const foundItems = Item.find({}).then(function(foundItems){
    if (foundItems.length === 0) {

      async function insertDefaultItems() {
        try {
          await Item.insertMany(defaultItems);
          console.log("Successfully saved default items to DB.");
        } catch (err) {
          console.log(err);
        }
      }
      insertDefaultItems();
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});


    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

// here we will get an object back

async function findOrCreateList(customListName) {
  try {
    const foundList = await List.findOne({ name: customListName });

    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      await list.save();
      res.redirect("/" + list.name);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  } catch (err) {
    // Handle any errors that occurred during the process
    // and provide an appropriate response
    console.error(err);
    // Add your error handling logic here
  }
}

findOrCreateList(customListName);




// List.findOne({ name: customListName })
//   .then(foundList => {
//     if (!foundList) {
//       const list = new List({
//         name: customListName,
//         items: defaultItems
//       });

//       return list.save();
//       return res.redirect("/" + customListName);
//     } else {
//       res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
//     }
//   })
//   .catch(err => {
//     // Handle the error
//     console.error(err);
//   });


// List.findOne({name: customListName}, function(err, foundList){
//     if(!err) {
//       if(!foundList){
//         const list = new List({
//           name: customListName,
//           items: defaultItems
//         });

//         list.save();
//         res.redirect("/" + customListName);
//       } else {
//         res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
//       }
//     }
//   });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();
  
  res.redirect("/");

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  // Item.findByIdAndRemove(checkedItemId, console.log("Succesfully deleted checked item."));
  // res.redirect("/")
  Item.findByIdAndRemove(checkedItemId)
  .then(() => {
    console.log("Successfully deleted checked item.");
    res.redirect("/");
  })
  .catch((err) => {
    console.log(err);
  });

});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
