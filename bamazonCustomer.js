// load dependencies
var inquirer = require("inquirer");
var mysql = require("mysql");
var dotenv = require("dotenv");

dotenv.config();

// global variables
var cart = [];
// functions

function displayInventory(inventory) {

  for (i = 0; i < inventory.length; i++) {
    var item = inventory[i];
    console.log(`${item.item_id}) ${item.product_name} | Dept: ${item.department_name} | Price: ${item.price} | Stock: ${item.stock_quantity}`)
  }
}

function displayCart(cart) {
  for (i = 0; i < cart.length; i++) {
    var item = cart[i];
    console.log(`Item No: ${item.item_id}\nProduct: ${item.product_name}\nQty: ${item.qty}\nSubtotal: $${item.subtotal}`);
    console.log("-----------------------");
  }
}

function calcTotal(cart) {
  totalCost = 0;
  for (i = 0; i < cart.length; i++) {
    var val = cart[i].subtotal;
    var val = parseFloat(val);

    totalCost = totalCost + val;
  }
  console.log(`Total: $${parseFloat(totalCost).toFixed(2)}`);
};


function receipt(cart) {
  console.log("Your cart contains the following items:");
  console.log("----------------------------------------");
  displayCart(cart);
  console.log("----------------------------------------");
  calcTotal(cart);
  console.log("\n\nThank you for shopping at bamazon.\n\n");
};

function decreaseStock(cart) {
  // only used after the user has checked out.
  for (i = 0; i < cart.length; i++) {
    var remainingStock = cart[i].remaining_stock; // write to var for readability
    var itemId = cart[i].item_id;
    con.query(`UPDATE products SET stock_quantity = "${remainingStock}" WHERE item_id="${itemId}";`, function (err) {
      if (err) throw err;
    });
  };
};

function userOrders() {
  inquirer.prompt([{
    type: "input",
    message: "Enter the Item ID of the Item you'd like to purchase:",
    name: "itemSelection",
    validate: function validItemNo(val) {
      var num = parseInt(val)
      if (num >= 1 && num <= inventory.length) {
        return true;
      } else {
        console.log("\n\nPlease enter a valid item number.\n")
      }
    }
  }, {
    type: "input",
    message: "How many units would you like to purchase?:",
    name: "amountDesired",
    validate: function nonNegative(qty) {
      if (qty < 0) {
        console.log("\n\nYou cannot enter a negative quantity.\n");
        return;
      }
      return true;
    }
  }]).then(function (response) {
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

        inquirer.prompt({
          message: "Would you like to continue shopping?",
          type: "confirm",
          name: "keepShopping"
        }).then(function (response) {

          if (response.keepShopping) {
            runProgram();
          } else {
            console.log("Thank you for shopping at bamazon.");
            con.end();
          }
        });
      } else {
        var price = parseFloat(item.price).toFixed(2);

        var subtotal = parseFloat(price * qty).toFixed(2);
        console.log(`Your total cost for ${qty} ${item.product_name}(s) is: $${subtotal}\n`);

        inquirer.prompt([{
          type: "confirm",
          message: "Would you like to add these items to your cart?",
          name: "addToCart"
        }, {
          type: "confirm",
          message: "Are you ready to checkout?",
          name: "checkout"
        }]).then(function (response) {

          if (response.addToCart && response.checkout) {

            // if the user is adding to cart and ready to checkout
            var newItem = {
              item_id: item.item_id,
              product_name: item.product_name,
              qty: qty,
              subtotal: parseFloat(qty * item.price).toFixed(2),
              remaining_stock: remainingStock
            };
            // display total cost to customer, and list of items being purchased then exit connection
            console.log(cart);
            cart.push(newItem);
            receipt(cart);
            decreaseStock(cart);
            con.end();

          } else if (response.addToCart && !response.checkout) {

            // if user is adding to cart, but not ready to checkout
            var newItem = {
              item_id: item.item_id,
              product_name: item.product_name,
              qty: qty,
              subtotal: parseFloat(qty * item.price).toFixed(2),
              remaining_stock: remainingStock
            };
            // add item to cart
            cart.push(newItem);
            runProgram();

          } else if (!response.addToCart && response.checkout) {

            // user is not adding to cart, but is ready to checkout
            if (cart.length === 0) {
              // if user didn't want anything.
              console.log("\n\nThank you for shopping at bamazon.\n\n");
              con.end();
            } else {
              // display current items in cart, and existing total.
              receipt(cart);
              decreaseStock(cart);
              con.end();
            }
          } else {
            // user is not adding to cart and not ready to checkout.


            runProgram();
          }


        }
        );
      }
    });
  });
}

function runProgram() {
  con.query("SELECT * FROM products;", function (err, result) {
    if (err) throw err;
    inventory = result;
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

  runProgram();

});
