CREATE TABLE tblUsers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password text NOT NULL
);

CREATE TABLE tblTags (
    id SERIAL PRIMARY KEY, 
    tag_name TEXT UNIQUE NOT NULL
);

CREATE TABLE tblNotes (
    id SERIAL PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES tblUsers (id),
    title TEXT,
    note TEXT,
    last_edited TIMESTAMP NOT NULL
);

CREATE TABLE tblTagsNotes (
    tag_id INT,
    note_id INT,
    FOREIGN KEY (tag_id) REFERENCES tblTags(id),
    FOREIGN KEY (note_id) REFERENCES tblNotes(id)
);