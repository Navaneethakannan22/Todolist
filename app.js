const express = require("express");
const bodeParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodeParser.urlencoded({ extended: true }));
// let item = "";
// let items = ["Selenium", "Sikulx", "REST Api"];
// let workItems = [];
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://admin-naveen:naveen123@cluster0.tdxr5.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = {
    name: String
}

const listSchema = {
    name: String,
    items: [itemSchema]
}

const item = mongoose.model("Item", itemSchema);
const list = mongoose.model("List", listSchema);

const item1 = {
    name: "Selenium"
}
const item2 = {
    name: "WebDriverIO"
}
const item3 = {
    name: "REST API"
}

const defaultItem = [item1, item2, item3];
// item.insertMany([item1, item2, item3], (err) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Successfully inserted");
//     }
// });

app.get("/", function (req, res) {
    // const result = [];
    // let date = new Date();
    // let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // let options = {
    //     day: "2-digit",
    //     weekday: "long",
    //     month: "short"
    // }
    // let formattedDate = date.toLocaleDateString("en-US", options);

    item.find((err, result) => {
        if (result.length === 0) {
            item.insertMany([item1, item2, item3], (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted");
                }
            });
            res.redirect("/");
        } else {
            if (err) {
                console.log(err);
            } else {
                result.forEach((i) => {
                    console.log(i.name);
                })
                // console.log(resul);
                res.render("index", { listTitle: "Today", newListItems: result });
            }
        }
    });

});

app.get("/:newItem", (req, res) => {
    const customList = _.capitalize(req.params.newItem);

    list.findOne({ name: customList }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const newList = new list({
                    name: customList,
                    items: defaultItem
                })
                newList.save();
                res.redirect("/" + customList);
            } else {
                res.render("index", { listTitle: customList, newListItems: foundList.items });
            }
        }
    });
});

// app.get("/work", (req, res) => {

//     res.render("index", { listTitle: "Work List", newListItems: workItems });
// });

app.post("/", (req, res) => {
    const addedItem = req.body.newItem;
    const listPage = req.body.addButton;

    const newItem = {
        name: addedItem
    }
    // item.insertMany(newItem, (err) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log("Successfully added");
    //     }
    // });
    //newItem.save();

    if (listPage === "Today") {
        //workItems.push(item);
        //res.redirect("/work");
        newItem.save();
        res.redirect("/");
    } else {
        //  items.push(item);
        //  res.redirect("/");
        list.findOne({ name: listPage }, function (err, foundList) {

            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listPage);
        })
    }
});

app.post("/delete", (req, res) => {
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        item.findByIdAndRemove(checkedId, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Selected Item is Removed successfully.");
                res.redirect("/");
            }
        });

    } else {
        list.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedId } } }, function (err) {
            if (!err) {
                console.log("Selected Item is Removed successfully.");
                res.redirect("/" + listName);
            }
        });
    }

});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("server is up and running");
});