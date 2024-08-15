function truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "..."; // Memotong dan menambahkan "..."
    }
    return text;
  }
  
  async function loadProjects() {
    try {
      const response = await fetch('https://api.npoint.io/51d0f992a60e26bdebc8'); // https://api.npoint.io/51d0f992a60e26bdebc8/0/day
      const projects = await response.json();
  
      const container = document.getElementById('projects-container');
      container.innerHTML = ''; // Clear previous content
  
      projects.forEach((project, index) => {
        const projectElement = document.createElement('div');
        projectElement.className = "d-flex align-items-center rounded p-3 mx-5";
        projectElement.innerHTML = `
          <div class="d-flex gap-3 align-items-center">
            <div class="d-flex justify-content-center flex-column">
              <h3 class="m-0 text-center border border-black p-2 rounded">
                DAY <br />
                <span class="text-center">${project.day}</span>
              </h3>
            </div>
            <div class="border border-black p-3 rounded">
              <h3 class="m-0">${truncateText(project.title, 15)}</h3> <!-- Gunakan fungsi truncateText -->
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                <p class="m-0"><a href="${project.link}">GO TO THE PROJECT...</a></p>
              </div>
            </div>
          </div>
        `;
  
        container.appendChild(projectElement);
      });
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }
  
  // Call the function to load projects on page load
  loadProjects();
  