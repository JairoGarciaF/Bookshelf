import pg from "pg";
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bookshelf",
  password: "admin",
  port: 5432,
});

db.connect();

let books = [];
let bookInfo = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/assets", express.static("assets"));

app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM book");
  books = result.rows;
  res.render("index.ejs", {
    listBooks: books,
  });
});

app.get("/byDate", async (req, res) => {
  const result = await db.query("SELECT * FROM book ORDER BY read_date DESC");
  books = result.rows;
  res.render("index.ejs", {
    listBooks: books,
  });
});

app.get("/byRating", async (req, res) => {
  const result = await db.query("SELECT * FROM book ORDER BY score DESC");
  books = result.rows;
  res.render("index.ejs", {
    listBooks: books,
  });
});

app.get("/book", async (req, res) => {
  const id = req.query.id;
  const result = await db.query(
    "SELECT * FROM book JOIN note ON book.idbook=$1",
    [id]
  );
  bookInfo = result.rows;
  res.render("book.ejs", {
    bookInfo: bookInfo,
  });
});

app.post("/deleteBook", async (req, res) => {
  const deleteBookId = req.body.deleteBookId;
  await db.query("DELETE FROM book WHERE idbook=$1", [deleteBookId]);
  res.redirect("/");
});

app.post("/addBook", async (req, res) => {
  const isbn = req.body.isbn;
  const score = req.body.score;
  const read_date = req.body.read_date;
  try {
    const bookInfo = await axios.get(
      `https://openlibrary.org/search.json?isbn=${isbn}&page=1`
    );
    const title = bookInfo.data.docs[0]?.title || "Title not available";
    const author =
      bookInfo.data.docs[0]?.author_name?.[0] || "Author not available";
    const cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}.jpg`;
    const genre = `${
      bookInfo.data.docs[0]?.subject?.[0] || "Genre not available"
    } - ${bookInfo.data.docs[0]?.subject?.[1] || "Subgenre not available"}`;
    const publisher =
      bookInfo.data.docs[0]?.publisher?.[0] || "Publisher not available";
    const publish_year =
      bookInfo.data.docs[0]?.publish_year?.[0] || "Publish Year not available";

    await db.query(
      "INSERT INTO book (title, author, cover_url, isbn, genre, publisher, publish_year, score, read_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        title,
        author,
        cover_url,
        isbn,
        genre,
        publisher,
        publish_year,
        score,
        read_date instanceof Date ? read_date.toISOString() : read_date,
      ]
    );
  } catch (error) {
    console.log(error);
  }

  res.redirect("/");
});

app.post("/addNote", async (req, res) => {
  const idBook = req.body.idBook;
  const note = req.body.note;
  try {
    await db.query("INSERT INTO note (idbook ,note) VALUES ($1, $2)", [
      idBook,
      note,
    ]);
  } catch (error) {
    console.log(error);
  }
  res.redirect(`/book?id=${idBook}`);
});

app.post("/editNote", async (req, res) => {
  const idBook = req.body.idBook;
  const idNote = req.body.idNote;
  const note = req.body.edit_note;

  await db.query("UPDATE note SET note=$1 WHERE idnote=$2", [note, idNote]);

  res.redirect(`/book?id=${idBook}`);
});

app.post("/deleteNote", async (req, res) => {
  const idNote = req.body.deleteNoteId;
  const idBook = req.body.idBook;

  await db.query("DELETE FROM note WHERE idnote=$1", [idNote]);

  res.redirect(`/book?id=${idBook}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
