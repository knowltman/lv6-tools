import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

import db from "./db.js"; // note the .js at the end

const router = express.Router();

const secretKey = process.env.JWT_SECRET;

const hashPassword = async (password) => {
  const saltRounds = 10; // You can adjust the salt rounds based on your security needs
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use path relative to project root (assuming server runs from root)
    const uploadPath = path.join(process.cwd(), "public", "uploads");
    console.log("Upload destination path:", uploadPath);
    console.log("Resolved path:", path.resolve(uploadPath));
    console.log("Current working directory:", process.cwd());

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      console.log("Creating uploads directory:", uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (increased from 5MB)
  },
  fileFilter: (req, file, cb) => {
    // More permissive file filter - check both mimetype and extension
    const allowedMimetypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "image/svg+xml",
    ];

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".tiff",
      ".tif",
      ".svg",
    ];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    console.log("File upload check:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extension: fileExtension,
    });

    if (
      allowedMimetypes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true);
    } else {
      console.log("File rejected:", {
        mimetype: file.mimetype,
        extension: fileExtension,
      });
      cb(
        new Error(
          `File type not allowed. Allowed types: ${allowedMimetypes.join(", ")} or extensions: ${allowedExtensions.join(", ")}`,
        ),
        false,
      );
    }
  },
});

// const password = "Bishopric2024";
// hashPassword(password)
//   .then((hashed) => {
//     console.log("Hashed Password:", hashed);
//   })
//   .catch((err) => {
//     console.error(err);
//   });

router.get("/", (req, res) => {
  res.send("Welcome to the LV6 Tools API!");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = results[0];

      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
        const memberId = user.memberId;
        return res.json({ token, memberId });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    },
  );
});

// User management endpoints
router.get("/users", (req, res) => {
  db.query(
    `SELECT u.id, u.username, u.memberId, u.image, m.first_name, m.last_name, m.calling
     FROM users u
     LEFT JOIN ward_members m ON u.memberId = m.id
     ORDER BY u.username`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    },
  );
});

router.post("/upload", upload.single("image"), (req, res) => {
  console.log("Upload endpoint called");
  console.log("Request file:", req.file);
  console.log("Request body:", req.body);

  try {
    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({
        error: "No file uploaded",
        details: "Make sure the file is selected and is a valid image format",
      });
    }

    console.log("File uploaded successfully:", req.file.filename);

    // Return the file path that can be used by the frontend
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log("Returning URL:", fileUrl);

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("Upload error caught:", error);
    console.error("Error stack:", error.stack);

    // Handle multer errors specifically
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        details: "Maximum file size is 10MB",
      });
    }

    if (error.message.includes("File type not allowed")) {
      return res.status(400).json({
        error: "Invalid file type",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "File upload failed",
      details: error.message,
    });
  }
});

router.post("/users", async (req, res) => {
  const { username, password, first_name, last_name, calling, image } =
    req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // First, create or update the member record
    let memberId;
    if (first_name && last_name) {
      const memberQuery = `
        INSERT INTO ward_members (first_name, last_name, calling)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        calling = VALUES(calling)
      `;
      const memberResult = await new Promise((resolve, reject) => {
        db.query(
          memberQuery,
          [first_name, last_name, calling || null],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        );
      });
      memberId = memberResult.insertId;
    }

    // Then create the user record
    const userQuery = `
      INSERT INTO users (username, password, memberId, image)
      VALUES (?, ?, ?, ?)
    `;
    const userResult = await new Promise((resolve, reject) => {
      db.query(
        userQuery,
        [username, hashedPassword, memberId, image || null],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        },
      );
    });

    // Return the created user with member data
    db.query(
      `SELECT u.id, u.username, u.memberId, u.image, m.first_name, m.last_name, m.calling
       FROM users u
       LEFT JOIN ward_members m ON u.memberId = m.id
       WHERE u.id = ?`,
      [userResult.insertId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows[0]);
      },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { username, password, first_name, last_name, calling, image } =
    req.body;

  try {
    // Get current user data
    const currentUser = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update member data if provided
    if (
      first_name !== undefined ||
      last_name !== undefined ||
      calling !== undefined
    ) {
      const memberUpdate = {};
      const memberValues = [];

      if (first_name !== undefined) {
        memberUpdate.first_name = first_name;
        memberValues.push(first_name);
      }
      if (last_name !== undefined) {
        memberUpdate.last_name = last_name;
        memberValues.push(last_name);
      }
      if (calling !== undefined) {
        memberUpdate.calling = calling;
        memberValues.push(calling);
      }

      if (Object.keys(memberUpdate).length > 0) {
        const setClause = Object.keys(memberUpdate)
          .map((key) => `${key} = ?`)
          .join(", ");
        const memberQuery = `UPDATE ward_members SET ${setClause} WHERE id = ?`;
        memberValues.push(currentUser.memberId);

        await new Promise((resolve, reject) => {
          db.query(memberQuery, memberValues, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      }
    }

    // Update user data
    let userQuery = "UPDATE users SET username = ?";
    let userValues = [username];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userQuery += ", password = ?";
      userValues.push(hashedPassword);
    }

    if (image !== undefined) {
      userQuery += ", image = ?";
      userValues.push(image);
    }

    userQuery += " WHERE id = ?";
    userValues.push(userId);

    await new Promise((resolve, reject) => {
      db.query(userQuery, userValues, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Return updated user data
    db.query(
      `SELECT u.id, u.username, u.memberId, u.image, m.first_name, m.last_name, m.calling
       FROM users u
       LEFT JOIN ward_members m ON u.memberId = m.id
       WHERE u.id = ?`,
      [userId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows[0]);
      },
    );
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "User deleted successfully" });
  });
});

