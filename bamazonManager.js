var inquirer = require('inquirer');
var mysql = require('mysql');
var dotenv = require('dotenv');

dotenv.config();

inventory = [];

function keepRunning() {
  setTimeout(function () {
    console.log("\n")
    inquirer.prompt({
      message: "Would you like to continue?",
      type: "confirm",
      name: "confirm"
    }).then(function (response) {
      if (response.confirm) {
        runProgram();
      } else {
        con.end();
      }
    });

  }, 1000);
}

function displayInventory() {
  con.query("SELECT * FROM products;", function (err, result) {
    if (err) throw err;

    // Print every item from the inventory.
    for (i = 0; i < result.length; i++) {
      var item = result[i];
      console.log(`${item.item_id}) ${item.product_name} | Dept: ${item.department_name} | Price: ${item.price} | Stock: ${item.stock_quantity}`);
      inventory.push(item.item_id);
    }
    console.log("\n")
  });
  keepRunning();
}

function viewLowInventory() {
  con.query(`SELECT * FROM products WHERE stock_quantity<="5";`, function (err, response) {
    if (err) throw err;
    if (response) {
      if (response.length > 1) {
        console.log(`\nThe following Items are low on inventory:\n`)
        for (i = 0; i < response.length; i++) {
          var item = response[i];
          var itemId = item.item_id;
          var prodName = item.product_name;
          var deptName = item.department_name;
          var qty = item.stock_quantity;
          console.log(`${itemId}) Product Name: ${prodName} | Dept Name: ${deptName} | Qty: ${qty}`)
        }
      } else if (response.length === 1) {
        console.log(`\nThe following Items are low on inventory:\n`)
        var item = response[0];
        var itemId = item.item_id;
        var prodName = item.product_name;
        var deptName = item.department_name;
        var qty = item.stock_quantity;
        console.log(`${itemId}) Product Name: ${prodName} | Dept Name: ${deptName} | Qty: ${qty}`)
      } else {
        console.log("\nNo inventory is low.\n")
      }
      keepRunning();
    }
  });
};

function increaseStock() {
  inquirer.prompt([{
    message: "What Item ID would you like add stock for?",
    type: "input",
    name: "itemId",
    validate: function (val) {
      if (inventory.contains(val)) {
        return true;
      } else {
        console.log("Please enter a valid item number.")
      }
    }
  }, {
    message: "How many items would you like to add?",
    type: "input",
    name: "qtyToAdd",
    validate: function (val) {
      if (typeof (val) !== "number" || parseInt(val) <= 0) {
        console.log("Please enter a valid number, or number greater than 0.");
        return false;
      } else {
        return true;
      }
    }
  }]).then(function (response) {
    var stockToAdd = response.qtyToAdd;
    var itemId = response.itemId;
    // this query determines current stock
    con.query(`SELECT stock_quantity FROM products WHERE item_id="${itemId}";`, function (err, response) {
      if (err) throw err;
      currentStock = response[0];
    });
    // this query updates the stock.
    var newStock = currentStock + stockToAdd;
    con.query(`UPDATE products SET stock_quantity = "${newStock}" WHERE item_id="${itemId}";`, function (err, response) {
      if (err) throw err;
      // print response
      console.log(`Quantity for ${itemId} has been updated to: ${response.stock_quantity}!`);

    });
    keepRunning();
  });
};

function addNewProduct() {
  inquirer.prompt([{
    // product name
    message: "What item would you like to add?",
    type: "input",
    name: "prodName"
  }, {
    // dept name
    message: "What department does the item belong in?",
    type: "input",
    name: "deptName"
  }, {
    // price
    message: "What is the item's price? (Enter without the $ sign)",
    type: "input",
    name: "price",
  }, {
    // quantity
    message: "How many of the new item would you like to add?",
    type: "input",
    name: "quantity",
    validate: function (qty) {
      if (typeof (parseInt(qty)) !== "number") {
        console.log("Please enter a valid number!");
        return false;
      }
      return true;
    }
  }
  ]).then(function (response) {
    var prodName = response.prodName;
    var deptName = response.deptName;
    var price = parseFloat(response.price).toFixed(2);
    var quantity = parseInt(response.quantity);

    con.query(`INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES("${prodName}","${deptName}",${price},${quantity});`, function (err, response) {
      if (err) throw err;
      console.log(`${prodName} was added to bamazon's inventory, the new product ID is ${response.insertId}`);
      keepRunning();
    });
  });
}



function runProgram() {

  inquirer.prompt({
    message: "What would you like to do?",
    type: "list",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
    name: "choice"
  }).then(function (selection) {
    var choice = selection.choice;
    switch (choice) {
      case "View Products for Sale":
        displayInventory();
        break;
      case "View Low Inventory":
        viewLowInventory();
        break;
      case "Add to Inventory":
        displayInventory();
        increaseStock();
        break;
      case "Add New Product":
        addNewProduct();
        break;
    }
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
