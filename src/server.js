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
      SELECT 
        id, 
        DATE_FORMAT(selected_date, '%Y-%m-%d') as selected_date, 
        auditStatus, 
        main_glue_pdf_name, 
        promoter_pdf_name,
        main_glue_status,
        promoter_status
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


// Endpoint to fetch data from the pdfs table for ***next four days***
app.get('/getpdfs24hrs', async (req, res) => {
  try {
    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // Get today's date in YYYY-MM-DD format
    const now = new Date();
    const today = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];

    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(today.getDate() + 3); // Add 4 because we are including today
    const fiveDaysLaterStr = fiveDaysLater.toISOString().split('T')[0];

    // SQL query to select data from the pdfs table for today and tomorrow
    const sql = `
      SELECT 
        id, 
        DATE_FORMAT(selected_date, '%Y-%m-%d') as selected_date, 
        auditStatus, 
        main_glue_pdf_name, 
        promoter_pdf_name,
        main_glue_status,
        promoter_status
      FROM pdfs 
      WHERE selected_date BETWEEN ? AND ?
      ORDER BY selected_date
    `;

    // Execute the query with today's and tomorrow's date
    const [rows] = await connection.execute(sql, [todayStr, fiveDaysLaterStr]);

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
      'SELECT id, DATE_FORMAT(selected_date, "%Y-%m-%d") AS selected_date, main_glue_pdf, promoter_pdf, main_glue_pdf_name, promoter_pdf_name, auditStatus, main_glue_status, promoter_status FROM pdfs WHERE id = ?',
      [pdfId]
    );

    if (rows.length > 0) {
      const pdfData = rows[0];
      res.json({
        id: pdfData.id,
        selectedDate: pdfData.selected_date,
        mainGluePdf: pdfData.main_glue_pdf.toString('base64'),
        promoterPdf: pdfData.promoter_pdf.toString('base64'),
        mainGluePdfName: pdfData.main_glue_pdf_name,
        promoterPdfName: pdfData.promoter_pdf_name,
        auditStatus: pdfData.auditStatus,
        mainGlueStatus: pdfData.main_glue_status,
        promoterStatus: pdfData.promoter_status
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

//update audit status (by toggle btn)
app.put('/updatepdf/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { auditStatus } = req.body;

    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // SQL query to update auditStatus
    const sql = 'UPDATE pdfs SET auditStatus = ? WHERE id = ?';
    const values = [auditStatus, id];

    // Execute the query
    const [result] = await connection.execute(sql, values);

    // Close the connection
    await connection.end();

    if (result.affectedRows === 0) {
      res.status(404).send('Record not found');
    } else {
      res.send('Record updated successfully');
    }
  } catch (error) {
    console.error('Error updating record:', error.message);
    res.status(500).send('Error updating record: ' + error.message);
  }
});

// Update PDF status
app.put('/updateStatus', async (req, res) => {
  const { id, type, status } = req.body; // Assuming you send the ID, the type of PDF (mainGlue or promoter), and the new status

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Determine the column name based on the type of PDF
    const columnName = type === 'main' ? 'main_glue_status' : 'promoter_status';

    // SQL query to update the status of the specified PDF
    const sql = `UPDATE pdfs SET ${columnName} = ? WHERE id = ?`;
    const values = [status, id];

    // Execute the query
    const [result] = await connection.execute(sql, values);

    // Close the connection
    await connection.end();

    if (result.affectedRows > 0) {
      res.send('Status updated successfully');
    } else {
      res.status(404).send('PDF not found');
    }
  } catch (error) {
    console.error('Error updating status:', error.message);
    res.status(500).send('Error updating status');
  }
});

//-------------------material assign--------------------------------------------------------------------------
app.get('/get-materials', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = `
      SELECT material_assign_id, 
             DATE_FORMAT(CONVERT_TZ(production_date, '+00:00', '+08:00'), '%Y-%m-%d') as production_date, 
             material_id, 
             total_demand, 
             production_sequence, 
             production_machine 
      FROM material_assignments 
      ORDER BY production_date DESC, production_sequence ASC`;
    const [materials] = await connection.execute(sql);
    await connection.end();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error.message);
    res.status(500).send('Error fetching materials');
  }
});


