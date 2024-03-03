/******************************************************************************
* ITE5315 – Assignment 2
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Smit Shah Student ID: N01580089 Date: 02/03/2024
*
*
******************************************************************************/
// importing required modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const exphbs = require('express-handlebars');

// creating an Express application
const app = express();
app.use(express.urlencoded({ extended: true }));

// setting the port for the application
const port = process.env.port || 3000;

// serving static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        displayAvgReviews: function (avgReviews) {
            return avgReviews !== '' ? avgReviews : 'N/A';
        }
    }
}));
app.set('view engine', 'hbs');

// handling the '/' route, rendering 'index.hbs' with dynamic data
app.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

// handling the '/users' route, sending a simple response
app.get('/users', function (req, res) {
    res.send('respond with a resource');
});

// Asn 1 Routes 

// Route for '/data'
app.get('/data', (req, res) => {
    const filePath = path.join(__dirname, 'datasetA.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.send('Error reading JSON file');
        } else {
            const jsonData = JSON.parse(data);
            console.log(jsonData);
            res.render('data', { data: jsonData, message: 'JSON data is loaded and ready!' });
        }
    });
});

// Route for '/data/isbn/:index'
app.get('/data/isbn/:index', (req, res) => {
    const index = parseInt(req.params.index);
    fs.readFile('datasetA.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
        } else {
            const jsonData = JSON.parse(data);
            if (index >= 0 && index < jsonData.length) {
                const bookISBN = jsonData[index].ISBN_13;
                res.render('isbn', { isbn: bookISBN, index: index });
            } else {
                res.status(404).send('Book ISBN not found for the provided index');
            }
        }
    });
});

// Route for '/data/search/isbn/'
//Handle both GET and POST requests for ISBN search
app.all('/data/search/isbn/', (req, res) => {
    if (req.method === 'GET') {
        // Display the search form for ISBN
        res.render('isbn-search-form');
    } else if (req.method === 'POST') {
        // Handle the form submission for ISBN search
        const searchISBN = req.body.ISBN;
        const filePath = path.join(__dirname, 'datasetA.json');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error in searching ISBN in JSON file');
            } else {
                const jsonData = JSON.parse(data);
                const result = jsonData.find((entry) => entry.ISBN_13 === searchISBN);

                if (result) {
                    res.render('isbn-search-result', { result });
                } else {
                    res.status(404).send('<h2>No book entry located for the provided ISBN.</h2>');
                }
            }
        });
    } else {
        // Handle other HTTP methods if needed
        res.status(405).send('Method Not Allowed');
    }
});

// Route for '/data/search/title/'
// Handle both GET and POST requests for Title search
app.all('/data/search/title/', (req, res) => {
    if (req.method === 'GET') {
        // Display the search form for Title
        res.render('title-search-form');
    } else if (req.method === 'POST') {
        // Handle the form submission for Title search
        const searchTitle = req.body.title.toLowerCase();
        const filePath = path.join(__dirname, 'datasetA.json');
        console.log(searchTitle);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error in searching title in JSON file');
            } else {
                const jsonData = JSON.parse(data);
                const results = jsonData.filter((entry) => entry.title.toLowerCase().includes(searchTitle));
                console.log(results);
                if (results.length > 0) {
                    res.render('title-search-result', { searchTitle, results });
                } else {
                    res.status(404).send('<h2>No book entry located for the provided Title.</h2>');
                }
            }
        });
    } else {
        // Handle other HTTP methods if needed
        res.status(405).send('Method Not Allowed');
    }
});

// Route for '/allData'
app.get('/allData', (req, res) => {
    // Read the JSON file asynchronously
    fs.readFile('datasetA.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
        } else {
            // Parse the entire JSON data
            const jsonData = JSON.parse(data);
            // Render the 'allData' view with the data
            res.render('allData', { books: jsonData });
        }
    });
});

// handling any other route, rendering 'error.hbs' with an error message
app.get('*', function (req, res) {
    res.render('error', { title: 'Error', message: 'Wrong Route' });
});

// starting the server and listening on the port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
