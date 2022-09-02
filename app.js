const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");
const _ = require("lodash");

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
const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema)



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
            res.render("list",{ listTitle: "Today" , items: foundItems })
        }
    })
   
});

app.get("/:customListName",  (req, res)=>{
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, (err, foundList)=>{
        if(!err){
            if(!foundList){
                //CREATE NEW LIST
                const list = new List({
                    name: customListName,
                    items: defaultItem
                });
                list.save();
                res.redirect(`/${customListName}`)
            }else{
                //SHOW EXISTING LIST
                res.render("list", {listTitle: foundList.name, items: foundList.items})
            }
        }
    });
})

app.post("/", (req, res)=>{
    const itemName= req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/"); 
    }else{
        List.findOne({name: listName}, (err, foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect(`/${listName}`)
        });
    }
});

app.post("/delete", (req, res)=>{
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItem, (err)=>{
            if(!err){
                console.log('Succefully removed');
                res.redirect("/");
            }
        }); 
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, (err,foundList)=>{
            if(!err){
                res.redirect(`/${listName}`)
            }
        })
    }
});


app.get("/about", (req, res)=>{
    res.render("about");
})

app.listen(process.env.PORT || 3000, function(){
    console.log("server running on port 3000")
})