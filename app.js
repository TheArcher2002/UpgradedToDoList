const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://harikrishnanmnair2002:0GdYJ5cfqwRv13sc@fruitsproject.pk8u2ob.mongodb.net/todolistDB");

const itmesSchema = new mongoose.Schema({
    name : String
});
const Item = mongoose.model("Item",itmesSchema);

const item1 = new Item({
    name:"Welcome to your ToDoList!"
});
const item2 = new Item({
    name:"Hit the + button to add a new item."
});
const item3 = new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itmesSchema]
});  
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res){
    Item.find({}).then(function(foundItems){
        if (foundItems.length === 0){
            Item.insertMany(defaultItems)
            .then(function () {
                console.log("Successfully saved defult items to DB");
            })
            .catch(function (err) {
                console.log(err);
            });
            res.redirect("/");
        }
        else{
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
      })
      .catch(function(err){
        console.log(err);
      });
});

app.get("/:customListName",function(req,res){
    const customListName = req.params.customListName;
    List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
});

app.post("/",async function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName === "Today"){
      item.save();
      res.redirect("/");
     }else{
    await List.findOne({name: listName}).exec()
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    }
});

app.post("/delete", function(req, res){
 
  const listName =  req.body.listName;
  const checkItemId =  req.body.checkbox;
 
  if(listName == "Today"){
    deleteCheckedItem();
  }else{
    
    deleteCustomItem();
  }
 
  async function deleteCheckedItem(){
    await Item.deleteOne({_id : checkItemId});
    res.redirect("/");
  }
 
  async function deleteCustomItem(){
    await List.findOneAndUpdate(
      {name : listName},
      {$pull : {items : {_id : checkItemId} }}
      );
    res.redirect("/"+listName);
  }
});

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newListItems:workItems});
});

app.get("/about",function(req,res){
    res.render("about");
});

// app.post("/work",function(req,res){
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// });

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});