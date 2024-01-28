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
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 } // Limit of 10MB for file size
// });

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
    const { production_date, material_id, total_demand, production_sequence, production_machine, batch_number } = req.body;

    // Validate the inputs
    if (!production_date || !material_id || !total_demand || !production_sequence || !production_machine) {
      return res.status(400).send('All fields are required');
    }

    // Adjust the production_date to UTC time
    const localDate = new Date(production_date);
    localDate.setHours(localDate.getHours() + 8); // Taiwan is UTC+8
    const utcDate = localDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD

    console.log(utcDate);
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

    // SQL query to delete from material_assignments
    const sql = 'DELETE FROM material_assignments WHERE material_assign_id = ?';
    const values = [id];

    // Execute the query to delete from material_assignments
    const [result] = await connection.execute(sql, values);

    // If nothing was deleted, return 404
    if (result.affectedRows === 0) {
      res.status(404).send('Material not found');
      return;
    }

    // Close the connection
    await connection.end();

    res.send('Material deleted successfully');
  } catch (error) {
    console.error('Error deleting material:', error.message);
    res.status(500).send('Error deleting material');
  }
});

//get id material for update have a look
// In your server code
app.get('/get-material/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM material_assignments WHERE material_assign_id = ?', [id]);
    await connection.end();

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Material not found');
    }
  } catch (error) {
    console.error('Error fetching material:', error.message);
    res.status(500).send('Error fetching material');
  }
});

app.put('/update-material/:id', async (req, res) => {
  const { id } = req.params;
  const { material_id, total_demand, production_sequence, production_machine, batch_number } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Assuming production_date is not being updated, we exclude it from the update statement
    const sql = `
      UPDATE material_assignments
      SET material_id = ?, total_demand = ?, production_sequence = ?, production_machine = ?, batch_number = ?
      WHERE material_assign_id = ?
    `;
    const values = [material_id, total_demand, production_sequence, production_machine, batch_number, id];
    await connection.execute(sql, values);
    await connection.end();

    res.send('Material updated successfully');
    console.log('Material updated successfully');
  } catch (error) {
    console.error('Error updating material:', error.message);
    res.status(500).send('Error updating material');
  }
});


