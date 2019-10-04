var inquirer = require("inquirer");
var mysql = require("mysql");
var dotenv = require("dotenv");

dotenv.config();


// functions

function displayInventory(inventory) {

  for (i = 0; i < inventory.length; i++) {
    var item = inventory[i];
    console.log(`Item ID: ${item.item_id} | Item Name: ${item.product_name} | Dept Name: ${item.department_name} | Price: ${item.price} | Stock: ${item.stock_quantity}`)
  }
}

function decreaseStock(qty){

}

function userOrders(){
  inquirer.prompt([{
    type: "input",
    message: "Enter the Item ID of the Item you'd like to purchase:",
    name: "itemSelection"
  }, {
    type: "input",
    message: "How many units would you like to purchase?:",
    name: "amountDesired"
  },{
    type: "confirm",
    message: "Are you sure you wish to purchase the above product and quatity?",
    name: "readyToBuy"
  },{
    type: "confirm",
    message: "Are you finished shopping?",
    name: "doneShopping"
  }
]).then(function (response) {

    if (response.doneShopping){
      // if the user is done shopping total up their cost, and display the items in their cart.
      itemsInCart.push()
      console.log(`Thank you for shopping at bamazon, your total is: ${parseFloat(totalCost,2)}`)
    } else {
      runProgram();
    }

    if (response.readyToBuy){
      con.query(`SELECT * FROM products WHERE item_id=${id}`,function(err,res){
        if (err) throw err;

      });
    }
    console.log(`User selected ${response.itemSelection}`);
  });
}

function runProgram(){
  con.query("SELECT * FROM products;", function (err, result) {
    if (err) throw err;
    var inventory = result;
    displayInventory(inventory);
    userOrders();
  });
}

// global variables
var totalCost = 0;
var itemsInCart = [];

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
  runProgram();

  con.end(); //close connections
});
