const form = document.getElementById('uploadForm');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('imageInput');
  if (!fileInput.files.length) return alert('Please select an image.');

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  // Show spinner and loading text
  result.innerHTML = '<span class="spinner"></span>Extracting text...';

  try {
    const response = await fetch('http://localhost:3000/api/picturetotext/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    // Show extracted text or error (spinner disappears)
    if (data.error) result.textContent = `Error: ${data.error}`;
    else result.textContent = data.text;
  } catch (err) {
    result.textContent = `Request failed: ${err}`;
  }
});