//---------------------Daily Status------------------------------------------------------------------------------------
app.get('/get-daily-material-status', async (req, res) => {
  try {
    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // SQL query to select data from the daily_status table
    const sql = `
      SELECT 
        daily_status_id, 
        DATE_FORMAT(selected_date, '%Y-%m-%d') as selected_date, 
        main_glue_status, 
        promoter_status,
        auditStatus
      FROM daily_status 
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

//fetch daily material status for employee (4 days)
app.get('/get-daily-material-status-employee', async (req, res) => {
  try {
    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // Get today's date and calculate the date for the next three days
    const now = new Date();
    const today = new Date(now.getTime() + 8 * 60 * 60 * 1000); // Adjusted for time zone
    const todayStr = today.toISOString().split('T')[0];

    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3); // Three days after today
    const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];

    // SQL query to select data from the daily_status table for the next four days
    const sql = `
      SELECT 
        daily_status_id, 
        DATE_FORMAT(selected_date, '%Y-%m-%d') as selected_date, 
        main_glue_status, 
        promoter_status,
        auditStatus
      FROM daily_status 
      WHERE selected_date BETWEEN ? AND ?
      ORDER BY selected_date
    `;

    // Execute the query with the date range
    const [rows] = await connection.execute(sql, [todayStr, threeDaysLaterStr]);

    // Close the connection
    await connection.end();

    // Send the data back to the client
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Error fetching data: ' + error.message);
  }
});


// Update audit status (by toggle button)
app.put('/updateAuditStatus/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { auditStatus } = req.body;

    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // SQL query to update auditStatus in the daily_status table
    const sql = 'UPDATE daily_status SET auditStatus = ? WHERE selected_date = ?';
    const values = [auditStatus, date];

    // Execute the query
    const [result] = await connection.execute(sql, values);

    // Close the connection
    await connection.end();

    if (result.affectedRows === 0) {
      res.status(404).send('Record not found');
    } else {
      res.send('Audit status updated successfully');
    }
  } catch (error) {
    console.error('Error updating audit status:', error.message);
    res.status(500).send('Error updating audit status: ' + error.message);
  }
});

//--------- get daily material detail----------------
// Endpoint to get material details by date
app.get('/get-material-detail/:date', async (req, res) => {
  const selectedDate = req.params.date;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Convert selectedDate from yyyy-mm-dd to ddmmyy format to match batch_number
    const dateParts = selectedDate.split('-');
    const formattedDate = `${dateParts[0].substring(2)}${dateParts[1]}${dateParts[2]}`; // Gives you "240104" for "2024-01-04"

    // SQL query to select data where the date part of batch_number matches formattedDate
    const sql = `
      SELECT *
      FROM daily_material_formula
      WHERE batch_number LIKE CONCAT(?, '%')
      ORDER BY batch_number ASC
    `;

    // Execute the query
    const [rows] = await connection.execute(sql, [formattedDate]);

    // Close the connection
    await connection.end();

    // Send the data back to the client
    res.json(rows);
  } catch (error) {
    console.error('Error fetching material details:', error.message);
    res.status(500).send('Error fetching material details');
  }
});

// fetch collector name
app.get('/get-collector-names/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = 'SELECT main_glue_collector, promoter_collector FROM daily_status WHERE selected_date = ?';
    const [rows] = await connection.execute(sql, [date]);
    await connection.end();

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('No collector names found for the selected date');
    }
  } catch (error) {
    console.error('Error getting collector names:', error);
    res.status(500).send('Error getting collector names');
  }
});

//update collector name
app.put('/update-collector/:type/:date', async (req, res) => {
  const { type, date } = req.params;
  const { collector } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    let sql;
    
    // Check the type and set the appropriate SQL query
    if (type === 'main-glue') {
      sql = 'UPDATE daily_status SET main_glue_collector = ? WHERE selected_date = ?';
    } else if (type === 'promoter') {
      sql = 'UPDATE daily_status SET promoter_collector = ? WHERE selected_date = ?';
    } else {
      return res.status(400).send('Invalid collector type');
    }

    const values = [collector, date];
    const [result] = await connection.execute(sql, values);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).send('Record not found');
    }

    res.send(`${type} collector name updated successfully`);
  } catch (error) {
    console.error(`Error updating ${type} collector name:`, error);
    res.status(500).send(`Error updating ${type} collector name`);
  }
});



// Backend: Update collecting status
app.put('/update-collecting-status/:id', async (req, res) => {
  const { id } = req.params;
  const { collecting_finished } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = 'UPDATE daily_material_formula SET collecting_finished = ? WHERE daily_material_formula_id = ?';
    const values = [collecting_finished, id];

    const [result] = await connection.execute(sql, values);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).send('Record not found');
    }

    res.send('Collecting status updated successfully');
  } catch (error) {
    console.error('Error updating collecting status:', error);
    res.status(500).send('Error updating collecting status');
  }
});

// Backend: Update notes
app.put('/update-notes/:id', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = 'UPDATE daily_material_formula SET notes = ? WHERE daily_material_formula_id = ?';
    const values = [notes, id];

    const [result] = await connection.execute(sql, values);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).send('Record not found');
    }

    res.send('Notes updated successfully');
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).send('Error updating notes');
  }
});

//-------------膠料基本黨-----------------------------------------------
// get rubber rile ms.stickness_value,
app.get('/get-material-info/:materialID', async (req, res) => {
  const { materialID } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = `
      SELECT 
        rf.material_id, 
        mp.property_name, 
        rf.hardness, 
        mc.color_name, 
        mu.usage_type, 
        rf.customer_usage, 
        rf.main_ingredient
      FROM rubber_file rf
      LEFT JOIN material_properties mp ON rf.property_id = mp.property_id
      LEFT JOIN material_stickness ms ON rf.stickness = ms.stickness_id
      LEFT JOIN material_usage mu ON rf.usage_id = mu.usage_id
      LEFT JOIN material_colors mc ON rf.color_id = mc.color_id
      WHERE rf.material_id = ?
    `;
    
    const [rows] = await connection.execute(sql, [materialID]);
    await connection.end();

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Material not found');
    }
  } catch (error) {
    console.error('Error fetching material info:', error.message);
    res.status(500).send('Error fetching material info');
  }
});

// New backend route to get MATERIAL DATA TABLE
app.get('/get-material-table-data/:materialID', async (req, res) => {
  const { materialID } = req.params;
   
  try {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
      SELECT 
        DATE_FORMAT(CONVERT_TZ(creation_date, '+00:00', '+08:00'), '%Y-%m-%d') as creation_date,
        material_id, 
        chemical_raw_material_id,
        usage_kg,
        material_function,
        sequence,
        unit_price
      FROM join_formula
      WHERE material_id = ?
    `;

    const [rows] = await connection.execute(sql, [materialID]);
    await connection.end();

    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.status(404).send('No data found for the given material ID');
    }
  } catch (error) {
    console.error('Error fetching specific material info:', error.message);
    res.status(500).send('Error fetching specific material info');
  }
});
//-----------------inventory search-----------------------------------------------
app.get('/search-materials-by-id', async (req, res) => {
  try {
    const { chemicalId } = req.query;

    const connection = await mysql.createConnection(dbConfig);

    let sql1 = `
      SELECT 
        cs.chemical_raw_material_id, 
        rmf.chemical_raw_material_name, 
        cs.chemical_raw_material_current_stock,
        rmf.material_function,
        rmf.unit_price,
        cs.safty_stock_value
      FROM 
        chemical_stocks cs
      INNER JOIN 
        rubber_raw_material_file rmf ON cs.chemical_raw_material_id = rmf.chemical_raw_material_id
    `;
    
    if (chemicalId) {
      sql1 += ' WHERE cs.chemical_raw_material_id = ?';
    }

    const [results1] = await connection.execute(sql1, chemicalId ? [chemicalId] : []);

    let results2 = [];
    if (chemicalId) {
      const sql2 = `SELECT 
      chemical_raw_material_batch_no,
      DATE_FORMAT(CONVERT_TZ(input_date, '+00:00', '+08:00'), '%Y-%m-%d') as formatted_input_date,
      chemical_raw_material_id,
      supplier_material_batch_no,
      chemical_raw_material_input_kg,
      chemical_raw_material_position,
      chemical_raw_material_supplier,
      test_employee,
      input_test_hardness,
      quality_check,
      batch_kg
    FROM 
      chemical_individual_input 
    WHERE 
      chemical_raw_material_id = ?
    `;
      [results2] = await connection.execute(sql2, [chemicalId]);
    }

    await connection.end();

    res.json({ 
      chemicalStocksAndInfo: results1,
      chemicalIndividualInput: results2
    });

  } catch (error) {
    console.error('Error searching materials:', error.message);
    res.status(500).send('Error searching materials');
  }
});

