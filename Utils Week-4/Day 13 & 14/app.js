const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const hbs = require('hbs');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres', // Ganti dengan username PostgreSQL Anda
  host: 'localhost', // Host dari server PostgreSQL Anda
  database: 'tb_projects', // Nama database Anda
  password: 'postgres01', // Password PostgreSQL Anda
  port: 5432, // Port PostgreSQL, default 5432
});

// Set up body-parser to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up view engine to use Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Route handlers
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tb_projects');
    const projects = result.rows.map(project => ({
      ...project,
      start_date: formatDate(project.start_date),
      end_date: formatDate(project.end_date)
    }));
    res.render('home', { projects });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving projects');
  }
});

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options); // Format tanggal sesuai lokal Indonesia
}

app.get('/contact', (req, res) => {
  res.render('contact-me');
});

app.get('/add-project', (req, res) => {
  res.render('add-project');
});

app.post('/add-project', upload.single('image'), async (req, res) => {
  const { name, startDate, endDate, description, option } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await pool.query(
      'INSERT INTO tb_projects (name, start_date, end_date, description, technologies, image) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, startDate, endDate, description, Array.isArray(option) ? option.join(', ') : option, image]
    );
    console.log('New Project Added:', { name, startDate, endDate, description, technologies: option, image });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding project');
  }
});

app.get('/project/:id', async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('SELECT * FROM tb_projects WHERE id = $1', [projectId]);
    const project = result.rows[0];

    if (project) {
      project.start_date = formatDate(project.start_date);
      project.end_date = formatDate(project.end_date);
      res.render('detail-project', { project });
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving project');
  }
});

app.get('/update-project/:id', async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('SELECT * FROM tb_projects WHERE id = $1', [projectId]);
    const project = result.rows[0];

    if (project) {
      res.render('update-project', { project, technologies: ['Node Js', 'React Js', 'Next Js', 'TypeScript'] });
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving project');
  }
});

app.post('/update-project/:id', upload.single('image'), async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  const { name, startDate, endDate, description, option } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await pool.query(
      'UPDATE tb_projects SET name = $1, start_date = $2, end_date = $3, description = $4, technologies = $5, image = $6 WHERE id = $7',
      [name, startDate, endDate, description, Array.isArray(option) ? option.join(', ') : option, image || null, projectId]
    );
    console.log('Project Updated:', { name, startDate, endDate, description, technologies: option, image });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating project');
  }
});

app.post('/delete-project/:id', async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM tb_projects WHERE id = $1', [projectId]);
    console.log(`Project with ID ${projectId} deleted.`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting project');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});