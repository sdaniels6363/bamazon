var inquirer = require("inquirer");
var mysql = require("mysql");
var dotenv = require("dotenv");

dotenv.config();


// functions

function displayInventory(inventory) {

  var itemList = [];
  for (i = 0; i < inventory.length; i++) {
    var item = inventory[i];
    var itemObj = {
      item_id: item.item_id,
      product_name: item.product_name,
      department_name: item.department_name,
      price: item.price,
      stock_quantity: item.stock_quantity
    }
    itemList.push(JSON.stringify(itemObj));
  }

  inquirer.prompt({
    type: "list",
    choices: function () {
      var choicesArr = [];
      for (i = 0; i < itemList.length; i++) {
        var choice = JSON.parse(itemList[i]);
        choicesArr.push(`Item Name: ${choice.product_name} | Dept Name: ${choice.department_name} | Price: ${choice.price} | Stock: ${choice.stock_quantity}`);
      }
      return choicesArr;
    },
    message: "What would you like to purchase?",
    name: "itemSelection"
  }).then(function (choice) {
    console.log(`User selected ${choice}`);
  });
}

// Creates initial sql connection to the database
var con = mysql.createConnection({
  host: "localhost",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  port: "3306",
  database: "bamazon"
});


con.connect(function (err) {
  if (err) {
    throw err;
  }
  console.log("connected");


  con.query("SELECT * FROM products;", function (err, result) {
    if (err) throw err;
    var inventory = result;
    displayInventory(inventory);
  });
  con.end(); //close connections
});