//get by name 
app.get('/search-materials-by-name', async (req, res) => {
  try {
    const { chemicalName } = req.query;
    const connection = await mysql.createConnection(dbConfig);

    let sql1 = `
      SELECT 
        cs.chemical_raw_material_id, 
        rmf.chemical_raw_material_name, 
        cs.chemical_raw_material_current_stock,
        rmf.material_function,
        rmf.unit_price,
        cs.safty_stock_value
      FROM 
        chemical_stocks cs
      INNER JOIN 
        rubber_raw_material_file rmf ON cs.chemical_raw_material_id = rmf.chemical_raw_material_id
    `;

    if (chemicalName) {
      sql1 += ' WHERE rmf.chemical_raw_material_name LIKE ?';
    }

    const [results1] = await connection.execute(sql1, chemicalName ? [`%${chemicalName}%`] : []);

    let results2 = [];
    if (chemicalName) {
      const sql2 = `SELECT 
        chemical_raw_material_batch_no,
        DATE_FORMAT(CONVERT_TZ(input_date, '+00:00', '+08:00'), '%Y-%m-%d') as formatted_input_date,
        chemical_raw_material_id,
        supplier_material_batch_no,
        chemical_raw_material_input_kg,
        chemical_raw_material_position,
        chemical_raw_material_supplier,
        test_employee,
        input_test_hardness,
        quality_check,
        batch_kg
      FROM 
        chemical_individual_input 
      WHERE 
        chemical_raw_material_id IN (SELECT chemical_raw_material_id FROM rubber_raw_material_file WHERE chemical_raw_material_name LIKE ?)
      `;
      [results2] = await connection.execute(sql2, [`%${chemicalName}%`]);
    }

    await connection.end();

    res.json({ 
      chemicalStocksAndInfo: results1,
      chemicalIndividualInput: results2
    });

  } catch (error) {
    console.error('Error searching materials by name:', error.message);
    res.status(500).send('Error searching materials by name');
  }
});

