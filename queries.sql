CREATE TABLE book(
    idBook SERIAL PRIMARY KEY,
    title VARCHAR(100),
    author VARCHAR(50),
    cover_url VARCHAR(255),
    isbn VARCHAR(13),
    genre VARCHAR(255),
    publisher VARCHAR(50),
    publish_year VARCHAR(50),
    score INTEGER CHECK (score >= 0 AND score <= 10),
    read_date DATE
);

CREATE TABLE note(
    idNote SERIAL PRIMARY KEY,
    idBook INTEGER REFERENCES book(idBook),
    note VARCHAR(255)
);

INSERT INTO book (title, author, cover_url, isbn, genre, publisher, publish_year, score, read_date) 
VALUES ('Percy Jackson & the Olympians', 'RICK RIORDAN', 'https://covers.openlibrary.org/b/isbn/9788498386264.jpg', '9788498386264', 'Fiction - Greek Mythology', 'Salamandra', '2008', 9, '2024-03-09');

INSERT INTO note (idBook, note)
VALUES (1, 'A fascinating book with a great storyline.');
