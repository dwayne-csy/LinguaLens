document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId"); 
    const tableBody = document.getElementById("ttsHistoryTableBody");
    const noHistoryMessage = document.getElementById("noHistoryMessage");

    if (!userId) {
        alert("User not logged in. Cannot fetch history.");
        return;
    }

    fetch(`http://localhost:3000/api/tts-history/${userId}`)
        .then(response => response.json())
        .then(data => {
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
                engineCell.textContent = item.engine_used || "standard";

                const dateCell = document.createElement("td");
                dateCell.textContent = item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "N/A";

                // ✅ Replay button
                const replayCell = document.createElement("td");
                const replayBtn = document.createElement("button");
                replayBtn.textContent = "🔊 Replay";
                replayBtn.style.cursor = "pointer";
                replayBtn.style.padding = "6px 12px";
                replayBtn.style.border = "none";
                replayBtn.style.borderRadius = "6px";
                replayBtn.style.backgroundColor = "#4299e1";
                replayBtn.style.color = "white";
                replayBtn.style.fontWeight = "500";
                replayBtn.onclick = () => {
                    if (!item.text_content) return;

                    // Use the same engine as stored
                    const engine = item.engine_used || "standard";

                    puter.ai.txt2speech(item.text_content, { engine })
                        .then(audio => audio.play())
                        .catch(err => {
                            console.error("Replay failed:", err);
                            alert("Failed to replay this text.");
                        });
                };
                replayCell.appendChild(replayBtn);

                row.appendChild(textCell);
                row.appendChild(engineCell);
                row.appendChild(dateCell);
                row.appendChild(replayCell);

                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error fetching TTS history:", err);
            alert("Failed to load history.");
        });
});
