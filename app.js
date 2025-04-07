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
      .select(`
        id,
        name,
        stack_cost,
        card_versions (
          version_id,
          card_art (
            image_url
          )
        )
      `)
      .ilike("name", `%${query}%`);

    if (error) {
      resultsList.innerHTML = `<li class="error-msg">Error: ${error.message}</li>`;
      return;
    }

    if (!cards || cards.length === 0) {
      resultsList.innerHTML = `<li class="no-results">No results found</li>`;
      return;
    }

    cards.forEach(card => {
      const li = document.createElement("li");
      li.classList.add("card-item");
    
      const version = card.card_versions?.[0];
      const imageUrl = version?.card_art?.[0]?.image_url;
    
      if (imageUrl) {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = card.name;
        img.classList.add("card-image");
        li.appendChild(img);
        resultsList.appendChild(li);
      }
    });

    
  }
};
