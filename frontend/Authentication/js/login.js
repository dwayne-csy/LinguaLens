document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/v1/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful!");

            // ✅ Check role and redirect
            if (data.user.role === 'admin') {
                window.location.href = "../../Admin/admindashboard.html";
            } else {
                window.location.href = "../../User/html/home.html";
            }
        } else {
            alert(data.message || "Invalid login credentials.");
        }
    } catch (error) {
        console.error("Error connecting to server:", error);
        alert("Error connecting to server.");
    }
});