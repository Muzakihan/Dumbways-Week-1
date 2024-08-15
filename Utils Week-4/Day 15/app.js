const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const hbs = require('hbs');
const { Pool } = require('pg');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dumbways-project',
  password: 'postgres01',
  port: 5432,
});

// Set up body-parser to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up session management
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

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

// Middleware untuk memeriksa apakah pengguna sudah login
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // Pengguna sudah login, lanjutkan ke rute berikutnya
  }
  res.redirect('/login'); // Jika tidak, arahkan ke halaman login
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
}

// Route handlers
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tb_projects');
    const projects = result.rows.map(project => ({
      ...project,
      start_date: formatDate(project.start_date),
      end_date: formatDate(project.end_date)
    }));
    res.render('home', { projects, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving projects');
  }
});

app.get('/contact', (req, res) => {
  res.render('contact-me', { user: req.session.user });
});

app.get('/add-project', isAuthenticated, (req, res) => {
  res.render('add-project', { user: req.session.user });
});

app.post('/add-project', isAuthenticated, upload.single('image'), async (req, res) => {
  const { name, startDate, endDate, description, option } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const author = req.session.user.id;  // Dapatkan ID pengguna dari session

  try {
    await pool.query(
      'INSERT INTO tb_projects (name, start_date, end_date, description, technologies, image, author) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, startDate, endDate, description, Array.isArray(option) ? option.join(', ') : option, image, author]
    );
    console.log('New Project Added:', { name, startDate, endDate, description, technologies: option, image, author });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding project');
  }
});

app.get('/project/:id', async (req, res) => {
  const projectId = req.params.id;

  try {
      const result = await pool.query(`
          SELECT p.id, p.name, p.description, p.start_date, p.end_date, p.image, u.username, p.technologies
          FROM tb_projects p
          JOIN tb_users u ON p.author = u.id
          WHERE p.id = $1`, [projectId]);
      
      const project = result.rows[0];

      res.render('detail-project', { project });
  } catch (error) {
      console.error('Error retrieving project:', error);
      res.status(500).send('Error retrieving project');
  }
});

app.get('/update-project/:id', isAuthenticated, async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(`
      SELECT p.*, u.username
      FROM tb_projects p
      JOIN tb_users u ON p.author = u.id
      WHERE p.id = $1`, [projectId]);
      
    const project = result.rows[0];

    if (project) {
      res.render('update-project', { project, technologies: ['Node Js', 'React Js', 'Next Js', 'TypeScript'], user: req.session.user });
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving project');
  }
});

app.post('/update-project/:id', isAuthenticated, upload.single('image'), async (req, res) => {
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

app.post('/delete-project/:id', isAuthenticated, async (req, res) => {
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

// Rute untuk Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM tb_users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = { id: user.id, email: user.email, username: user.username }; // Simpan username dalam session
      res.redirect('/');
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

// Rute untuk Register
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query('INSERT INTO tb_users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
