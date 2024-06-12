/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const { Book } = require("../models");

module.exports = function (app) {

  app.route('/api/books')
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = await Book.find({});
        if (!books) {
          res.json([]);
          return
        }
        const formatData = books.map(book => {
          return {
            _id: book._id,
            title: book.title,
            commentcount: book.comments.length
          };
        });
        res.json(formatData);
        return;
      } catch (err) {
        console.log(err);
        res.json([]);
      }
    })

    .post(async (req, res) => {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send('missing required field title');
      }
      const newBook = new Book({ title, comments: [] });
      try {
        const book = await newBook.save();
        res.json({ _id: book._id, title: book.title });
      } catch (err) {
        res.send("there was an error saving the book");
      }
    })

    .delete(async (req, res) => {
      //if successful response will be 'complete delete successful'
      try {
        const deleted = await Book.deleteMany({});
        console.log("deleted all books", deleted);
        res.send('complete delete successful');
      } catch (err) {
        res.send("there was an error deleting the books");
      }
    });



  app.route('/api/books/:id')
    .get(async (req, res) => {
      // get book ID
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      try {
        // find book in DB by ID
        const book = await Book.findById(bookid);
        if (!book) {
          res.send("no book exists");
          return;
        }
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.send("no book exists");
      }
    })

    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;

      // Check if comment is provided
      if (!comment) {
        return res.send("missing required field comment");
      }

      try {
        // Find the book by ID
        const book = await Book.findById(bookid);

        // Check if the book exists
        if (!book) {
          return res.send("no book exists");
        }

        // Add the comment to the book's comments array
        book.comments.push(comment);

        // Save the book with the new comment
        await book.save();

        // Return the updated book object
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        // Handle errors and send an appropriate response
        res.status(500).json({ error: "An error occurred while adding the comment" });
      }
    })

    .delete(async (req, res) => {
      let bookid = req.params.id;
      try {
        // Find the book by ID
        const deleted = await Book.findByIdAndDelete(bookid);

        // If the book doesn't exist, send a response
        if (!deleted) {
          return res.send("no book exists");
        }
        // If successful, send a response
        res.send('delete successful');
      } catch (err) {
        // Handle errors and send a response
        return res.send("no book exists");
      }
    });

};
