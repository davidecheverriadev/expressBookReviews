const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

let users = {};
public_users.post("/register", (req,res) => {
   const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }
    
    users[username] = { password };
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
        const response = await axios.get('http://localhost:3000');  
        return res.status(200).json(response.data); 
      } catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ message: "Error fetching books" });
      }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn = req.params.isbn;
    
    try {
        const response = await axios.get(`http://localhost:3000/isbn/${isbn}`);  
        const book = response.data;
        
        if (book) {
            return res.status(200).json(book); 
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error('Error fetching book:', error);
        return res.status(500).json({ message: "Error fetching book" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const author = req.params.author.toLowerCase();
    
    try {
        const response = await axios.get(`http://localhost:3000/author/${author}`); 
        const filteredBooks = response.data;

        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks); 
        } else {
            return res.status(404).json({ message: "No books found for this author" }); 
        }
    } catch (error) {
        // Si ocurre un error al hacer la solicitud, lo mostramos
        console.error('Error fetching books by author:', error);
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const title = req.params.title.toLowerCase();
    
    try {
        
        const response = await axios.get(`http://localhost:3000/title/${title}`); 
        const filteredBooks = response.data;

        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks);  
        } else {
            return res.status(404).json({ message: "No books found with this title" }); 
        }
    } catch (error) {
        // Si ocurre un error al hacer la solicitud, lo mostramos
        console.error('Error fetching books by title:', error);
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
