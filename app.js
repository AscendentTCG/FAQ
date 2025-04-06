const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_KEY = "your-anon-key";

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
