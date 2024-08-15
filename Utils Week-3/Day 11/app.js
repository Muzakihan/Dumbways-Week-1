const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Set up body-parser to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up view engine to use Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for projects
const projects = {};

// Route handlers
app.get('/', (req, res) => {
  res.render('home', { projects: Object.values(projects) });
});

app.get('/add-project', (req, res) => {
  res.render('add-project');
});

app.post('/add-project', (req, res) => {
  const { name, startDate, endDate, description, option } = req.body;
  const projectId = Date.now(); // Unique ID for the project (using timestamp for simplicity)

  // Store project data
  projects[projectId] = {
    id: projectId,
    name,
    startDate,
    endDate,
    description,
    technologies: Array.isArray(option) ? option : [option]
  };

  // Log data to the terminal
  console.log('New Project Added:', projects[projectId]);

  // Redirect to homepage or a success page
  res.redirect('/');
});

// Dynamic route for project details
app.get('/project/:id', (req, res) => {
  const projectId = req.params.id;
  const project = projects[projectId];

  if (project) {
    res.render('detail-project', { project });
  } else {
    res.status(404).send('Project not found');
  }
});

app.get('/contact', (req, res) => {
  res.render('contact-me');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
