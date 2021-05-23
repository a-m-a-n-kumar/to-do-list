//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:66oxGsCsV7TIzMTr@cluster0.exfsi.mongodb.net/todolistDB?retryWrites=true&w=majority", {
    useNewUrlParser: true
});



const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const day1 = new Item({
    name: "Buy Food"
});

const day2 = new Item({
    name: "No Meat"
});

const day3 = new Item({
    name: "Fish Food"
});

const defaultitems = [day1, day2, day3]


//Item.insertMany([day1,day2,day3], function(err){
//    if(err)
//        console.log("Error bruh");
//    else
//        console.log("successfully inserted");
//});

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    Item.find({}, function (err, items) {

        if (items.length === 0) {
            Item.insertMany([day1, day2, day3], function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("successfully inserted");
            });
            res.redirect("/");
        } else {



            res.render("list", {
                listTitle: "Today",
                newListItems: items
            });

        }
    });



});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listname = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listname === "Today") {

        item.save();

        res.redirect("/");
    } else {
        List.findOne({
            name: listname
        }, function (err, foundlist) {
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/" + listname);
        });
    }


});

app.post("/delete", function (req, res) {
    const checkeditem = req.body.chkbox;
    const listname = req.body.listname;

    if (listname === "Today") {
        Item.deleteOne({
            _id: checkeditem
        }, function (err) {
            if (err)
                console.log(err);
            else
                console.log("successfully deleted");
        });
        res.redirect("/");
    } else {
          
         List.findOneAndUpdate({name: listname}, {$pull: {items: {_id: checkeditem}}}, function(err, foundlist){
             if(!err)
                 {
                     res.redirect("/" + listname);
                 }
         } );
        
    }


});



app.get("/:list", function (req, res) {
    const listname = _.capitalize(req.params.list);

    List.findOne({
        name: listname
    }, function (err, foundlist) {
        if (!err) {
            if (!foundlist) {
                //create new list
                const list = new List({
                    name: listname,
                    items: defaultitems
                });

                list.save();
                res.redirect("/" + listname);
            } else
            //show an existing list
            {
                res.render("list", {
                    listTitle: foundlist.name,
                    newListItems: foundlist.items
                });
            }
        }
    })




});

app.get("/about", function (req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
    console.log("Server started on port");
});
