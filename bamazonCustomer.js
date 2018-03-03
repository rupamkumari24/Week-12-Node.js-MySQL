

var fs = require('fs');

// ======= NPM MODULES ==========

var bluebird = require('bluebird');
var Table = require('cli-table');
var db = require('mysql2-promise')();
var inquirer = require('inquirer');
var colors = require('colors');

var prodIdArray = [];

db.configure({

    "host": "localhost",
    "user": "root",
    "password": "Emerson24#$",
    "database": "bamazon"
});

// function that shows all of the products in inventory

function showProducts() {

    return db.query("SELECT * FROM products")

        .spread(function(rows) {

            // instantiate 
            process.stdout.write('\033c');
            console.log("Welcome to Bamazon!".bold.magenta);
            
            var table = new Table({

                head: ['ID', 'Product Name', 'Price'],
                colWidths: [7, 25, 10]
            });

            rows.forEach(function(value, index) {

                table.push([value.item_ID, value.product_Name, value.price]);
                prodIdArray.push(value.item_ID.toString());
            });

            console.log(table.toString());
            startShopping();

        }).catch(function(err) {

            console.log(err);
        });
}

// function that asks the user if they would like shop using the inquirer package

function startShopping() {

    inquirer.prompt([{

        name: "welcome",
        message: "Would you like to shop? (Y/N)",
        type: "input",
        validate: isLetter
    }]).then(function(answers) {

        if (answers.welcome.toUpperCase() === 'Y') {

            // If the user selects Y then the question function is called which prompts them to enter what they want
            questions();

        } else {

            // If the user selects no then the game and and the message below is displayed
            console.log("THANKS FOR DROPPING BY. GOOD BYE!".magenta);
            process.exit();
        }

        // To catch any errors that might happen in this section
    }).catch(function(err) {

        console.log(err);
    });
}

// function that asks the user which products they want to buy and how many

function questions() {

    inquirer.prompt([{

        name: "id",
        message: "Please select the ID of the product you wish to buy",
        type: "list",
        choices: prodIdArray
    }, {

        name: "units",
        message: "How many units would you like to purchase?",
        type: "input",
        validate: isNumber
    }]).then(function(answers) {

        searchDB(answers.id, answers.units);
    });
}

// function that querys the database based on the selections made by the user

function searchDB(id, quantity) {

    return db.query("SELECT * FROM products WHERE ?", [{ item_ID: id }])

        .spread(function(rows) {

            // scenario where are no products with that ID left 
            if (parseInt(rows[0].stock_Quantity) < 1) {

                console.log("\nI am sorry but this item is no longer in stock\n".red);
                return questions();

                // scenario where the amount they entered is greater than the stock available    
            } else if (parseInt(rows[0].stock_Quantity) < parseInt(quantity)) {

                console.log("\nI am sorry but we do not have enough items to fulfil your request\n".red);
                return questions();

                // If the store has enough product we need to fulfil the customers order and this will handle
            } else {

                var totalPrice = parseInt(quantity) * parseInt(rows[0].price);
                var newQuant = parseInt(rows[0].stock_Quantity) - parseInt(quantity);
                var deptID = rows[0].department_ID;

                console.log("This is dept ID: " + deptID, totalPrice);

                // pushes the new total sales number by department to the departments table in the DB
                updateTotalSales(totalPrice, deptID)

                // using this to send the data to the print receipt function
                	.then(printReceipt(totalPrice, rows[0].product_Name, parseInt(quantity), id, newQuant));
            }
        })
    }

// This function tells the user how much their total is and asks if they want to proceed. If they do it displays what they bought

function printReceipt(totalPrice, product_name, quantity, id, newQuant) {

    console.log("in printReceipt");

    inquirer.prompt([{

        name: "receipt",
        message: "Your total today is: " + "$".green + totalPrice + " Would you like to proceed (Y/N)".red,
        type: "input",
        validate: isLetter
    }]).then(function(answers) {

        // If user selects Y then they checkout and run the updateB function

        if (answers.receipt.toUpperCase() == 'Y') {

            console.log("\nYou have successfully purchased:\n".green + "================================".blue);
            console.log(quantity + " " + product_name + "(s) for " + "$".green + totalPrice + "\n================================\n".blue);
            return updateDB(id, newQuant);
        } else {
            // send the user back to the beginning
            return startShopping();
        }
    });
}

function updateTotalSales(totalPrice, deptID) {

    console.log(totalPrice, deptID);
    return db.query("UPDATE departments SET total_Sales = total_Sales + " + totalPrice + " WHERE department_ID =" + deptID)
        .catch(function(err) {

            console.log(err);
        });
}

// this function will update the database to reflect the new quantity within the database based on what the user wanted to buy

function updateDB(id, newQuant) {

    return db.query("UPDATE products SET ? WHERE ?", [{ stock_Quantity: newQuant }, { item_ID: id }])
        .spread(function(rows) {
            // console.log("Our inventory has been updated");
            return startShopping();
        }).catch(function(err) {

            console.log(err);
        });
}

// This function checks to see if the user input is a number or not

function isNumber(input) {

    if (input.match(/[0-9]+/)) {

        return true;
    } else {
        return false;
    }
}

// function to check to see if user input is Y or N all else are rejected

function isLetter(input) {

    if (input === 'Y' || input === 'y' || input === 'n' || input === 'N') {

        return true;
    } else {
        return false;
    }
}

//=== RUN BAMAZON =======
showProducts();