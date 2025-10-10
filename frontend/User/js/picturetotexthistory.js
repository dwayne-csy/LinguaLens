let currentPage = 1;
const rowsPerPage = 5; // show only 5 per page
let allData = [];

// Function to render table with pagination
function renderTable(page) {
  const table = document.getElementById("historyTable");
  table.innerHTML = "";

  if (!allData.length) {
    table.innerHTML = `<tr><td colspan="4">No history found</td></tr>`;
    return;
  }

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = allData.slice(start, end);

  paginatedData.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.filename}</td>
      <td><pre>${row.text_content}</pre></td>
      <td>${row.created_at ? new Date(row.created_at).toLocaleString() : "N/A"}</td>
    `;
    table.appendChild(tr);
  });

  // Update pagination info
  document.getElementById("pageInfo").textContent =
    `Page ${page} of ${Math.ceil(allData.length / rowsPerPage)}`;

  // Enable/disable buttons
  document.getElementById("prevPage").disabled = page === 1;
  document.getElementById("nextPage").disabled = end >= allData.length;
}

async function loadHistory() {
  try {
    const res = await fetch("http://localhost:3000/api/picturetotexthistory");
    allData = await res.json();
    renderTable(currentPage);
  } catch (err) {
    console.error("Error loading history:", err);
    document.getElementById("historyTable").innerHTML =
      `<tr><td colspan="4">Error loading history</td></tr>`;
  }
}

// Pagination buttons
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable(currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < Math.ceil(allData.length / rowsPerPage)) {
    currentPage++;
    renderTable(currentPage);
  }
});

// Initial load
loadHistory();
