//jshint eversion:6

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();


app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static("public"))

app.set('view engine', "ejs")

mongoose.connect("mongodb+srv://admin-ajay:Anjunabeats6@cluster0.kcg21.mongodb.net/todolistDB", {
  useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true
})


const itemSchema = {
  name: String
}

const Item = mongoose.model("Items", itemSchema)

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "<-- delete items here"
})

const item3 = new Item({
  name: "Update items here"
})

const defaultList = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultList, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Sucess!")
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  })
})


app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName
  })

  if (listName === "Today"){
    item.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item)
        foundList.save()
      res.redirect("/" + listName)
    })
  }


})

app.post("/delete", function(req, res) {
  const deleteID = req.body.checkbox
  const listName = req.body.listName

  if (listName ==="Today"){
    Item.findByIdAndRemove(deleteID, function(err) {
      if (!err) {
        console.log("Successfully removed item")
        res.redirect("/")
      }

  })
} else {
  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id:deleteID}}}, function(err, foundList){
    res.redirect("/" + listName)
  })
}
})

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName)


  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultList
        })
        list.save()
        res.redirect("/" + customListName)
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  })
})

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000
}

app.listen(port, function() {
  console.log("Server started successfully")
})
