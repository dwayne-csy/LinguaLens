document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name || !email || !password) {
        alert("All fields are required.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/v1/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful! Redirecting to login...");
            // ✅ Redirect to login page
            window.location.href = "../html/login.html";
        } else {
            alert(data.message || "Registration failed.");
        }
    } catch (error) {
        console.error("Error connecting to server:", error);
        alert("Error connecting to server.");
    }
});