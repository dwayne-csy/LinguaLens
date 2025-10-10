document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch profile
    fetch('http://localhost:3000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    })
    .then(data => {
        if (data.user) {
            document.getElementById('name').value = data.user.name || '';
            document.getElementById('email').value = data.user.email || '';
            document.getElementById('email').readOnly = true;
            document.getElementById('contact_number').value = data.user.contact_number || '';
            document.getElementById('address').value = data.user.address || '';
            if (data.user.profile_photo) {
                const photo = document.getElementById('profilePhotoPreview');
                photo.src = data.user.profile_photo;
                photo.style.display = 'block';
            }
        }
    })
    .catch(() => {
        alert('Session expired or unauthorized. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Update profile (only require contact_number and address)
    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const contact_number = document.getElementById('contact_number').value;
        const address = document.getElementById('address').value;

        // Require contact_number and address if empty
        if (!contact_number.trim() || !address.trim()) {
            alert('Contact Number and Address are required.');
            return;
        }

        fetch('http://localhost:3000/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, contact_number, address })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
        });
    });

    // Upload profile photo
    document.getElementById('photoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('profile_photo_file');
        if (!fileInput.files.length) return alert('Please select a file.');

        const formData = new FormData();
        formData.append('profile_photo', fileInput.files[0]);

        fetch('http://localhost:3000/api/profile/upload-photo', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.profile_photo) {
                const photo = document.getElementById('profilePhotoPreview');
                photo.src = data.profile_photo;
                photo.style.display = 'block';
            }
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
});