fetch('http://localhost:3000/api/v1/admin/dashboard')
    .then(response => response.json())
    .then(data => {
        document.getElementById('dashboard-title').textContent = data.message;
    })
    .catch(error => {
        console.error("Error fetching admin dashboard:", error);
        document.getElementById('dashboard-title').textContent = "Failed to load admin dashboard.";
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
    // Redirect to login page
    window.location.href = "../Authentication/html/login.html";
});