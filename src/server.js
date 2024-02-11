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

app.get('/material-stock-status/:materialAssignId', async (req, res) => {
  const { materialAssignId } = req.params; // Get materialAssignId from URL parameters

  try {
    const connection = await mysql.createConnection(dbConfig);

    // First SQL query to check if stock is enough for all materials
    const sqlIsStockEnough = `
      SELECT
        CASE
          WHEN SUM(CASE WHEN cs.chemical_raw_material_current_stock >= dmf.usage_kg THEN 0 ELSE 1 END) = 0 THEN TRUE
          ELSE FALSE
        END AS is_stock_enough
      FROM
        daily_material_formula dmf
        INNER JOIN chemical_stocks cs ON dmf.chemical_raw_material_id = cs.chemical_raw_material_id
      WHERE
        dmf.material_assign_id = ?`;
    const [isStockEnoughResult] = await connection.execute(sqlIsStockEnough, [materialAssignId]);

    // Second SQL query to get details of materials with insufficient stock
    const sqlInsufficientStockDetails = `
    SELECT
        dmf.chemical_raw_material_id,
        rrmf.chemical_raw_material_name, -- This line fetches the material name from the joined table
        dmf.usage_kg,
        cs.chemical_raw_material_current_stock
    FROM
        daily_material_formula dmf
        INNER JOIN chemical_stocks cs ON dmf.chemical_raw_material_id = cs.chemical_raw_material_id
        INNER JOIN rubber_raw_material_file rrmf ON dmf.chemical_raw_material_id = rrmf.chemical_raw_material_id -- Join with rubber_raw_material_file
    WHERE
        dmf.material_assign_id = ?
        AND (cs.chemical_raw_material_current_stock < dmf.usage_kg OR cs.chemical_raw_material_current_stock IS NULL);
    `;
    const [insufficientStockDetails] = await connection.execute(sqlInsufficientStockDetails, [materialAssignId]);

    await connection.end();

    // Structure the response to include both query results
    res.json({
      isStockEnough: isStockEnoughResult[0].is_stock_enough,
      insufficientStockDetails
    });
  } catch (error) {
    console.error('Error fetching material stock status:', error.message);
    res.status(500).send('Error fetching material stock status');
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

//get most recent production in kg
app.get('/get-latest-total-demand', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
      SELECT 
        production_date, 
        SUM(CAST(total_demand AS DECIMAL(10,2))) AS total_demand_sum
      FROM 
        material_assignments
      WHERE 
        production_date = (SELECT MAX(production_date) FROM material_assignments)
      GROUP BY 
        production_date;
    `;

    const [results] = await connection.execute(sql);

    // Close the database connection
    await connection.end();

    // Check if results are found
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('No data found for the latest production date.');
    }
  } catch (error) {
    console.error('Error fetching the total demand for the latest production date:', error.message);
    res.status(500).send('Error fetching the total demand for the latest production date');
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
    SELECT 
    dmf.daily_material_formula_id,
    dmf.material_assign_id,
    ma.material_id,
    ma.total_demand,
    ma.production_sequence,
    ma.production_machine,
    dmf.chemical_raw_material_id,
    rrmf.chemical_raw_material_name,
    dmf.usage_kg,
    ma.batch_number,
    dmf.collecting_finished,
    dmf.notes
    FROM 
        daily_material_formula dmf
    JOIN 
        material_assignments ma ON dmf.material_assign_id = ma.material_assign_id
    JOIN 
        rubber_raw_material_file rrmf ON dmf.chemical_raw_material_id = rrmf.chemical_raw_material_id
    WHERE 
        ma.batch_number LIKE CONCAT(?, '%')
    ORDER BY 
        ma.batch_number ASC;
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

//get all the Batchnumber for recommendation system
app.get('/get-chemical-input-detail/:id', async (req, res) => {
  try {
    // Extract the chemical raw material id from the request parameters
    const chemicalRawMaterialId = req.params.id;

    // Create a new MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // SQL query to select data from the chemical_individual_input table
    const sql = `
      SELECT 
        chemical_raw_material_batch_no, 
        chemical_raw_material_id, 
        chemical_raw_material_position,
        input_test_hardness,
        batch_kg
      FROM chemical_individual_input
      WHERE chemical_raw_material_id = ?
    `;

    // Execute the query with the chemicalRawMaterialId parameter
    const [rows] = await connection.execute(sql, [chemicalRawMaterialId]);

    // Close the connection
    await connection.end();

    // Send the data back to the client
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Error fetching data: ' + error.message);
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
    DATE_FORMAT(CONVERT_TZ(rf.creation_date, '+00:00', '+08:00'), '%Y-%m-%d') AS creation_date,
    rf.material_id, 
    rf.chemical_raw_material_id,
    rm.chemical_raw_material_name,
    rf.usage_kg,
    rm.material_function,
    rf.sequence,
    rm.unit_price
    FROM 
        rubber_formula_file rf
    JOIN 
        rubber_raw_material_file rm ON rf.chemical_raw_material_id = rm.chemical_raw_material_id
    WHERE 
        rf.material_id = ?;
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

// Endpoint to fetch material name
app.get('/get-material-name/:id', async (req, res) => {
  const chemicalRawMaterialID = req.params.id;
  const name = await getChemicalRawMaterialName(chemicalRawMaterialID);
  if (name !== 'Name Not Found' && name !== 'Error Fetching Name') {
    res.json({ success: true, chemicalRawMaterialName: name });
  } else {
    res.status(404).json({ success: false, message: name });
  }
});

async function getChemicalRawMaterialName(chemicalRawMaterialID) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(
      'SELECT chemical_raw_material_name FROM rubber_raw_material_file WHERE chemical_raw_material_id = ?',
      [chemicalRawMaterialID]
    );
    await connection.end();
    if (rows.length > 0) {
      return rows[0].chemical_raw_material_name; // Return the name
    } else {
      return 'Name Not Found'; // Or any other fallback you prefer
    }
  } catch (error) {
    console.error('Error fetching material name:', error);
    await connection.end();
    return 'Error Fetching Name';
  }
}

// Endpoint to insert into rubber_file
app.post('/add-rubber', async (req, res) => {
  try {
    const { materialID, propertyID, usageID, hardness, stickiness, colorID, customerUsage, mainIngredient } = req.body.rubberData;
    const connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.execute(
      `INSERT INTO rubber_file (material_id, property_id, usage_id, hardness, stickness, color_id, customer_usage, main_ingredient)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [materialID, propertyID, usageID, hardness, stickiness, colorID, customerUsage, mainIngredient]
    );
    
    await connection.end();
    res.send({ message: 'Rubber data saved successfully', id: results.insertId });
  } catch (error) {
    console.error('Error saving rubber data:', error);
    res.status(500).send({ message: error.message });
  }
});

