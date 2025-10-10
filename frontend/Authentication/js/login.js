document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

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
        console.log(data);

        if (response.ok) {
            alert("Login successful!");
            localStorage.setItem('token', data.user.token);
            localStorage.setItem('email', data.user.email);
            localStorage.setItem('userId', data.user.id);

            // Redirect all users to the user home page
            window.location.href = "../../User/html/home.html";
        } else {
            alert(data.message || "Invalid login credentials.");
        }
    } catch (error) {
        console.error("Error connecting to server:", error);
        alert("Error connecting to server.");
    }
});
