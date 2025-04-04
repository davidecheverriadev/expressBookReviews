const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.hasOwnProperty(username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    if (!isValid(username) || users[username].password !== password) {
        return false;
    }
    try {
        const decoded = jwt.verify(token, "secretkey");
        if (decoded.username === username) {
            return true;
        }
    } catch (err) {
        return false;
    }
    return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
   const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username) || users[username].password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign({ username }, "secretkey", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
    const { review, username, password, token } = req.body;
    
   if (!authenticatedUser(username, password, token)) {
        return res.status(403).json({ message: "Invalid credentials or unauthorized access" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }
    
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

public_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { username, password, token } = req.body;

    if (!authenticatedUser(username, password, token)) {
        return res.status(403).json({ message: "Invalid credentials or unauthorized access" });
    }
    
    if (!books[isbn] || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }
    
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
