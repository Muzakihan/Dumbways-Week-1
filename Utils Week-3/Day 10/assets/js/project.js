let dataBlog = [];
let editingIndex = -1; // Indeks untuk menyimpan blog yang sedang diedit

document
  .getElementById("projectForm")
  .addEventListener("submit", addOrUpdateBlog); // Ganti nama fungsi menjadi addOrUpdateBlog
document.querySelectorAll('input[name="option"]').forEach((checkbox) => {
  checkbox.addEventListener("change", updateTechIcons);
});

function addOrUpdateBlog(event) {
  event.preventDefault();

  let title = document.getElementById("nameInput").value;
  let startDate = document.getElementById("startDateInput").value;
  let endDate = document.getElementById("endDateInput").value;
  let description = document.getElementById("descriptionInput").value;
  let options = Array.from(
    document.querySelectorAll('input[name="option"]:checked')
  ).map((checkbox) => checkbox.value);

  let imageInput = document.getElementById("imageInput");
  let imageFile = imageInput.files[0];
  let imageUrl = "";

  if (imageFile) {
    imageUrl = URL.createObjectURL(imageFile);
  }

  let blog = {
    title,
    startDate,
    endDate,
    description,
    options,
    image: imageUrl,
  };

  if (editingIndex >= 0) {
    // Jika sedang dalam mode edit, perbarui data yang ada
    dataBlog[editingIndex] = blog;
    editingIndex = -1; // Reset editingIndex setelah update
  } else {
    // Tambahkan blog baru
    dataBlog.push(blog);
  }

  renderBlog();
  document.getElementById("projectForm").reset();
  document.getElementById("techIcons").innerHTML = "";
}

function renderBlog() {
  const contents = document.getElementById("cardProject");
  contents.innerHTML = "";

  dataBlog.forEach((blog, index) => {
    contents.innerHTML += `
        <div class="cardProject-container">
          <img class="cardProject__image" src="${blog.image}" alt="Blog Image" />
          <div class="cardProject__content">
            <h1><a href="cardProject__blog-detail.html" target="_blank">${blog.title}</a></h1>
            <div class="cardProject__duration">${formatEndDate(blog.endDate)}</div>
            <div class="cardProject__duration">${formatStartDate(blog.startDate)}</div>
            <p class="cardProject__description">${blog.description}</p>
            <div class="cardProject__tech-icons">
              ${blog.options.map((option) => getTechIcon(option)).join("")}
            </div>
          </div>
          <div class="cardProject__footer">
            <button class="button button-edit" onclick="editBlog(${index})">Edit</button>
            <button class="button button-delete" onclick="deleteBlog(${index})">Delete</button>
          </div>
        </div>`;
  });
}

function deleteBlog(index) {
  dataBlog.splice(index, 1);
  renderBlog();
}

function editBlog(index) {
  const blog = dataBlog[index];
  document.getElementById("nameInput").value = blog.title;
  document.getElementById("startDateInput").value = blog.startDate;
  document.getElementById("endDateInput").value = blog.endDate;
  document.getElementById("descriptionInput").value = blog.description;

  // Set checked options
  document.querySelectorAll('input[name="option"]').forEach((checkbox) => {
    checkbox.checked = blog.options.includes(checkbox.value);
  });

  // Set editingIndex ke indeks yang akan diedit
  editingIndex = index;

  // Update ikon teknologi
  updateTechIcons();
}

function updateTechIcons() {
  const techIcons = {
    "Node Js": '<i class="fab fa-node-js" title="Node Js"></i>',
    "React Js": '<i class="fab fa-react" title="React Js"></i>',
    "Next Js":
      '<img src="./assets/image/nextjs-icon.png" alt="Next Js" title="Next Js" />',
    TypeScript:
      '<img src="./assets/image/typescript-icon.png" alt="TypeScript" title="TypeScript" />',
  };

  const selectedOptions = Array.from(
    document.querySelectorAll('input[name="option"]:checked')
  ).map((checkbox) => checkbox.value);

  const techIconsContainer = document.getElementById("techIcons");
  techIconsContainer.innerHTML = selectedOptions
    .map((option) => techIcons[option] || "")
    .join("");
}
function getTechIcon(option) {
  const techIcons = {
    "Node Js": '<i class="fab fa-node-js"></i>',
    "React Js": '<i class="fab fa-react"></i>',
    "Next Js": '<i class="fa-brands fa-js"></i>',
    TypeScript: '<i class="fa-brands fa-js"></i>',
  };
  return techIcons[option] || "";
}

function formatEndDate(date) {
  const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
  const endDate = new Date(date).toLocaleDateString('id-ID', options);
  return endDate.replace('Waktu Indonesia Barat', 'WIB');
}

function formatStartDate(date) {
  const now = new Date();
  const startDate = new Date(date);
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} hari lalu`;
  } else if (diffHours > 0) {
    return `${diffHours} jam lalu`;
  } else {
    return `${diffMinutes} menit lalu`;
  }
}