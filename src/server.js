const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const port = 5000;

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dachou_material'
};

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit of 10MB for file size
});

app.use(cors());
app.use(express.json());

// Login endpoint
app.post('/login', async (req, res) => {
  // Assuming the frontend sends the 'email' field as the username
  const { email: username, password } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    // Make sure to use backticks ` for table and column names
    const [users] = await connection.execute('SELECT * FROM `user` WHERE `username` = ?', [username]);

    if (users.length === 0) {
      res.status(401).send('Username does not exist');
      return;
    }

    const user = users[0];
    // TODO: Compare hashed passwords in production
    if (password === user.password) {
      // Passwords match
      console.log('Login successful'); 
      res.json({ message: 'Login successful', token: 'yourGeneratedToken', role: user.role });
    } else {
      res.status(401).send('Password is incorrect');
    }

    await connection.end();
  } catch (error) {
    console.error('Database or server error:', error.message);
    res.status(500).send('Internal server error');
  }
});


// Endpoint to handle the file upload
app.post('/upload', upload.fields([{ name: 'mainGluePdf' }, { name: 'promoterPdf' }]), async (req, res) => {
  try {
    if (!req.files.mainGluePdf || !req.files.promoterPdf) {
      throw new Error('One or more files are missing');
    }

    const selectedDate = req.body.date;
    const mainGluePdfFile = req.files.mainGluePdf[0];
    const promoterPdfFile = req.files.promoterPdf[0];
    const mainGluePdfName = req.body.mainGluePdfName;
    const promoterPdfName = req.body.promoterPdfName;

    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // SQL query to insert data into the pdfs table including file names
    const sql = `
      INSERT INTO pdfs (selected_date, main_glue_pdf, promoter_pdf, main_glue_pdf_name, promoter_pdf_name) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      new Date(selectedDate), 
      mainGluePdfFile.buffer, 
      promoterPdfFile.buffer, 
      mainGluePdfName, 
      promoterPdfName
    ];

    // Execute the query
    const [result] = await connection.execute(sql, values);

    // Close the connection
    await connection.end();

    res.send('Files and date stored successfully');
  } catch (error) {
    console.error('Error uploading files:', error.message);
    res.status(500).send('Error uploading files: ' + error.message);
  }
});

// Endpoint to fetch data from the pdfs table
app.get('/getpdfs', async (req, res) => {
  try {
    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // SQL query to select data from the pdfs table
    const sql = `
      SELECT id, DATE_FORMAT(selected_date, '%Y-%m-%d') as selected_date, auditStatus, main_glue_pdf_name, promoter_pdf_name 
      FROM pdfs 
      ORDER BY selected_date DESC
    `;

    // Execute the query
    const [rows] = await connection.execute(sql);

    // Close the connection
    await connection.end();

    // Send the data back to the client
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Error fetching data: ' + error.message);
  }
});

// Endpoint to fetch data from the pdfs table for the last 24 hours
app.get('/getpdfs24hrs', async (req, res) => {
  try {
    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // SQL query to select data from the pdfs table for the last 24 hours
    const sql = `
      SELECT id, DATE_FORMAT(selected_date, '%Y-%m-%d') as selected_date, auditStatus, main_glue_pdf_name, promoter_pdf_name 
      FROM pdfs 
      WHERE selected_date = ?
      ORDER BY selected_date DESC
    `;

    // Execute the query with today's date
    const [rows] = await connection.execute(sql, [today]);

    // Close the connection
    await connection.end();

    // Send the data back to the client
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Error fetching data: ' + error.message);
  }
});

//get pdfs by ID
app.get('/getpdf/:pdfId', async (req, res) => {
  const pdfId = req.params.pdfId;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, DATE_FORMAT(selected_date, "%Y-%m-%d") AS selected_date, main_glue_pdf, promoter_pdf, main_glue_pdf_name, promoter_pdf_name, auditStatus FROM pdfs WHERE id = ?',
      [pdfId]
    );

    if (rows.length > 0) {
      const pdfData = rows[0];
      res.json({
        id: pdfData.id,
        selectedDate: pdfData.selected_date, // This will now be formatted as 'YYYY-MM-DD'
        mainGluePdf: pdfData.main_glue_pdf.toString('base64'),
        promoterPdf: pdfData.promoter_pdf.toString('base64'),
        mainGluePdfName: pdfData.main_glue_pdf_name,
        promoterPdfName: pdfData.promoter_pdf_name,
        auditStatus: pdfData.auditStatus
      });
    } else {
      res.status(404).send('PDF not found');
    }

    await connection.end();
  } catch (error) {
    console.error('Error fetching PDF:', error.message);
    res.status(500).send('Error fetching PDF');
  }
});



app.delete('/deletepdf/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // SQL query to delete a record from the pdfs table
    const sql = 'DELETE FROM pdfs WHERE id = ?';
    const values = [id];

    // Execute the query
    const [result] = await connection.execute(sql, values);

    // Close the connection
    await connection.end();

    if (result.affectedRows === 0) {
      // If no rows were affected, the record was not found
      res.status(404).send('Record not found');
    } else {
      res.send('Record deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting record:', error.message);
    res.status(500).send('Error deleting record: ' + error.message);
  }
});


const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

