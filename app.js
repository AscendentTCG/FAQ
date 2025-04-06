const { createClient } = supabase;

const SUPABASE_URL = "https://iwwkdrqwdniigeeogwie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3d2tkcnF3ZG5paWdlZW9nd2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDUzODMsImV4cCI6MjA1NjA4MTM4M30.K_cPRK6eksBxUFR5lqclNByn7Ia2IEoq7w46HPaxwPg";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultsList = document.getElementById("results");

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchCards();
    }
  });

  searchBtn.addEventListener("click", () => {
    searchCards();
  });

  async function searchCards() {
    const query = searchInput.value.trim();
    resultsList.innerHTML = "";

    if (!query) return;

    const { data: cards, error } = await supabaseClient
      .from("cards")
      .select("*")
      .ilike("name", `%${query}%`);

    if (error) {
      resultsList.innerHTML = `<li>Error: ${error.message}</li>`;
      return;
    }

    if (!cards || cards.length === 0) {
      resultsList.innerHTML = `<li>No results found</li>`;
      return;
    }

    // Loop through each matching card
    cards.forEach(async card => {
      const li = document.createElement("li");

      // Add basic info
      li.innerHTML = `<strong>${card.name}</strong> – Stack Cost: ${card.stack_cost}`;

      // Fetch version details (for image, etc.)
      const { data: versions, error: versionError } = await supabaseClient
        .rpc('get_card_versions', { card_name: card.name });

      if (versionError) {
        console.error(`Error getting version for ${card.name}:`, versionError);
      } else if (versions && versions.length > 0) {
        const firstVersion = versions[0];
        const imageUrl = firstVersion.artworks?.[0];

        if (imageUrl) {
          const img = document.createElement("img");
          img.src = imageUrl;
          img.alt = card.name;
          img.style = "max-width: 100%; margin-top: 8px; border-radius: 6px;";
          li.appendChild(img);
        }
      }

      resultsList.appendChild(li);
    });
  }
};