// Route to get data from SQLite
router.get("/hymns", (req, res) => {
  db.query("SELECT * FROM hymns ORDER BY number", [], (err, rows) => {
    if (err) {
      res.status(400).send(err.message);
      return;
    }
    res.json(rows);
  });
});

router.post("/hymns", (req, res) => {
  const { number, name } = req.body;

  if (!number || !name) {
    return res
      .status(400)
      .json({ message: "Hymn number and name are required" });
  }

  db.query(
    "INSERT INTO hymns (number, name) VALUES (?, ?)",
    [number, name],
    (err, result) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json({ id: result.insertId, number, name });
    },
  );
});

router.delete("/hymns/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM hymns WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(400).send(err.message);
      return;
    }
    res.json({ message: "Hymn deleted successfully" });
  });
});

router.get("/members", (req, res) => {
  db.query(
    `
    SELECT wm.*, u.image
    FROM ward_members wm
    LEFT JOIN users u ON wm.id = u.memberId
  `,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

//get a ward member by the id
router.get("/members/:id", (req, res) => {
  const memberId = req.params.id;

  db.query(
    `
    SELECT wm.*,
           u.image,
           -- Concatenate speaker dates separately
           GROUP_CONCAT(DISTINCT sd.date ORDER BY sd.date ASC SEPARATOR ' ') AS speaker_dates,
           -- Concatenate prayer dates separately
           GROUP_CONCAT(DISTINCT pd.date ORDER BY pd.date ASC SEPARATOR ' ') AS prayer_dates
    FROM ward_members wm
    LEFT JOIN users u ON wm.id = u.memberId
    LEFT JOIN speaker_dates sd ON wm.id = sd.speaker_id
    LEFT JOIN prayer_dates pd ON wm.id = pd.speaker_id
    WHERE wm.id = ?
    GROUP BY wm.id, wm.first_name, wm.last_name, wm.active, wm.isYouth, wm.sex, wm.can_ask, wm.calling, u.image;
    `,
    [memberId],
    (err, row) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      if (!row) {
        res.status(404).send("Member not found");
        return;
      }
      res.json(row);
    },
  );
});

router.get("/all-programs", (req, res) => {
  db.query(
    "SELECT id, created_by, DATE_FORMAT(date, '%Y-%m-%d') AS date, program_data FROM programs",
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

router.post("/programs", (req, res) => {
  const { date, formValues, user } = req.body;

  const programData = JSON.stringify(formValues);

  const formattedDate = date.split("T")[0];

  const checkQuery = `SELECT id, program_data, DATE_FORMAT(date, '%Y-%m-%d') AS date, created_by FROM programs WHERE date = ?`;

  db.query(checkQuery, [formattedDate], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (rows.length > 0) {
      // Program with this date already exists, perform an update
      const updateQuery = `UPDATE programs SET program_data = ? WHERE date = ?`;
      db.query(updateQuery, [programData, formattedDate], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Program updated successfully", id: rows[0].id });
      });
    } else {
      // No program with this date, insert a new one
      const insertQuery = `INSERT INTO programs (date, program_data, created_by) VALUES (?, ?, ?)`;
      db.query(
        insertQuery,
        [formattedDate, programData, user.id],
        function (err, result) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({
            message: "Program saved successfully",
            id: result.insertId,
          });
        },
      );
    }
  });
});

router.get("/programs/:date", (req, res) => {
  const { date } = req.params;

  // Ensure the date is in the correct format
  const formattedDate = date.split("T")[0]; // Keep it in 'YYYY-MM-DD' format

  // Query the database for the program with this date
  const programQuery = `SELECT id, program_data, DATE_FORMAT(date, '%Y-%m-%d') AS date, created_by FROM programs WHERE date = ?`;

  // Also fetch speakers for this date
  const speakersQuery = `
    SELECT sd.id, sd.subject, sd.order, wm.first_name, wm.last_name, sd.speaker_id
    FROM speaker_dates sd
    JOIN ward_members wm ON wm.id = sd.speaker_id
    WHERE DATE_FORMAT(sd.date, '%Y-%m-%d') = ?
    ORDER BY sd.order ASC
  `;

  // And fetch prayers for this date
  const prayersQuery = `
    SELECT pd.id, pd.type, wm.first_name, wm.last_name
    FROM prayer_dates pd
    JOIN ward_members wm ON wm.id = pd.speaker_id
    WHERE DATE_FORMAT(pd.date, '%Y-%m-%d') = ?
  `;

  db.query(programQuery, [formattedDate], (err, programRows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Fetch speakers and prayers regardless of whether program exists
    db.query(speakersQuery, [formattedDate], (err, speakerRows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.query(prayersQuery, [formattedDate], (err, prayerRows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // If program exists, parse and enhance it with live speaker/prayer data
        if (programRows && programRows.length > 0) {
          const program = programRows[0];
          let programData = {};

          if (program.program_data) {
            try {
              programData = JSON.parse(program.program_data);
            } catch (parseError) {
              console.error("Error parsing program_data:", parseError);
            }
          }

          // Clear all existing speaker fields to avoid stale data
          for (let i = 1; i <= 20; i++) {
            delete programData[`speaker_${i}`];
          }

          // Add live speakers if they exist
          if (speakerRows && speakerRows.length > 0) {
            speakerRows.forEach((speaker, index) => {
              programData[`speaker_${index + 1}`] = {
                first_name: speaker.first_name,
                last_name: speaker.last_name,
                subject: speaker.subject,
                speaker_id: speaker.speaker_id,
              };
            });
          }

          // Add live prayers if they exist
          if (prayerRows && prayerRows.length > 0) {
            prayerRows.forEach((prayer) => {
              if (prayer.type === "invocation") {
                programData.invocation = {
                  first_name: prayer.first_name,
                  last_name: prayer.last_name,
                };
              } else if (prayer.type === "benediction") {
                programData.benediction = {
                  first_name: prayer.first_name,
                  last_name: prayer.last_name,
                };
              }
            });
          } else {
            // No prayers scheduled - explicitly set to empty objects
            programData.invocation = {};
            programData.benediction = {};
          }

          program.program_data = JSON.stringify(programData);
          res.json(programRows);
        } else {
          // No saved program, but create one from live data
          const programData = {};

          // Add speakers
          if (speakerRows && speakerRows.length > 0) {
            speakerRows.forEach((speaker, index) => {
              programData[`speaker_${index + 1}`] = {
                first_name: speaker.first_name,
                last_name: speaker.last_name,
                subject: speaker.subject,
                speaker_id: speaker.speaker_id,
              };
            });
          }

          // Add prayers
          if (prayerRows && prayerRows.length > 0) {
            prayerRows.forEach((prayer) => {
              if (prayer.type === "invocation") {
                programData.invocation = {
                  first_name: prayer.first_name,
                  last_name: prayer.last_name,
                };
              } else if (prayer.type === "benediction") {
                programData.benediction = {
                  first_name: prayer.first_name,
                  last_name: prayer.last_name,
                };
              }
            });
          } else {
            // No prayers scheduled - explicitly set to empty objects
            programData.invocation = {};
            programData.benediction = {};
          }

          // Return a virtual program with live data
          res.json([
            {
              id: null,
              date: formattedDate,
              program_data: JSON.stringify(programData),
              created_by: null,
            },
          ]);
        }
      });
    });
  });
});

router.post("/speaker", async (req, res) => {
  const { newDates, speakerId, subject } = req.body;

  if (!newDates || !speakerId) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const promises = newDates.map((date) =>
      db
        .promise()
        .query(
          "INSERT INTO speaker_dates (speaker_id, date, subject) VALUES (?, ?, ?)",
          [speakerId, date, subject],
        ),
    );

    // Wait for all insert queries to complete
    await Promise.all(promises);

    res.status(200).json({ message: "Speaker dates saved successfully!" });
  } catch (error) {
    console.error("Error saving speaker dates:", error);
    res.status(500).json({ message: "Failed to save speaker dates" });
  }
});

router.patch("/speaker/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { date, order } = req.body;

  if (!date || !order) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const query = "UPDATE speaker_dates SET date = ?, `order` = ? WHERE id = ?";
    const values = [date, order, id];

    // Use db.promise().query to return a promise
    const [results] = await db.promise().query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Speaker not found" });
    }

    res.status(200).json({ message: "Speaker updated successfully" });
  } catch (error) {
    console.error("Error updating speaker:", error);
    res.status(500).json({ message: "Failed to update speaker" });
  }
});

