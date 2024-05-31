import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();

mongoose.connect("mongodb+srv://moaz007malik:SjERoKNwqj6MSd2d@cluster0.txpshab.mongodb.net/todolistDB");

const itemsSchema = {
    name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "His + to add new items"
});

const item3 = new Item({
    name: "Hit box to delete an existing item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", async (req, res) => {
    try {
        const foundItems = await Item.find({});
        if(foundItems.length === 0){
            Item.insertMany(defaultItems);
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/:customListName", async function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    try {
        const foundList = await List.findOne({ name: customListName });
        if (!foundList) {
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            await list.save();
            res.redirect("/" + customListName);
        } else {
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/", async function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        try {
            await item.save();
            res.redirect("/");
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            const foundList = await List.findOne({ name: listName });
            foundList.items.push(item);
            await foundList.save();
            res.redirect("/" + listName);
        } catch (err) {
            console.log(err);
        }
    }
});

app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        try {
            await Item.findByIdAndDelete(checkedItemId);
            res.redirect("/");
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } });
            res.redirect("/" + listName);
        } catch (err) {
            console.log(err);
        }
    }
});

app.get("/category/:<paramName>", function(req, res){
    res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function (req, res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("App is running on Port 3000.");
});
