const { createClient } = supabase;

const SUPABASE_URL = "https://iwwkdrqwdniigeeogwie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3d2tkcnF3ZG5paWdlZW9nd2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDUzODMsImV4cCI6MjA1NjA4MTM4M30.K_cPRK6eksBxUFR5lqclNByn7Ia2IEoq7w46HPaxwPg";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultsList = document.getElementById("results");
  const suggestionsList = document.getElementById("suggestions");

  let activeSuggestionIndex = -1;
  let currentSuggestions = [];

  // Autocomplete suggestions
  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    suggestionsList.innerHTML = "";
    currentSuggestions = [];

    if (!query) return;

    const { data: cards, error } = await supabaseClient
      .from("cards")
      .select("name")
      .ilike("name", `%${query}%`)
      .limit(5);

    if (error || !cards) return;

    currentSuggestions = cards;

    cards.forEach(card => {
      const li = document.createElement("li");
      li.textContent = card.name;
      li.addEventListener("click", () => {
        searchInput.value = card.name;
        suggestionsList.innerHTML = "";
        searchCards(card.name);
      });
      suggestionsList.appendChild(li);
    });
  });

  // Keyboard navigation
  searchInput.addEventListener("keydown", (e) => {
    const suggestions = suggestionsList.querySelectorAll("li");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        const selected = suggestions[activeSuggestionIndex].textContent;
        searchInput.value = selected;
        suggestionsList.innerHTML = "";
        searchCards(selected);
      } else {
        searchCards(searchInput.value.trim());
      }
    }

    suggestions.forEach((li, index) => {
      li.classList.toggle("active", index === activeSuggestionIndex);
    });
  });

  searchBtn.addEventListener("click", () => {
    suggestionsList.innerHTML = "";
    searchCards(searchInput.value.trim());
  });

  async function searchCards(cardName) {
    if (!cardName) return;

    // Update URL
    const encoded = encodeURIComponent(cardName);
    const newUrl = `${window.location.pathname}?card=${encoded}`;
    history.replaceState(null, "", newUrl);

    displayCard(cardName);
  }

  // Display card info
  async function displayCard(cardName) {
    resultsList.innerHTML = "";

    const { data: cards, error } = await supabaseClient
      .from("cards")
      .select(`
        id,
        name,
        card_effects,
        card_versions (
          version_id,
          card_art (
            image_url
          )
        )
      `)
      .eq("name", cardName)
      .limit(1);

    if (error || !cards || cards.length === 0) {
      resultsList.innerHTML = `<li class="no-results">No results found</li>`;
      return;
    }

    const card = cards[0];
    const version = card.card_versions?.[0];
    const imageUrl = version?.card_art?.[0]?.image_url;

    const li = document.createElement("li");
    li.classList.add("card-item");

    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = card.name;
      img.classList.add("card-image");
      li.appendChild(img);
    }

    const info = document.createElement("div");
    info.classList.add("mechanics-section");
    info.innerHTML = `
      <strong>Card Text:</strong><br/>
      ${card.card_effects || "No text available."}
    `;
    li.appendChild(info);

    resultsList.appendChild(li);
  }

  // Trigger card display on page load if URL has ?card=
  const urlParams = new URLSearchParams(window.location.search);
  const cardParam = urlParams.get("card");
  if (cardParam) {
    const decoded = decodeURIComponent(cardParam);
    searchInput.value = decoded;
    searchCards(decoded);
  }
};
