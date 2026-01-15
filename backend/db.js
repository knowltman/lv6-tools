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

export default db;
