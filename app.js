const SUPABASE_URL = "https://iwwkdrqwdniigeeogwie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3d2tkcnF3ZG5paWdlZW9nd2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDUzODMsImV4cCI6MjA1NjA4MTM4M30.K_cPRK6eksBxUFR5lqclNByn7Ia2IEoq7w46HPaxwPg";

async function searchCards() {
  const query = document.getElementById("searchInput").value;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/cards?name=ilike.*${query}*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await response.json();
  displayResults(data);
}

function displayResults(cards) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  cards.forEach(card => {
    const li = document.createElement("li");
    li.textContent = `${card.name} – ${card.rulings || "No rulings available"}`;
    results.appendChild(li);
  });
}

document.getElementById("searchInput").addEventListener("input", searchCards);
