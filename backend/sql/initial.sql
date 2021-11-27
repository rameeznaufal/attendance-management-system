CREATE TABLE student (
    reg_no VARCHAR(10) UNIQUE NOT NULL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(10) NOT NULL,
    password text NOT NULL
);

CREATE TABLE staff (
    staff_id VARCHAR(10) UNIQUE NOT NULL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(10) NOT NULL,
    password text NOT NULL
);

CREATE TABLE admin (
    email VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY, 
    password text NOT NULL
);

CREATE TABLE course (
    course_id VARCHAR(10) UNIQUE NOT NULL PRIMARY KEY, 
    course_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE courses_taught (
    staff_id VARCHAR(10),
    course_id VARCHAR(10),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    PRIMARY KEY(staff_id, course_id)
);

CREATE TABLE enrolled (
    reg_no VARCHAR(10),
    course_id VARCHAR(10),
    FOREIGN KEY (reg_no) REFERENCES student(reg_no) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    PRIMARY KEY(reg_no, course_id)
);

CREATE TABLE slot (
    slot_id INT NOT NULL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE class (
    class_id SERIAL,
    course_id VARCHAR(10) NOT NULL,
    class_date TIMESTAMP NOT NULL,
    slot_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES slot(slot_id) ON DELETE CASCADE,
    PRIMARY KEY(class_id, course_id)
);

CREATE TABLE attendance (
    reg_no VARCHAR(10),
    class_id INT,
    course_id VARCHAR(10),
    status INT NOT NULL,    
    FOREIGN KEY (reg_no) REFERENCES student(reg_no) ON DELETE CASCADE,
    FOREIGN KEY (class_id, course_id) REFERENCES class(class_id, course_id) ON DELETE CASCADE,
    PRIMARY KEY(reg_no, class_id, course_id)
);