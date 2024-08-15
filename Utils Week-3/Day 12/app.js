const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const hbs = require('hbs');

const app = express();
const port = 3000;

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

// In-memory storage for projects
let projects = [];
let nextId = 1;

// Route handlers
app.get('/', (req, res) => {
  res.render('home', { projects });
});

app.get('/contact', (req, res) => {
  res.render('contact-me', { projects });
});

app.get('/add-project', (req, res) => {
  res.render('add-project');
});

app.post('/add-project', upload.single('image'), (req, res) => {
  const { name, startDate, endDate, description, option } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const newProject = {
    id: nextId++,
    name,
    startDate,
    endDate,
    description,
    technologies: Array.isArray(option) ? option : [option],
    image
  };

  projects.push(newProject);
  console.log('New Project Added:', newProject);

  res.redirect('/');
});

app.get('/project/:id', (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  const project = projects.find(p => p.id === projectId);

  if (project) {
    res.render('detail-project', { project });
  } else {
    res.status(404).send('Project not found');
  }
});

app.get('/update-project/:id', (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  const project = projects.find(p => p.id === projectId);

  if (project) {
    res.render('update-project', { project, technologies: ['Node Js', 'React Js', 'Next Js', 'TypeScript'] });
  } else {
    res.status(404).send('Project not found');
  }
});

app.post('/update-project/:id', upload.single('image'), (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  const { name, startDate, endDate, description, option } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const projectIndex = projects.findIndex(p => p.id === projectId);

  if (projectIndex !== -1) {
    projects[projectIndex] = {
      id: projectId,
      name,
      startDate,
      endDate,
      description,
      technologies: Array.isArray(option) ? option : [option],
      image: image || projects[projectIndex].image
    };
    console.log('Project Updated:', projects[projectIndex]);
    res.redirect('/');
  } else {
    res.status(404).send('Project not found');
  }
});

app.post('/delete-project/:id', (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  projects = projects.filter(p => p.id !== projectId);
  console.log(`Project with ID ${projectId} deleted.`);
  res.redirect('/');
});

app.get('/contact-me', (req, res) => {
  res.render('contact-me');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
