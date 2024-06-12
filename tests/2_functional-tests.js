/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { Book } = require('../models');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {

    let validId;

    // Before hook to create a book in the database
    before(async function () {
      try {
        const newBook = new Book({ title: 'Test Book', comments: [] });
        const savedBook = await newBook.save();
        validId = savedBook._id;
      } catch (err) {
        throw new Error('Failed to create a book for testing');
      }
    });

    // After hook to clean up the created book
    after(async function () {
      try {
        await Book.findByIdAndDelete(validId);
      } catch (err) {
        throw new Error('Failed to delete the test book');
      }
    });

    suite('POST /api/books with title => create book object/expect book object', function () {
      // #1
      test('Test POST /api/books with title', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Title' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'Test Title');
            done();
          })
      });
      // #2
      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: '' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          })
      });

    });


    suite('GET /api/books => array of books', function () {
      // #3
      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);

            // Ensure the array contains books with the expected properties
            res.body.forEach(book => {
              assert.isObject(book);
              assert.property(book, '_id');
              assert.property(book, 'title');
            });

            done();
          })
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function () {
      // #4
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .get('/api/books/nonExistentId')
          .end((err, res) => {
            // assert.equal(res.status, 400);
            assert.equal(res.text, 'no book exists');
            done();
          })
      });

      // #5
      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .get('/api/books/' + validId)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            assert.equal(res.body._id, validId.toString());
            assert.equal(res.body.title, 'Test Book');
            assert.isArray(res.body.comments);
            done();
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function () {

      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .post('/api/books/' + validId)
          .send({ comment: 'Test Comment' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, validId.toString());
            assert.equal(res.body.comments[0], 'Test Comment');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function (done) {
        chai.request(server)
          .post('/api/books/' + validId)
          .send({ comment: '' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "missing required field comment");
            done();
          })
      });

      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        chai.request(server)
          .post('/api/books/nonExistentId')
          .send({ comment: 'Test Comment' })
          .end((err, res) => {
            assert.equal(res.text, "no book exists");
            done();
          })
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function () {

      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .delete('/api/books/' + validId)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "delete successful");
            done();
          })
      });

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        chai.request(server)
          .delete('/api/books/nonExistentId')
          .end((err, res) => {
            assert.equal(res.text, "no book exists");
            done();
          })
      });

    });

  });

});
