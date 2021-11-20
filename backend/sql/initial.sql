CREATE TABLE students (
    reg_no VARCHAR(10) UNIQUE NOT NULL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(10) NOT NULL,
    password text NOT NULL
);

CREATE TABLE staffs (
    staff_id VARCHAR(10) UNIQUE NOT NULL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(10) NOT NULL,
    password text NOT NULL
);

CREATE TABLE admins (
    email VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY, 
    password text NOT NULL
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