router.patch("/speaker-update/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { subject } = req.body;

  if (!subject) {
    return res.status(400).json({ message: "Please pass a subject" });
  }

  try {
    const query = "UPDATE speaker_dates SET subject = ? WHERE id = ?";
    const values = [subject, id];

    // Use db.promise().query to return a promise
    const [results] = await db.promise().query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Speaker not found" });
    }

    res.status(200).json({ message: "Speaker subject updated successfully" });
  } catch (error) {
    console.error("Error updating speaker subject:", error);
    res.status(500).json({ message: "Failed to update speaker subject" });
  }
});

router.delete("/delete-speaker/:id", async (req, res) => {
  const speakerDateId = req.params.id;

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM speaker_dates WHERE id = ?", [speakerDateId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Date not found" });
    }

    res.status(200).json({ message: "Speaker date deleted successfully" });
  } catch (error) {
    console.error("Error deleting speaker date:", error);
    res.status(500).json({ message: "Failed to delete speaker date" });
  }
});

router.post("/add-member", async (req, res) => {
  const { first_name, last_name, sex, isYouth, can_ask, calling } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    await db
      .promise()
      .query(
        "INSERT INTO ward_members (first_name, last_name, sex, active, isYouth, can_ask, calling) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [first_name, last_name, sex, 1, isYouth, can_ask, calling || null],
      );

    res.status(200).json({ message: "Ward member saved successfully!" });
  } catch (error) {
    console.error("Error saving ward member:", error);
    res.status(500).json({ message: "Failed to save ward member" });
  }
});

