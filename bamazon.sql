
DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

DROP TABLE IF EXISTS products;

CREATE TABLE products (

item_ID INT NOT NULL AUTO_INCREMENT,
product_Name VARCHAR(45), 
department_ID VARCHAR(45),
price DECIMAL(7,2), 
stock_Quantity INTEGER (10),
PRIMARY KEY(item_ID)

);

INSERT INTO products (product_Name, department_ID, price, stock_Quantity) 

VALUES ('Dell Laptop', 'Computer', 300.00, 500), 
('Saxophone', 'Instruments', 650.00, 350),
('Grand Piano', 'Instruments', 1200.00, 200), 
('Guitar', 'Instruments', 950.00, 1000), s
('Jazz Theory', 'Books', 25.95, 250),
('Christmas Favorites', 'Books', 10.50, 425),
('Song-writing 101', 'Books', 18.25, 150), 
('Mouthpiece', 'Accessories', 24.50, 20), 
('AC Adaptor', 'Accessories', 5.25, 200), 
('Headphone', 'Accessories', 15.50,100); 


USE bamazon;

SELECT * FROM products;


USE bamazon;
DROP TABLE IF EXISTS departments

CREATE TABLE departments (

department_ID INT NOT NULL AUTO_INCREMENT,
department_Name VARCHAR(45),
overhead_Costs INT(10),
total_Sales DECIMAL(7,2), 
PRIMARY KEY(departmentID)

);

INSERT INTO departments (department_Name, overhead_Costs) 
VALUES ('Instruments', 50000), 
('Computer',1000,)
('Books', 20000),
('Accessories', 15000); 


USE bamazon;

SELECT * FROM departments;


--Alter table products add department_ID VARCHAR(45);
--Update products set department_ID = '1' where department_Name='Instruments'