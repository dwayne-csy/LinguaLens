// frontend/user/js/home.js

fetch('http://localhost:3000/api/v1/home')
    .then(response => response.json())
    .then(data => {
        document.getElementById('welcome-text').textContent = data.message;
    })
    .catch(err => {
        console.error("Error connecting to server:", err);
        document.getElementById('welcome-text').textContent = "Failed to load home page.";
    });

    // ✅ Logout button logic
document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = "../../Authentication/html/login.html";
});

