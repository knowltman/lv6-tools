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

// Local Server Connection
const db = mysql.createPool({
  host: "localhost", // or your MySQL host
  user: "root", // your MySQL username
  password: "root1234", // your MySQL password
  database: "lv6_tools", // your MySQL database name
});

export default db;