//GET BY Chemical batch number 
app.get('/search-materials-by-batch', async (req, res) => {
  try {
    const { batchNumber } = req.query;
    const connection = await mysql.createConnection(dbConfig);

    // Query for individual batch information
    const sql1 = `
      SELECT 
        cii.chemical_raw_material_batch_no,
        DATE_FORMAT(CONVERT_TZ(cii.input_date, '+00:00', '+08:00'), '%Y-%m-%d') as formatted_input_date,
        cii.chemical_raw_material_id,
        cii.supplier_material_batch_no,
        cii.chemical_raw_material_input_kg,
        cii.chemical_raw_material_position,
        cii.chemical_raw_material_supplier,
        cii.test_employee,
        cii.input_test_hardness,
        cii.quality_check,
        cii.batch_kg
      FROM 
        chemical_individual_input cii
      WHERE 
        cii.chemical_raw_material_batch_no = ?
    `;

    const [results1] = await connection.execute(sql1, [batchNumber]);

    // Query for stock and general information if any batch is found
    let results2 = [];
    if (results1.length > 0) {
      const chemicalId = results1[0].chemical_raw_material_id; // Assuming all batches have same chemical ID
      const sql2 = `
        SELECT 
          cs.chemical_raw_material_id, 
          rmf.chemical_raw_material_name, 
          cs.chemical_raw_material_current_stock,
          rmf.material_function,
          rmf.unit_price,
          cs.safty_stock_value
        FROM 
          chemical_stocks cs
        INNER JOIN 
          rubber_raw_material_file rmf ON cs.chemical_raw_material_id = rmf.chemical_raw_material_id
        WHERE 
          cs.chemical_raw_material_id = ?
      `;

      [results2] = await connection.execute(sql2, [chemicalId]);
    }

    await connection.end();

    res.json({ 
      chemicalStocksAndInfo: results2,
      chemicalIndividualInput: results1
    });

  } catch (error) {
    console.error('Error searching materials by batch number:', error.message);
    res.status(500).send('Error searching materials by batch number');
  }
});
//-------------化工原料庫存總表-----------------------------------------------
//get list of all chemicals and current stocks
app.get('/get-chemicals', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = `
    SELECT 
    cs.chemical_raw_material_id,
    rmf.chemical_raw_material_name,
    cs.chemical_raw_material_current_stock,
    cs.safty_stock_value,
    cs.ok_kg,
    cs.ng_kg,
    cs.need_restock
    FROM 
        chemical_stocks cs
    JOIN 
        rubber_raw_material_file rmf
    ON 
        cs.chemical_raw_material_id = rmf.chemical_raw_material_id;
    `;

    const [chemicals] = await connection.execute(sql);
    await connection.end();
    res.json(chemicals);
  } catch (error) {
    console.error('Error fetching chemicals:', error.message);
    res.status(500).send('Error fetching chemicals');
  }
});
//-------------化工原料入庫-----------------------------------------------
//get list of all chemical inputs
app.get('/get-chemical_inputs', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = `
    SELECT
      DATE_FORMAT(cii.input_date, '%Y-%m-%d') as input_date,
      cii.chemical_raw_material_id,
      rmf.chemical_raw_material_name,
      cii.chemical_raw_material_batch_no,
      cii.chemical_raw_material_input_kg,
      cii.batch_kg,
      COALESCE(cii.chemical_raw_material_position, "無") AS chemical_raw_material_position,
      COALESCE(cii.chemical_raw_material_supplier, "無") AS chemical_raw_material_supplier,
      cii.input_test_hardness,
      COALESCE(cii.test_employee, "無") AS test_employee,
      CASE
        WHEN cii.quality_check = 1 THEN "合格"
        WHEN cii.quality_check = 0 THEN "不合格"
        ELSE cii.quality_check -- You might want to handle other values or keep it as is
      END AS quality_check,
      COALESCE(cii.supplier_material_batch_no, "無") AS supplier_material_batch_no
    FROM
      chemical_individual_input cii
    INNER JOIN
      rubber_raw_material_file rmf
    ON
      cii.chemical_raw_material_id = rmf.chemical_raw_material_id;
    `;

    const [chemicals] = await connection.execute(sql);
    await connection.end();
    res.json(chemicals);
  } catch (error) {
    console.error('Error fetching chemicals:', error.message);
    res.status(500).send('Error fetching chemicals');
  }
});


const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

