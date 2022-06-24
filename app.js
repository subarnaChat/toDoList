const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

//connecting to database
mongoose.connect("mongodb+srv://admin-subarna:test123@cluster0.biqjoca.mongodb.net/todolistDB");

//creating schema
const itemsSchema={
  name:String
};

//creating mongoose model
const Item = mongoose.model("Item",itemsSchema);

//create mongoose documents
const item1=new Item({name:"Welcome to my To-do List!"});
const item2=new Item({name:"Cick the + button to add new items"});
const item3=new Item({name:"<-- click here to delete an item"});

const defaultArray=[item1,item2,item3];

//array of items of type listschema
const listSchema={name:String,items:[itemsSchema]};
const List=mongoose.model("List",listSchema);

let today=new Date();
let options={
  weekday:"long",
  day:"numeric",
  month:"long"
};

const day=today.toLocaleDateString("en-US",options);

app.get("/",function(req,res){


  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      //insert the default values into mongoose collection
      Item.insertMany(defaultArray,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle:day, newListItems:foundItems});
    }

  });

});

app.get("/:customListName",function(req,res){
  customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("Hello");
        const list=new List({name:customListName,items:defaultArray});
        // list.save();
        // res.redirect("/"+customListName);
        list.save();
        res.redirect("/"+customListName);

      }else{
        console.log("I'm here");
        res.render("list",{listTitle:customListName,newListItems:foundList.items});
      }
    }
  });

});

app.post("/",function(req,res){
  let itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({name:itemName});

  if(listName===day){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedItem=req.body.checkbox;
  const listName=req.body.listName;

  if(listName===day){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(!err){
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(req,res){
  console.log("running");
});
