let currentUser = null;

// === SIGNUP FORM HANDLER ===
document.querySelector("#signupForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop page refresh when form is submitted

  // 🟢 Define username and password from input fields
  const username = document.querySelector("#signupUsername").value.trim();
  const password = document.querySelector("#signupPassword").value.trim();

  // 🟡 Validation
  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  // 🟣 Send data to backend
  try {
    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // send both to backend
    });

    const data = await response.json();

    // 🟢 Check if signup succeeded
    if (response.ok) {
      alert("✅ Signup successful!");
      console.log("Server Response:", data);
    } else {
      (data.message || data.sqlMessage || data.error || "Unknown error")

    
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
    alert("Network error. Make sure backend (server.js) is running!");
  }
});

// ------------------------
// Login
// ------------------------
async function login() {
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value.trim();

  if (!username || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert(`✅ Welcome, ${data.user.username}!`);
      currentUser = data.user;
      showPage("home"); // Switch to home page
      console.log("Logged in user:", currentUser);
    } else {
      alert(`❌ ${data.message || "Login failed"}`);
    }
  } catch (err) {
    console.error("❌ Network error:", err);
    alert("Server error. Please make sure backend is running.");
  }
}

// ------------------------
// Logout
// ------------------------
function logout() {
  currentUser = null;
  alert('You have been logged out.');
  showPage('login');
}

// ------------------------
// Contact Form
// ------------------------

document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !email || !message) {
    return alert('Please fill all required fields.');
  }
  const phoneRegex = /^\d{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address!");
    return;
  }

  if (!phoneRegex.test(phone)) {
    alert("Phone number must be exactly 10 digits!");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message })
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ Message sent successfully!');
      this.reset();
    } else {
      alert('❌ ' + (data.message || 'Failed to send message.'));
      console.error('Backend Response:', data);
    }
  } catch (err) {
    console.error('❌ Server Error:', err);
    alert('Server error. Try again later.');
  }
});

// ====== Upload Notes ======
const uploadForm = document.getElementById("uploadForm");
const uploadMessage = document.getElementById("uploadMessage");
const notesList = document.getElementById("notesList");

if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById("file");
    formData.append("file", fileInput.files[0]);

    try {
      const response = await fetch("http://localhost:5000/uploadNote", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      uploadMessage.textContent = data.message;
      uploadMessage.style.color = "green";
      fetchNotes(); // refresh notes list
    } catch (error) {
      uploadMessage.textContent = "Upload failed!";
      uploadMessage.style.color = "red";
    }
  });
}

// ====== Fetch Notes ======
async function fetchNotes() {
  try {
    const response = await fetch("http://localhost:5000/getNotes");
    const notes = await response.json();

    notesList.innerHTML = "";
    notes.forEach((note) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="http://localhost:5000${note.filepath}" target="_blank">${note.filename}</a>`;
      notesList.appendChild(li);
    });
  } catch (error) {
    notesList.innerHTML = "<li>Failed to load notes.</li>";
  }
}

if (notesList) fetchNotes();



// ------------------------
// Page Switcher
// ------------------------
function showPage(id) {
  document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
  const target = document.getElementById(id);
  if (target) target.style.display = 'block';
}

window.onload = () => {
  showPage('login');
};
