import mysql from "mysql2";

// Create a connection to the MySQL database on the server
// const db = mysql.createPool({
//   connectionLimit: 5, // Adjust as needed
//   host: "localhost", // or your MySQL host
//   user: "lv6admin", // your MySQL username
//   password: "zgx2jve_myr8cmb6VQG", // your MySQL password
//   database: "lv6_tools", // your MySQL database name
//   waitForConnections: true,
//   queueLimit: 0,
// });

// DB_CONNECTION=mysql
// DB_HOST=localhost
// DB_PORT=3306
// DB_DATABASE=s189291_tall_ato
// DB_USERNAME=u189291_tall_ato
// DB_PASSWORD=Ms9Amxz9q3Usrz4U

// Local Server Connection
// const db = mysql.createPool({
//   host: "localhost", // or your MySQL host
//   user: "root", // your MySQL username
//   password: "root1234", // your MySQL password
//   database: "lv6_tools", // your MySQL database name
//   port: 3306,
// });

// const db = mysql.createPool({
//   host: "https://tall-atoll-189291.1wp.site/", // or your MySQL host
//   port: 3306,
//   database: "s189291_tall_ato", // your MySQL database name
//   user: "u189291_tall_ato", // your MySQL username
//   password: "Ms9Amxz9q3Usrz4U", // your MySQL password
// });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

console.log("USER:", process.env.DB_USER);

db.query("SELECT 1", (err) => {
  if (err) console.error(err);
  else console.log("DATABASE: connected 👍 \n***************************");
});

// Create hymns table with proper structure
db.query(
  `CREATE TABLE IF NOT EXISTS hymns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_hymn_number (number)
  )`,
  (err) => {
    if (err) {
      console.error("Error creating hymns table:", err);
    } else {
      console.log("Hymns table ready");
      // Check if id column has AUTO_INCREMENT and fix it if needed
      db.query(`SHOW CREATE TABLE hymns`, (err, results) => {
        if (!err && results[0] && results[0]["Create Table"]) {
          const createTableSQL = results[0]["Create Table"];
          if (!createTableSQL.includes("AUTO_INCREMENT")) {
            console.log("Hymns table missing AUTO_INCREMENT, fixing...");
            // Alter the existing table to add AUTO_INCREMENT without dropping data
            db.query(
              `ALTER TABLE hymns MODIFY COLUMN id INT AUTO_INCREMENT`,
              (err) => {
                if (err) {
                  console.error("Error modifying hymns table:", err);
                } else {
                  console.log("Hymns table updated with AUTO_INCREMENT");
                }
              },
            );
          }
        }
      });
    }
  },
);

db.query("SELECT * FROM hymns", (err, results) => {
  if (err) {
    console.error("DB ERROR:", err);
  } else {
    console.log("DATABASE: connected 👍");
    console.log(`Hymns found: ${results.length}`);
    console.log("***************************");
  }
});

export default db;
