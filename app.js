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
        displayCard(card.name);
      });
      suggestionsList.appendChild(li);
    });
  });

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
        searchInput.value = suggestions[activeSuggestionIndex].textContent;
        suggestionsList.innerHTML = "";
        displayCard(searchInput.value.trim());
      } else {
        displayCard(searchInput.value.trim());
      }
    }

    suggestions.forEach((li, index) => {
      li.style.backgroundColor = index === activeSuggestionIndex ? "#eee" : "";
    });
  });

  searchBtn.addEventListener("click", () => {
    suggestionsList.innerHTML = "";
    displayCard(searchInput.value.trim());
  });

  async function displayCard(cardName) {
    resultsList.innerHTML = "";

    const { data: cards, error } = await supabaseClient
      .from("cards")
      .select(`
        id,
        name,
        card_versions (
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

    if (imageUrl) {
      const li = document.createElement("li");
      li.classList.add("card-item");

      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = card.name;
      img.classList.add("card-image");

      li.appendChild(img);

      // Fetch FAQs
      const { data: faqs, error: faqError } = await supabaseClient
        .rpc('get_card_faqs', { p_card_name: card.name });

      if (faqError) {
        console.error(`FAQ error for ${card.name}:`, faqError);
      } else {
        const faqSection = document.createElement("div");
        faqSection.classList.add("faq-block");

        const faqList = document.createElement("ul");
        faqList.classList.add("faq-list");

        if (faqs && faqs.length > 0) {
          faqs.forEach(faq => {
            const faqItem = document.createElement("li");
            faqItem.innerHTML = `
              <strong>Q:</strong> ${faq.question}<br/>
               <div><span><strong>A:</strong></span> ${faq.answer}</div>
            `;
            faqList.appendChild(faqItem);
          });
          faqSection.appendChild(faqList);
        } else {
          const noFaqMsg = document.createElement("p");
          noFaqMsg.classList.add("no-results");
          noFaqMsg.textContent = "No FAQs available for this card.";
          faqSection.appendChild(noFaqMsg);
        }

        li.appendChild(faqSection);
      }

      resultsList.appendChild(li);
    }
  }
};
