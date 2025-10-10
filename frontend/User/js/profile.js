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
                photo.src = 'http://localhost:3000' + data.user.profile_photo;
                photo.style.display = 'block';
            }
        }
    })
    .catch(() => {
        alert('Session expired or unauthorized. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Combined update profile and photo
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const contact_number = document.getElementById('contact_number').value;
        const address = document.getElementById('address').value;
        const fileInput = document.getElementById('profile_photo_file');

        // Require contact_number and address if empty
        if (!contact_number.trim() || !address.trim()) {
            alert('Contact Number and Address are required.');
            return;
        }

        try {
            // First update profile details
            const profileResponse = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, contact_number, address })
            });
            const profileData = await profileResponse.json();

            // Then upload photo if selected
            if (fileInput.files.length > 0) {
                const formData = new FormData();
                formData.append('profile_photo', fileInput.files[0]);

                const photoResponse = await fetch('http://localhost:3000/api/profile/upload-photo', {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const photoData = await photoResponse.json();

                if (photoData.profile_photo) {
                    const photo = document.getElementById('profilePhotoPreview');
                    photo.src = 'http://localhost:3000' + photoData.profile_photo;
                    photo.style.display = 'block';
                }
                alert('Profile and photo updated successfully!');
            } else {
                alert(profileData.message);
            }
        } catch (error) {
            alert('Error updating profile. Please try again.');
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
});
