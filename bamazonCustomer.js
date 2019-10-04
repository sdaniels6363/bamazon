// load dependencies
var inquirer = require("inquirer");
var mysql = require("mysql");
var dotenv = require("dotenv");

dotenv.config();

// global variables
var totalCost = parseFloat(0).toFixed(2);
var cart = [];


// functions

function displayInventory(inventory) {

  for (i = 0; i < inventory.length; i++) {
    var item = inventory[i];
    console.log(`${item.item_id}) ${item.product_name} | Dept: ${item.department_name} | Price: ${item.price} | Stock: ${item.stock_quantity}`)
  }
}

function decreaseStock(qty) {

}

function userOrders() {
  inquirer.prompt([{
    type: "input",
    message: "Enter the Item ID of the Item you'd like to purchase:",
    name: "itemSelection"
  }, {
    type: "input",
    message: "How many units would you like to purchase?:",
    name: "amountDesired"
  }
  ]).then(function (response) {
    var chosenItem = response.itemSelection;
    var qty = response.amountDesired;
    con.query(`SELECT * FROM products WHERE item_id="${chosenItem}";`, function (err, result) {
      if (err) throw err;

      var item = result[0]; // stored into variable for easier readability.

      var currStock = item.stock_quantity;
      var remainingStock = parseInt(currStock - qty);

      if (currStock <= 0 || remainingStock <= 0) {
        // If the user orders an item that is not in stock, they are notified.  Also applies to if they ordered 51 items, and only 50 were in stock.
        // Program is re-run if this is the case.
        console.log("\n\nThere are not enough items in stock to fulfill your order.\n\n");
        runProgram();
      } else {
        var price = parseFloat(item.price).toFixed(2);

        var subtotal = parseFloat(price * qty).toFixed(2);
        console.log(`Your total cost for ${qty} ${item.product_name}(s) is: $${totalCost}\n`);

        inquirer.prompt([{
          type: "confirm",
          message: "Would you like to add these items to your cart?",
          name: "addToCart"
        },{
          type: "confirm",
          message: "Are you finished shopping?",
          name: "checkout"
        }]).then(function(response){

          if (response.addToCart && response.checkout){
            // if the user is adding to cart and ready to checkout
            
            // display total cost to customer, and list of items being purchased then exit connection
            con.end();
          } else if (response.addToCart && !response.checkout){
            // if user is adding to cart, but not ready to checkout
            var newItem = {
              product_name: item.product_name,
              quantity_desired: qty
            }
            var transaction = parseFloat(totalCost + subtotal);
            // push item+qty to cart, add subotal to bill, and redisplay inventory
            cart.push(newItem);
            runProgram();      
          } else if (!response.addToCart && !response.checkout){
            // user is not adding to cart, but is ready to checkout

            // display current items in cart, and existing total.
            console.log("Your cart contains the following items:");
            console.log("---------------------------------------");
            displayCart();
            console.log("---------------------------------------");
            console.log(`Your total is ${totalCost}`);

          } else {
            // user is not adding to cart and not ready to checkout.
            runProgram();
          }

        });


        }
    })
  });
}

function runProgram() {
  con.query("SELECT * FROM products;", function (err, result) {
    if (err) throw err;
    var inventory = result;
    displayInventory(inventory);
    userOrders();
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
  runProgram();

});
