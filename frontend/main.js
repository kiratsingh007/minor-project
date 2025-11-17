document.addEventListener("DOMContentLoaded", async () => {
  const currentPage = window.location.pathname;

  // ✅ NOTICE PAGE
  if (currentPage.includes("notice.html")) {
    const noticeList = document.getElementById("noticeList");
    const addForm = document.getElementById("addNoticeForm");

    // Load notices
    async function loadNotices() {
      const res = await fetch("http://localhost:5000/notices");
      const data = await res.json();
      noticeList.innerHTML = data
        .map(n => `
          <div class="notice-item">
            <h3>${n.title}</h3>
            <p>${n.message}</p>
            <small>${new Date(n.date).toLocaleString()}</small>
          </div>`)
        .join("");
    }

    // Add new notice (for admin/teacher)
    if (addForm) {
      addForm.addEventListener("submit", async e => {
        e.preventDefault();
        const title = document.getElementById("noticeTitle").value;
        const message = document.getElementById("noticeMessage").value;

        const res = await fetch("http://localhost:5000/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, message })
        });

        const result = await res.json();
        alert(result.message);
        addForm.reset();
        loadNotices();
      });
    }

    loadNotices();
  }

  // ✅ NOTES PAGE
 const uploadForm = document.getElementById("uploadForm");
const notesList = document.getElementById("notesList");
const messageDiv = document.getElementById("message");

const backendURL = "http://localhost:5000"; // your backend

// Handle upload
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("noteFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${backendURL}/uploadNote`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      messageDiv.textContent = data.message;
      fileInput.value = "";
      loadNotes(); // refresh list
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    alert("Upload failed: " + err.message);
  }
});

// Load notes
async function loadNotes() {
  try {
    const res = await fetch(`${backendURL}/getNotes`);
    const notes = await res.json();

    notesList.innerHTML = "";
    notes.forEach((note) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${backendURL}${note.filepath}" target="_blank">${note.filename}</a>`;
      notesList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading notes:", err);
  }
}

// Fetch notes on page load
loadNotes();

});
const backendURL = "http://localhost:5000"; // backend running server

const studentNotesList = document.getElementById("studentNotesList");

// Load notes
async function loadNotes() {
  try {
    const res = await fetch(`${backendURL}/getNotes`);
    const notes = await res.json();

    studentNotesList.innerHTML = "";

    if (notes.length === 0) {
      studentNotesList.innerHTML = "<li>No notes available yet.</li>";
      return;
    }

    notes.forEach((note) => {
      const li = document.createElement("li");
      li.innerHTML = `
        📄 <a href="${backendURL}${note.filepath}" target="_blank">
          ${note.filename}
        </a>
      `;
      studentNotesList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading notes:", err);
  }
}

// Load when page opens
loadNotes();

