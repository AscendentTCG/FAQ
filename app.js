const { createClient } = supabase;

const SUPABASE_URL = "https://iwwkdrqwdniigeeogwie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3d2tkcnF3ZG5paWdlZW9nd2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDUzODMsImV4cCI6MjA1NjA4MTM4M30.K_cPRK6eksBxUFR5lqclNByn7Ia2IEoq7w46HPaxwPg";

const { createClient } = supabase;

const SUPABASE_URL = "https://iwwkdrqwdniigeeogwie.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_KEY"; // Replace with your actual key

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

  // Keyboard navigation for suggestions
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
        const selectedName = suggestions[activeSuggestionIndex].textContent;
        searchInput.value = selectedName;
        suggestionsList.innerHTML = "";
        searchCards(selectedName);
      } else {
        searchCards(searchInput.value.trim());
      }
    }

    suggestions.forEach((li, index) => {
      li.style.backgroundColor = index === activeSuggestionIndex ? "#eee" : "";
    });
  });

  searchBtn.addEventListener("click", () => {
    suggestionsList.innerHTML = "";
    searchCards(searchInput.value.trim());
  });

  // Main card search/display logic
  async function searchCards(cardName) {
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

    // Toggle buttons
    const toggleWrapper = document.createElement("div");
    toggleWrapper.classList.add("toggle-wrapper");

    const faqBtn = document.createElement("button");
    faqBtn.textContent = "FAQ";
    faqBtn.classList.add("toggle-btn", "active");

    const mechBtn = document.createElement("button");
    mechBtn.textContent = "Mechanics";
    mechBtn.classList.add("toggle-btn");

    const infoBtn = document.createElement("button");
    infoBtn.textContent = "Card Information";
    infoBtn.classList.add("toggle-btn");

    toggleWrapper.appendChild(faqBtn);
    toggleWrapper.appendChild(mechBtn);
    toggleWrapper.appendChild(infoBtn);
    li.appendChild(toggleWrapper);

    // FAQ section
    const { data: faqs, error: faqError } = await supabaseClient
      .rpc("get_card_faqs", { p_card_name: card.name });

    const faqSection = document.createElement("ul");
    faqSection.classList.add("faq-list");

    if (faqError) {
      console.error(`FAQ error for ${card.name}:`, faqError);
    } else if (faqs && faqs.length > 0) {
      faqs.forEach(faq => {
        const faqItem = document.createElement("li");
        faqItem.innerHTML = `
          <strong>Q:</strong> ${faq.question}<br/>
          <strong>A:</strong> ${faq.answer}
        `;
        faqSection.appendChild(faqItem);
      });
    } else {
      const noFaq = document.createElement("li");
      noFaq.textContent = "No FAQ available.";
      faqSection.appendChild(noFaq);
    }

    li.appendChild(faqSection);

    // Mechanics section (placeholder)
    const mechSection = document.createElement("div");
    mechSection.classList.add("mechanics-section");
    mechSection.textContent = "Mechanics info coming soon.";
    mechSection.style.display = "none";
    li.appendChild(mechSection);

    // Card Information section
    const infoSection = document.createElement("div");
    infoSection.classList.add("mechanics-section");
    infoSection.innerHTML = `
      <strong>Card Text:</strong><br/>
      ${card.card_effects || "No text available."}
    `;
    infoSection.style.display = "none";
    li.appendChild(infoSection);

    // Toggle logic
    faqBtn.addEventListener("click", () => {
      faqBtn.classList.add("active");
      mechBtn.classList.remove("active");
      infoBtn.classList.remove("active");

      faqSection.style.display = "block";
      mechSection.style.display = "none";
      infoSection.style.display = "none";
    });

    mechBtn.addEventListener("click", () => {
      mechBtn.classList.add("active");
      faqBtn.classList.remove("active");
      infoBtn.classList.remove("active");

      faqSection.style.display = "none";
      mechSection.style.display = "block";
      infoSection.style.display = "none";
    });

    infoBtn.addEventListener("click", () => {
      infoBtn.classList.add("active");
      faqBtn.classList.remove("active");
      mechBtn.classList.remove("active");

      faqSection.style.display = "none";
      mechSection.style.display = "none";
      infoSection.style.display = "block";
    });

    resultsList.appendChild(li);
  }
};
