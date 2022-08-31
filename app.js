const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set("view engine", "ejs")

mongoose.connect("mongodb://localhost/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item= mongoose.model("Item", itemSchema);
const item1 = new Item({
    name: "welcome to your todo list",
});
const item2 = new Item({
    name: "click this button to +add item to list",
});
const item3 = new Item({
    name: "--> click this button to delete item",
});

const defaultItem = [item1, item2, item3];



app.get("/", (req, res)=>{
    Item.find({}, (err, foundItems)=>{
        if (foundItems === 0) {
            Item.insertMany(defaultItem, (err)=>{if(err){
                console.log(err)
               }else{
                console.log("item was altered")
               }
            });
            res.redirect("/");
        }else{
            res.render("list",{ listTitle: "Today" , newListItems: foundItems })
        }
    })
   
});

app.post("/", (req, res)=>{
    let itemName= req.body.newItem;

    const item = new Item({
        name: itemName
    });

    item.save();
    res.redirect("/")
});

app.post("/delete", (req, res)=>{
    const checkedItem = req.body.checkbox;
    Item.findByIdAndRemove(checkedItem, (err)=>{
        if(!err){console.log('Succefully removed')}
    });
    res.redirect("/");
})

app.get("/work", (req,res)=>{
    res.render("list", { listTitle: "Work List", newListItems: workItems})
});
app.get("/about", (req, res)=>{
    res.render("about");
})

app.listen(process.env.PORT || 3000, function(){
    console.log("server running on port 3000")
})