router.patch("/update-member/:id", async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing member ID" });
  }

  // Create a dynamic query based on the fields to update
  const fields = Object.keys(updateFields).map((field) => `${field} = ?`);
  const values = Object.values(updateFields);

  const query = `
    UPDATE ward_members
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  try {
    // Use prepared statements to avoid SQL injection
    await db.promise().query(query, [...values, id]);

    res.status(200).json({ message: "Member updated successfully!" });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ message: "Failed to update member" });
  }
});

router.delete("/delete-member/:id", async (req, res) => {
  const memberId = req.params.id;

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM ward_members WHERE id = ?", [memberId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ message: "Failed to delete member" });
  }
});

//Prayers
router.post("/prayer", async (req, res) => {
  const { newDates, speakerId, type = null } = req.body;

  if (!newDates || !speakerId) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const promises = newDates.map((date) => {
      return db
        .promise()
        .query(
          "INSERT INTO prayer_dates (speaker_id, date, type) VALUES (?, ?, ?)",
          [speakerId, date, type],
        );
    });

    const results = await Promise.all(promises);

    const id = results[0][0].insertId;

    res.status(200).json({
      id,
    });
  } catch (error) {
    console.error("Error saving prayer dates:", error);
    res.status(500).json({ message: "Failed to save prayer dates" });
  }
});

router.put("/prayer/:id", async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;

  try {
    await db
      .promise()
      .query("UPDATE prayer_dates SET date = ? WHERE id = ?", [date, id]);

    res.status(200).json({ message: "Prayer date updated successfully!" });
  } catch (error) {
    console.error("Error updating prayer date:", error);
    res.status(500).json({ message: "Failed to update prayer date" });
  }
});

router.delete("/prayer", async (req, res) => {
  const { speakerId, date } = req.query; // Extract speakerId and date from query parameters

  try {
    await db
      .promise()
      .query("DELETE FROM prayer_dates WHERE speaker_id = ? AND date = ?", [
        speakerId,
        date,
      ]);
    res.status(200).json({ message: "Prayer date deleted successfully!" });
  } catch (error) {
    console.error("Error deleting prayer date:", error);
    res.status(500).json({ message: "Failed to delete prayer date" });
  }
});

router.delete("/delete-prayer", async (req, res) => {
  const { id } = req.query; // Extract speakerId and date from query parameters

  try {
    await db.promise().query("DELETE FROM prayer_dates WHERE id = ?", [id]);
    res.status(200).json({ message: "Prayer date deleted successfully!" });
  } catch (error) {
    console.error("Error deleting prayer date:", error);
    res.status(500).json({ message: "Failed to delete prayer date" });
  }
});

router.get("/prayer-suggestions", (req, res) => {
  db.query(
    `SELECT 
    wm.id AS speaker_id, 
    wm.first_name, 
    wm.last_name, 
    IFNULL(
        MAX(CASE WHEN pd.date >= CURDATE() - INTERVAL 1 YEAR THEN pd.date END),
        'Over 1 year ago'
    ) AS last_prayed
