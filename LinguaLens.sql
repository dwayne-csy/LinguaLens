CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_photo VARCHAR(255),
    contact_number VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE extracted_texts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255),
        text_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

   