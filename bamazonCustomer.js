var inquirer = require("inquirer");
var mysql = require("mysql");
var dotenv = require("dotenv");

dotenv.config();


// functions
function displayInventory(inventory){

}

// Creates initial sql connection to the database
var con = mysql.createConnection({
  host: "localhost",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  port: "3306",
  database: "bamazon"
});

con.connect(function(err){
  if (err) {
    throw err;
  }
  console.log("connected");


  con.query("SELECT * FROM products;", function (err, result) {
    if (err) throw err;
    var inventory = result;
    displayInventory(inventory);

  });
});