FROM 
    ward_members wm 
LEFT JOIN 
    prayer_dates pd ON wm.id = pd.speaker_id
WHERE 
    wm.can_ask = 1 
    AND wm.active = 1
GROUP BY 
    wm.id, wm.first_name, wm.last_name
HAVING 
    last_prayed = 'Over 1 year ago'  -- Ensures we only get members who haven't prayed in the last year
ORDER BY 
    RAND() 
LIMIT 10;
`,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

router.get("/prayer-history", (req, res) => {
  db.query(
    `SELECT pd.id, DATE_FORMAT(pd.date, '%Y-%m-%d') AS date, pd.type, wm.first_name, wm.last_name 
FROM prayer_dates pd 
JOIN ward_members wm on wm.id = pd.speaker_id
ORDER BY pd.date desc;`,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});
//Speakers
router.get("/speaker-history", (req, res) => {
  db.query(
    `SELECT sd.id, DATE_FORMAT(sd.date, '%Y-%m-%d') AS date, sd.subject, wm.first_name, wm.last_name, sd.order, sd.speaker_id 
      FROM speaker_dates sd 
      JOIN ward_members wm on wm.id = sd.speaker_id
      ORDER BY sd.date desc;`,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

router.get("/speaker-suggestions", (req, res) => {
  db.query(
    `SELECT 
    sd.speaker_id, 
    wm.first_name, 
    wm.last_name, 
    MAX(sd.date) AS newest_date 
FROM 
    speaker_dates sd 
JOIN 
    ward_members wm ON sd.speaker_id = wm.id 
WHERE 
    wm.can_ask = 1 AND wm.active = 1 
GROUP BY 
    sd.speaker_id, 
    wm.first_name, 
    wm.last_name 
HAVING 
    newest_date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH) 
ORDER BY 
    newest_date ASC 
LIMIT 10;`,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

router.get("/youth-speaker-suggestions", (req, res) => {
  db.query(
    `SELECT 
    sd.speaker_id, 
    wm.first_name, 
    wm.last_name, 
    MAX(sd.date) AS newest_date 
FROM 
    speaker_dates sd 
JOIN 
    ward_members wm ON sd.speaker_id = wm.id 
WHERE 
    wm.can_ask = 1 AND wm.active = 1 AND wm.isYouth is true
GROUP BY 
    sd.speaker_id, 
    wm.first_name, 
    wm.last_name 
HAVING 
    newest_date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH) 
ORDER BY 
    newest_date ASC 
