document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId"); // ✅ Correct key
    const tableBody = document.getElementById("ttsHistoryTableBody");
    const noHistoryMessage = document.getElementById("noHistoryMessage");

    if (!userId) {
        alert("User not logged in. Cannot fetch history.");
        return;
    }

    // ✅ Fetch user's TTS history
    fetch(`http://localhost:3000/api/tts-history/${userId}`)
        .then(response => response.json())
        .then(data => {
            // ✅ Handle both array or wrapped object
            const history = Array.isArray(data) ? data : data.history;

            if (!history || history.length === 0) {
                noHistoryMessage.style.display = "block";
                return;
            }

            history.forEach(item => {
                const row = document.createElement("tr");

                const textCell = document.createElement("td");
                textCell.textContent = item.text_content || "N/A";

                const engineCell = document.createElement("td");
                engineCell.textContent = item.engine_used || "N/A";

                const dateCell = document.createElement("td");
                dateCell.textContent = item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "N/A";

                row.appendChild(textCell);
                row.appendChild(engineCell);
                row.appendChild(dateCell);

                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error fetching TTS history:", err);
            alert("Failed to load history.");
        });
});
