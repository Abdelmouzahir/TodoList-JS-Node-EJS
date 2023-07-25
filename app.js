const express = require("express");
const bodyParser = require("body-parser");
///const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://dembelemaroc:test123@cluster0.lnxfmjj.mongodb.net/todolistDB", {useNewUrlParser: true});


const itemsSchema = {
      name: String
};
let ItemModel =  mongoose.model("Item", itemsSchema );

let item1 = new ItemModel({
      name: "Welcome to your todolist!"
});

let item2 = new ItemModel ({
      name: "Hit the + button to add a new item."
});
let item3 = new ItemModel ({
      name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = {
      name: String,
      items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req,res){
   ////let day = date.getDate();
   ItemModel.find({})
   .then(foundItems => {
      if (foundItems.length === 0) {
            ItemModel.insertMany(defaultItems)
            .then(() => {
              console.log("Successfully saved all the documents");
              res.redirect("/");
            })
            .catch((err) => {
              console.error(err);
            });
            
      }else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
   })
   .catch(err => {
     console.error(err);
     res.status(500).send('Internal Server Error');
   });

  
});

app.get("/:customListName", function(req,res){
      const customListName = _.capitalize(req.params.customListName);
      
      List.findOne({name: customListName})
      .then(foundList => {
            if (!foundList) {
                  //Create a new list
                   const list = new List({
                   name: customListName,
                   items: defaultItems
                  });
                  list.save();
                  res.redirect("/" + customListName);
            }else {
                  //Show an existing list
                  res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
      })
      .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
      });

  

})

app.post("/", function(req,res){
      var itemName = req.body.newItem;
      const listName = req.body.list;

      const item = new ItemModel({
            name: itemName
      });
      if (listName === "Today"){
               item.save();
               res.redirect("/");
      }
      else {
            List.findOne({name: listName})
            .then(foundList => {foundList.items.push(item);
                  foundList.save();
                  res.redirect("/"+ listName)
            })
            .catch(err => {
                  console.error(err);
                  res.status(500).send('Internal Server Error');
            });
      }

    //  if (req.body.list === "Work"){
     //       workItems.push(item);
    //        res.redirect("/work");
    //  }else {
    //        items.push(item);
    //        res.redirect("/");
    //  }
      
});

app.post("/delete", function(req,res){
      const checkedItemId = req.body.checkbox;
      const listName = req.body.listName;

      if (listName === "Today"){
              ItemModel.findByIdAndRemove(checkedItemId)
      .exec()
      .then(() => {
            console.log("Successfully deleted checked item.");
            res.redirect("/");
      })
      .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
      });
     
      }else {
            List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
            .then(() => {
                        res.redirect("/" + listName)
                  
            })
            .catch(err => {
                  console.error(err);
                  res.status(500).send('Internal Server Error');
            }
            );

      }
    
});


app.post("/work", function(req,res){
      var item = req.body.newItem;
      workitems.push(item);
      res.redirect("/work");
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running on port 3000");
});

