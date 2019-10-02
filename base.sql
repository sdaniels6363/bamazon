DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products(
  item_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(6,2) NOT NULL,
  stock_quantity INT
);

INSERT INTO products (product_name, department_name, price, stock_quantity) 
  VALUES ('Airpods','Electronics',159.99,100),
         ('Soccer Ball','Sports',19.99,200),
         ('Microwave','Home Goods',59.99,50),
         ('Wilson Football','Sports',19.99,300),
         ('Nintendo Switch','Electronics',299.99,100),
         ('CanaKit Raspberry Pi 4 4GB Basic Starter Kit with Fan','Electronics',79.99,300),
         ('Xbox One X','Electronics',413.98,30),
         ('Greenworks PRO 21-Inch 80V Cordless Lawn Mower','Outdoors',488.99,20),
         ('The Ridge Wallet Authentic','Clothing and Fashion',75.00,30),
         ('Borla 140504 Cat-Back Exhaust System for Ford Focus ST','Automotive',755.27,100);