LIMIT 10;`,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

//Music
router.get("/music-admin", (req, res) => {
  db.query(
    `SELECT id, chorister_id, organist_id, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM music_admin_dates ORDER BY date DESC;`,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

router.post("/music", async (req, res) => {
  const {
    date,
    hymn_number = null,
    song_title = null,
    performer,
    type,
  } = req.body;

  if (!date || !type) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    // Run the query and wait for the result
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO music_dates (date, hymn_number, song_title, performer, type) VALUES (?, ?, ?, ?, ?)",
        [date, hymn_number, song_title, performer, type],
      );

    // Get the inserted record ID
    const id = results.insertId;

    res.status(200).json({
      message: "Music saved successfully!",
      id,
    });
  } catch (error) {
    console.error("Error saving music:", error);
    res.status(500).json({ message: "Failed to save music" });
  }
});

router.post("/music-admin", async (req, res) => {
  const { date, chorister_id, organist_id } = req.body;

  if (!date) {
    return res
      .status(400)
      .json({ message: "Please provide a date for the music admin info" });
  }

  try {
    // Build fields and values dynamically
    const fields = ["date"];
    const placeholders = ["?"];
    const values = [date];

    if (chorister_id !== undefined) {
      fields.push("chorister_id");
      placeholders.push("?");
      values.push(chorister_id);
    }

    if (organist_id !== undefined) {
      fields.push("organist_id");
      placeholders.push("?");
      values.push(organist_id);
    }

    const query = `INSERT INTO music_admin_dates (${fields.join(
      ", ",
    )}) VALUES (${placeholders.join(", ")}) ON DUPLICATE KEY UPDATE ${fields
      .slice(1)
      .map((field) => `${field} = VALUES(${field})`)
      .join(", ")}`;

    // Run the query
    const [results] = await db.promise().query(query, values);

    // Get the inserted record ID
    const id = results.insertId;

    res.status(200).json({
      message: "Chorister and/or organist saved successfully!",
      id,
    });
  } catch (error) {
    console.error("Error saving music admin data:", error);
    res.status(500).json({ message: "Failed to save music admin data" });
  }
});

router.get("/music-history", (req, res) => {
  db.query(
    `SELECT md.id, md.hymn_number, h.name, md.performer, md.song_title, DATE_FORMAT(md.date, '%Y-%m-%d') AS date, md.type, md.chorister, md.organist
FROM music_dates md 
LEFT JOIN hymns h ON h.number = md.hymn_number
ORDER BY md.date DESC;`,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

router.patch("/music/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { date } = req.body;

  if (!date || !id) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const query = "UPDATE music_dates SET date = ? WHERE id = ?";
    const values = [date, id];

    // Use db.promise().query to return a promise
    const [results] = await db.promise().query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "music not found" });
    }

    res.status(200).json({ message: "music updated successfully" });
  } catch (error) {
    console.error("Error updating music:", error);
    res.status(500).json({ message: "Failed to update music" });
  }
});

router.patch("/music-admin/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { chorister_id, organist_id } = req.body;

  if (!id || (!chorister_id && !organist_id)) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    // Dynamically build the query and values
    const fields = [];
    const values = [];

    if (chorister_id !== undefined) {
      fields.push("chorister_id = ?");
      values.push(chorister_id);
    }

    if (organist_id !== undefined) {
      fields.push("organist_id = ?");
      values.push(organist_id);
    }

    values.push(id); // Add the id at the end for the WHERE clause

    const query = `UPDATE music_admin_dates SET ${fields.join(
      ", ",
    )} WHERE id = ?`;

    // Use db.promise().query to return a promise
    const [results] = await db.promise().query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Music not found" });
    }

    res.status(200).json({ message: "Music updated successfully" });
  } catch (error) {
    console.error("Error updating music:", error);
    res.status(500).json({ message: "Failed to update music" });
  }
});

router.delete("/music", async (req, res) => {
  const { musicId } = req.query; // Extract speakerId and date from query parameters

  try {
    await db.promise().query("DELETE FROM music_dates WHERE id = ?", [musicId]);
    res.status(200).json({ message: "Music date deleted successfully!" });
  } catch (error) {
    console.error("Error deleting music date:", error);
    res.status(500).json({ message: "Failed to delete music date" });
  }
});

//Sundays
router.post("/sunday", async (req, res) => {
  const { date, type, description = null } = req.body;

  if (!date || !type) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO sunday_dates (date, type, description) VALUES (?, ?, ?)",
        [date, type, description],
      );

    const id = result.insertId;

    res.status(200).json({ id });
  } catch (error) {
    console.error("Error saving sunday date:", error);
    res.status(500).json({ message: "Failed to save sunday date" });
  }
});

router.get("/sunday-history", (req, res) => {
  console.log("FETCHING SUNDAY HISTORY");
  db.query(
    `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, type, description FROM sunday_dates;`,
    [],
    (err, rows) => {
      if (err) {
        res.status(400).send(err.message);
        return;
      }
      res.json(rows);
    },
  );
});

// Get settings
router.get("/settings", (req, res) => {
  db.query("SELECT setting_key, setting_value FROM settings", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Convert rows to key-value object
    const settings = {};
    rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  });
});

// Save or update a setting
router.post("/settings", (req, res) => {
  const { setting_key, setting_value } = req.body;

  if (!setting_key) {
    return res.status(400).json({ error: "setting_key is required" });
  }

  const query = `
    INSERT INTO settings (setting_key, setting_value) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP
  `;

  db.query(query, [setting_key, setting_value, setting_value], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Setting saved successfully" });
  });
});

export default router;