// Endpoint to insert into rubber_formula_file
app.post('/add-rubber-formula', async (req, res) => {
  try {
    const { rawMaterials } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    const sql = `INSERT INTO rubber_formula_file (creation_date, material_id, chemical_raw_material_id, usage_kg, sequence)
                 VALUES ?`;
    const values = rawMaterials.map(material => [material.creationDate, material.material_id, material.chemicalRawMaterialID, material.usageKg, material.sequence]);
    console.log(values);
    await connection.query(sql, [values]);
    await connection.end();
    res.send({ message: 'Rubber formula data saved successfully' });
  } catch (error) {
    console.error('Error saving rubber formula data:', error);
    res.status(500).send({ message: error.message });
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

//add import to chemical input table
app.post('/add-chemical-import', async (req, res) => {
  try {
    const {
      chemical_raw_material_batch_no,
      input_date,
      chemical_raw_material_id,
      supplier_material_batch_no,
      chemical_raw_material_input_kg,
      chemical_raw_material_position,
      chemical_raw_material_supplier,
      test_employee,
      input_test_hardness,
      batch_kg
    } = req.body;
    
    // Create a new database connection
    const connection = await mysql.createConnection(dbConfig);

    // Insert the new import data into the chemical_individual_input table
    const sql = `
      INSERT INTO chemical_individual_input (
        chemical_raw_material_batch_no,
        input_date,
        chemical_raw_material_id,
        supplier_material_batch_no,
        chemical_raw_material_input_kg,
        chemical_raw_material_position,
        chemical_raw_material_supplier,
        test_employee,
        input_test_hardness,
        batch_kg
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const results = await connection.execute(sql, [
      chemical_raw_material_batch_no,
      input_date,
      chemical_raw_material_id,
      supplier_material_batch_no,
      chemical_raw_material_input_kg,
      chemical_raw_material_position,
      chemical_raw_material_supplier,
      test_employee,
      input_test_hardness,
      batch_kg
    ]);

    // Close the database connection
    await connection.end();

    // Send a success response
    res.status(200).json({ message: 'New chemical import added successfully', data: results[0] });
  } catch (error) {
    // Handle any errors
    console.error('Error adding new chemical import:', error.message);
    res.status(500).send('Error adding new chemical import');
  }
});

// Add export to chemical output table
app.post('/export-chemical-material', async (req, res) => {
  try {
    const { today, batchNo, kilograms, purpose } = req.body;
    
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
      INSERT INTO chemical_individual_output (
        collect_date,
        chemical_raw_material_batch_no,
        chemical_raw_material_output_kg,
        output_usage
      ) VALUES (?, ?, ?, ?)
    `;

    const results = await connection.execute(sql, [
      today,
      batchNo,
      kilograms,
      purpose
    ]);

    await connection.end();

    res.status(200).json({ message: 'Export data added successfully', data: results[0] });
  } catch (error) {
    console.error('Error exporting chemical material:', error.message);
    res.status(500).send('Error exporting chemical material');
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

//get export information for each row
// Endpoint to get export history by batch number
app.get('/get-export-history/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const sql = `
      SELECT 
        chemical_raw_material_batch_no,
        DATE_FORMAT(CONVERT_TZ(collect_date, '+00:00', '+08:00'), '%Y-%m-%d') as formatted_collect_date,
        chemical_raw_material_output_kg,
        output_usage
      FROM 
        chemical_individual_output
      WHERE 
        chemical_raw_material_batch_no = ?
    `;

    const [results] = await connection.execute(sql, [batchNumber]);
    await connection.end();

    res.json(results);
  } catch (error) {
    console.error('Error getting export history:', error.message);
    res.status(500).send('Error getting export history');
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

//新增化工原料入庫
app.post('/add-new-chemical-raw-material', async (req, res) => {
  const { chemical_raw_material_id, chemical_raw_material_name, material_function, unit_price, safety_stock_value } = req.body;
  
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Insert into rubber_raw_material_file
    const insertRubberRawMaterialFile = `
      INSERT INTO rubber_raw_material_file (chemical_raw_material_id, chemical_raw_material_name, material_function, unit_price) 
      VALUES (?, ?, ?, ?);
    `;
    await connection.execute(insertRubberRawMaterialFile, [chemical_raw_material_id, chemical_raw_material_name, material_function, unit_price]);

    //Insert into chemical_stocks
    const updateChemicalStocks = `
      UPDATE chemical_stocks
      SET safty_stock_value = ?
      WHERE chemical_raw_material_id = ?;
    `;

    await connection.execute(updateChemicalStocks, [safety_stock_value, chemical_raw_material_id]);

    await connection.end();

    res.send("化工原料新增成功!");
  } catch (error) {
    console.error('Error adding new chemical raw material:', error.message);
    res.status(500).send('Error adding new chemical raw material');
  }
});

//刪除化工原料入庫
app.delete('/delete-chemical-raw-material/:chemical_raw_material_id', async (req, res) => {
  const { chemical_raw_material_id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // First, delete related rows from chemical_stocks
    const deleteChemicalStocksQuery = `
      DELETE FROM chemical_stocks
      WHERE chemical_raw_material_id = ?;
    `;
    await connection.execute(deleteChemicalStocksQuery, [chemical_raw_material_id]);

    // Then, delete the row from rubber_raw_material_file
    const deleteRubberRawMaterialFileQuery = `
      DELETE FROM rubber_raw_material_file
      WHERE chemical_raw_material_id = ?;
    `;
    await connection.execute(deleteRubberRawMaterialFileQuery, [chemical_raw_material_id]);

    await connection.end();

    res.send("Chemical raw material and related stocks successfully deleted.");
  } catch (error) {
    console.error('Error deleting chemical raw material:', error.message);
    res.status(500).send('Error deleting chemical raw material');
  }
});

//更新化工原料入庫
app.get('/get-chemical-raw-material-to-update/:chemical_raw_material_id', async (req, res) => {
  const { chemical_raw_material_id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `
      SELECT 
        r.chemical_raw_material_id, 
        r.chemical_raw_material_name, 
        r.material_function, 
        r.unit_price, 
        c.safty_stock_value
      FROM rubber_raw_material_file r
      JOIN chemical_stocks c ON r.chemical_raw_material_id = c.chemical_raw_material_id
      WHERE r.chemical_raw_material_id = ?;
    `;

    const [rows] = await connection.execute(query, [chemical_raw_material_id]);
    await connection.end();

    if (rows.length > 0) {
      res.json(rows[0]); // Sending back the first (and should be only) result.
    } else {
      res.status(404).send('Chemical raw material not found');
    }
  } catch (error) {
    console.error('Failed to fetch chemical raw material details:', error.message);
    res.status(500).send('Failed to fetch chemical raw material details');
  }
});

// Endpoint to update a chemical raw material
app.put('/update-chemical-raw-material/:chemical_raw_material_id', async (req, res) => {
  const { chemical_raw_material_id } = req.params;
  const { chemical_raw_material_name, material_function, unit_price, safety_stock_value } = req.body;

  console.log(chemical_raw_material_id, chemical_raw_material_name, material_function, unit_price, safety_stock_value);
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Update rubber_raw_material_file
    const updateRubberRawMaterialFileQuery = `
      UPDATE rubber_raw_material_file
      SET 
        chemical_raw_material_name = ?,
        material_function = ?,
        unit_price = ?
      WHERE chemical_raw_material_id = ?;
    `;
    await connection.execute(updateRubberRawMaterialFileQuery, [chemical_raw_material_name, material_function, unit_price, chemical_raw_material_id]);

    // Update chemical_stocks
    const updateChemicalStocksQuery = `
      UPDATE chemical_stocks
      SET 
        safty_stock_value = ?
      WHERE chemical_raw_material_id = ?;
    `;
    await connection.execute(updateChemicalStocksQuery, [safety_stock_value, chemical_raw_material_id]);

    await connection.end();

    res.json({ message: "Chemical raw material updated successfully!" });
  } catch (error) {
    console.error('Failed to update chemical raw material:', error.message);
    res.status(500).send('Failed to update chemical raw material');
  }
});


//-------------化工原料出庫-----------------------------------------------
//get list of all chemical output

app.get('/get-chemical_outputs', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = `
      SELECT
        DATE_FORMAT(cio.collect_date, '%Y-%m-%d') AS collect_date,
        cii.chemical_raw_material_id,
        rmf.chemical_raw_material_name,
        cii.chemical_raw_material_batch_no,
        cio.chemical_raw_material_output_kg,
        cii.batch_kg,
        COALESCE(cii.chemical_raw_material_position, "無") AS chemical_raw_material_position,
        COALESCE(cii.chemical_raw_material_supplier, "無") AS chemical_raw_material_supplier,
        cii.input_test_hardness,
        COALESCE(cii.test_employee, "無") AS test_employee,
        CASE
          WHEN cii.quality_check = 1 THEN "合格"
          WHEN cii.quality_check = 0 THEN "不合格"
          ELSE cii.quality_check -- Handle other values or keep as is
        END AS quality_check,
        COALESCE(cii.supplier_material_batch_no, "無") AS supplier_material_batch_no,
        COALESCE(cio.output_usage, "無") AS output_usage
      FROM
        chemical_individual_input cii
      INNER JOIN
        rubber_raw_material_file rmf
      ON
        cii.chemical_raw_material_id = rmf.chemical_raw_material_id
      INNER JOIN
        chemical_individual_output cio
      ON
        cii.chemical_raw_material_batch_no = cio.chemical_raw_material_batch_no;

    `;

    const [chemicals] = await connection.execute(sql);
    await connection.end();
    res.json(chemicals);
  } catch (error) {
    console.error('Error fetching chemicals:', error.message);
    res.status(500).send('Error fetching chemicals');
  }
});
//-------------Dashboard-----------------------------------------------
//get 3 data for card
app.get('/get-data-card-info', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    //get 昨日未完成筆數
    const sql_not_collected_no = `
    SELECT COUNT(DISTINCT ma.material_assign_id) AS not_collected_no
    FROM material_assignments ma
    JOIN daily_material_formula dmf ON ma.material_assign_id = dmf.material_assign_id
    WHERE ma.production_date = (
        SELECT MAX(production_date)
        FROM material_assignments
        WHERE production_date < CURRENT_DATE
    )
    AND dmf.collecting_finished = FALSE;
    `;
    //get 本日打料公斤數
    const sql_today_production = `
    SELECT SUM(CAST(total_demand AS INT)) AS total_kg_today
    FROM material_assignments
    WHERE production_date = CURRENT_DATE;

    `;
    //get 需補貨化工
    const sql_count_need_restock = `
    SELECT COUNT(*) AS number_needing_restock
    FROM chemical_stocks
    WHERE need_restock = TRUE;
    `;

    // Execute each SQL query and store the result
    const [notCollectedResults] = await connection.execute(sql_not_collected_no);
    const [todayProductionResults] = await connection.execute(sql_today_production);
    const [needRestockResults] = await connection.execute(sql_count_need_restock);

    // Close the database connection
    await connection.end();

    // Construct a response object that includes the results from all three queries
    const responseData = {
      notCollectedNo: notCollectedResults[0].not_collected_no,
      totalKgToday: todayProductionResults[0].total_kg_today,
      numberNeedingRestock: needRestockResults[0].number_needing_restock
    };

    // Send the response object back to the client
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Error fetching data');
  }
});

//get data for chart 
app.get('/get-production-data', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = `
      SELECT 
        DATE_FORMAT(sub.production_date, '%W') AS day_of_week,
        sub.production_date,
        SUM(CASE WHEN ma.material_id LIKE 'HS-%' THEN CAST(ma.total_demand AS DECIMAL(10,2)) ELSE 0 END) AS silicone_kg,
        SUM(CASE WHEN ma.material_id NOT LIKE 'HS-%' THEN CAST(ma.total_demand AS DECIMAL(10,2)) ELSE 0 END) AS rubber_kg
      FROM 
        material_assignments ma
      INNER JOIN (
        SELECT DISTINCT production_date
        FROM material_assignments
        WHERE production_date <= CURRENT_DATE
        ORDER BY production_date DESC
        LIMIT 5
      ) sub ON ma.production_date = sub.production_date
      GROUP BY 
        sub.production_date
      ORDER BY 
        sub.production_date ASC;
    `;

    const [results] = await connection.execute(sql);

    // Close the database connection
    await connection.end();

    // Send the results back to the client
    res.json(results);
  } catch (error) {
    console.error('Error fetching production data:', error.message);
    res.status(500).send('Error fetching production data');
  }
});



const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
  