app.post('/assign-material', async (req, res) => {
  try {
    // Extracting form data
    console.log('Assigning material endpoint hit');
    const { production_date, material_id, total_demand, production_sequence, production_machine, batch_number } = req.body;

    // Validate the inputs
    if (!production_date || !material_id || !total_demand || !production_sequence || !production_machine) {
      return res.status(400).send('All fields are required');
    }

    // Adjust the production_date to UTC time
    const localDate = new Date(production_date);
    localDate.setHours(localDate.getHours() + 8); // Taiwan is UTC+8
    const utcDate = localDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD

    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // SQL query to insert data into the material_assignments table
    const sql = `
      INSERT INTO material_assignments 
      (production_date, material_id, total_demand, production_sequence, production_machine, batch_number) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [utcDate, material_id, total_demand, production_sequence, production_machine, batch_number];

    // Execute the query
    const [result] = await connection.execute(sql, values);

    // Get the auto-generated ID
    const materialAssignId = result.insertId;

    // Close the connection
    await connection.end();

    // Send back the material_assign_id
    res.json({ materialAssignId });
  } catch (error) {
    console.error('Error saving material assignment:', error.message);
    res.status(500).send('Error saving material assignment: ' + error.message);
  }
});


app.delete('/delete-material/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // Begin a new transaction
    await connection.beginTransaction();

    // SQL query to delete from material_assignments
    let sql = 'DELETE FROM material_assignments WHERE material_assign_id = ?';
    let values = [id];

    // Execute the query to delete from material_assignments
    let [result] = await connection.execute(sql, values);

    // If nothing was deleted, rollback and return 404
    if (result.affectedRows === 0) {
      await connection.rollback();
      res.status(404).send('Material not found');
      return;
    }

    // SQL query to delete from daily_material_formula
    sql = 'DELETE FROM daily_material_formula WHERE material_assign_id = ?';

    // Execute the query to delete from daily_material_formula
    await connection.execute(sql, values);

    // Commit the transaction
    await connection.commit();

    // Close the connection
    await connection.end();

    res.send('Material and associated formulas deleted successfully');
  } catch (error) {
    console.error('Error deleting material:', error.message);
    await connection.rollback(); // Rollback the transaction on error
    await connection.end(); // Close the connection whether there was an error or not
    res.status(500).send('Error deleting material');
  }
});


//calculate the amount needed for each material
const getFormulaData = async (material_id) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = `SELECT * FROM join_formula WHERE material_id = ?`;
    const [formulaData] = await connection.execute(sql, [material_id]);
    await connection.end();
    return formulaData;
  } catch (error) {
    console.error('Error fetching formula data:', error.message);
    throw new Error('Error fetching formula data');
  }
};

const calculateFormula = (formulaData, totalDemand) => {
  const totalUsageKg = formulaData.reduce((acc, item) => acc + parseFloat(item.usage_kg), 0);
  console.log(`Total Usage Kg: ${totalUsageKg}, Total Demand: ${totalDemand}`);
  
  if (totalUsageKg === 0) {
    throw new Error('Total usage kg is 0, cannot calculate formula.');
  }

  const ratio = totalDemand / totalUsageKg;

  return formulaData.map(item => ({
    chemical_raw_material_id: item.chemical_raw_material_id,
    chemical_raw_material_name: item.chemical_raw_material_name,
    usage_kg: item.usage_kg * ratio
  }));
};


const storeFormulaResults = async (materialAssignId, assignmentData, results) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const { material_id, total_demand, production_sequence, production_machine, batch_number } = assignmentData;

    for (const result of results) {
      const sql = `
        INSERT INTO daily_material_formula 
        (material_assign_id, material_id, total_demand, production_sequence, production_machine, chemical_raw_material_id, chemical_raw_material_name, usage_kg, batch_number) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [materialAssignId, material_id, total_demand, production_sequence, production_machine, result.chemical_raw_material_id, result.chemical_raw_material_name, result.usage_kg, batch_number];
      await connection.execute(sql, values);
    }
    await connection.end();
  } catch (error) {
    console.error('Error storing formula results:', error.message);
    throw new Error('Error storing formula results');
  }
};

app.post('/calculate-and-store-formula', async (req, res) => {
  console.log('Calculating formula endpoint hit');
  const { materialAssignId, material_id, total_demand, production_sequence, production_machine, batch_number } = req.body;

  try {
    // Fetch formula data
    const formulaData = await getFormulaData(material_id);
    if (!formulaData) {
      return res.status(404).send('Formula data not found for the given material ID');
    }

    // Perform calculations
    const calculatedResults = calculateFormula(formulaData, total_demand);

    // Store results in the daily_material_formula table
    await storeFormulaResults(materialAssignId, req.body, calculatedResults);

    res.send('Formula calculations stored successfully');
  } catch (error) {
    console.error('Error in processing formula:', error.message);
    res.status(500).send('Error in processing formula');
  }
});

//---------------------------------------------------------------------------------------------------------

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

