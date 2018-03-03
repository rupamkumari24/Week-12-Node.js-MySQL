// ======= NPM MODULES ==========

var bluebird = require('bluebird');
var Table = require('cli-table');
var db = require('mysql2-promise')();
var inquirer = require('inquirer');
var colors = require('colors');

var currentQuant;

db.configure({

    "host": "localhost",
    "user": "root",
    "password": "Emerson24#$",
    "database": "bamazon"
});

// this function will display the list of menu options the manager can view

function showList(){

	return inquirer.prompt([{

        name: "home",
        message: "Please select from below",
        type: "list",
        choices: ['View Products For Sale', 'View Low Inventory', 'Add To Inventory', 'Add Product', 'Exit']
    }]) 
    // To catch any errors that might happen in this section
    .catch(function(err) {

        console.log(err);
    });
}

   function handleListResponse(answers){

		switch (answers.home){

			case 'View Products For Sale':

				process.stdout.write('\033c');
			    console.log("\nProducts for sale!\n".bold.magenta);

				// This calls the function that queries the database
		        return getProducts()

		          // this is a promise that is called once the function get products is finshed and displayes the products in the screen

		          	.then(showProducts)
		          	.then(showList)
					.then(handleListResponse);
				break;

			case 'View Low Inventory':

				process.stdout.write('\033c');
		        console.log("\nLow Inventory\n".bold.magenta);

				// This calls the function that queries the database

		        return getLowInventory()

		          // this is a promise that is called once the function getLowInventory is finshed and displayes the products in the screen

		          	.then(showProducts)
		          	.then(showList)
					.then(handleListResponse);

				break;

			case 'Add To Inventory':

				process.stdout.write('\033c');
		        console.log("\nADD To Current Inventory\n".bold.magenta);

				getProducts()
				.then(function(products) {

					showProducts(products);
					var productList = addProductsToArray(products);
					return addInventory(productList);
				})

				.then(updateDBInventory)
				.then(showList)
				.then(handleListResponse);

			// 	select the ID in which you want to UPDATE, type in the quantity you want to add
			// run inquirer ask for the id and quantity
			// then create a separate functoin to handle add quantity to query the DB - update function 
			// then run show products with note that it successfully displayed
				break;

			case 'Add Product':

			// run inquirer to have the user input the name, the price, the department and quantity

				userAddProduct()

					.then(addNewProduct)
					.then(showList)
					.then(handleListResponse);

				break;

			case 'Exit':

            	console.log("THANKS FOR DROPPING BY. GOOD BYE!".magenta);
            	process.exit();

				break;

			default:

				console.log("NOPE");
		}
   }

// function that queries the db and gets the product data

function getProducts() {

	return db.query("SELECT * FROM products")

		.then(function(rows) {

			return rows[0];
		})
	    .catch(function(err) {
	        console.log(err);
	    });
}

// function that shows all of the products in inventory

function showProducts(rows) {

            var table = new Table({

                head: ['ID', 'Product Name', 'Price', 'Quantity'],
                colWidths: [7, 25, 10, 10]

            });

            rows.forEach(function(value, index) {

                table.push([value.item_ID, value.product_Name, value.price, value.stock_Quantity]);
            });

            console.log(table.toString());          

}

function addProductsToArray(products) {

	return products.map(function(product) {

            return product.item_ID.toString();
	})
}

// This function queries the database and pulls only data with quantity less than 50

function getLowInventory(){

	return db.query("SELECT * FROM products WHERE stock_Quantity < 50")

		.then(function(rows) {
				return rows[0];
			})
	    .catch(function(err) {
	        console.log(err);
	    });
}

// this function will ask 

function addInventory(productList){

	return inquirer.prompt([{

        name: "id",
        message: "Please enter the ID of the product you would like to replenish",
        type: "list",
        choices: productList
    },{

        name: "units",
        message: "How many units would you like to add to the current quantity?",
        type: "input",
        validate: isNumber
    }])      
    // To catch any errors that might happen in this section
    .catch(function(err) {
        console.log(err);
    });
}

function userAddProduct(){

	return inquirer.prompt([{

		name: "dept",
        message: "Please enter the department of your new product",
        type: "list",
        choices: ['Instruments', 'Computer', 'Books', 'Accessories'] 
    },{
    	name: "name",
        message: "Please enter the name of your new product",
        type: "input",
    },{
        name: "price",
        message: "How much will this product cost? (Enter format: 300)",
        type: "input",
        validate: isNumber
    },{
        name: "quantity",
        message: "How many units will you be selling?",
        type: "input",
        validate: isNumber
    }])      
    // To catch any errors that might happen in this section
    .catch(function(err) {

        console.log(err);
    });
}

// this function adds a new product into the database

function addNewProduct(answers){

	var deptID;
	switch(answers.dept){

		case 'Instruments':
		deptID = 1;
		break;

		case 'Computer':
		deptID = 2;
		break;

		case 'Books':
		deptID = 3;
		break;

		case 'Accessories':
		deptID = 4;
		break;
	}

	var name = answers.name.trim();
	var dept = answers.dept.trim();
	var price = parseFloat(answers.price);
	var quantity = parseInt(answers.quantity);

	console.log("\nYour product has been successfully created in the database!".green);
	console.log("Select View Products For Sale to see the update\n".green);	


	return db.query("INSERT INTO products SET ?", {

		product_Name: name,
		department_Name: dept,
		price: price, 
		stock_Quantity: quantity,
		department_ID: deptID
	})
	    .catch(function(err) {

	        console.log(err);
	    });
}

// this function will use the inventory quantity and then update the database
function updateDBInventory(answers){

	var id = answers.id;

	// NEED TO GET THE current quantity of the ID sselected, not sure how to pull this information in. 
	var quantity = answers.units
	console.log("\nYour product has been successfully updated in the database!".green);
	console.log("Select View Products For Sale to see the update\n".green);	
	return db.query("UPDATE products SET stock_Quantity = stock_Quantity + " + quantity + " WHERE item_ID =" + id)

	    .catch(function(err) {

	        console.log(err);
	    });
}

// This function checks to see if the user input is a number or not

function isNumber(input){

	if (input.match(/[0-9]+/)) {
                return true;
            } else {
                return false;
            }
}

// ========== RUN CODE ============

process.stdout.write('\033c');
console.log("\nWelcome to the Bamazon Manager Portal!\n".green);
showList()

    .then(handleListResponse)

