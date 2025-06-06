window.onload = () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultsList = document.getElementById("results");
  const suggestionsList = document.getElementById("suggestions");

  let activeSuggestionIndex = -1;
  let currentSuggestions = [];

  const supabaseClient = window.supabaseClient;

  // Autocomplete
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

    if (error) return;

    currentSuggestions = cards || [];

    currentSuggestions.forEach(card => {
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

  // Arrow nav + Enter
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

    suggestions.forEach((li, i) => {
      li.classList.toggle("active", i === activeSuggestionIndex);
    });
  });

  searchBtn.addEventListener("click", () => {
    suggestionsList.innerHTML = "";
    searchCards(searchInput.value.trim());
  });

  // Global function
  window.searchCards = async (cardName) => {
    if (!cardName) return;

    const encoded = encodeURIComponent(cardName);
    const newUrl = `${window.location.pathname}?card=${encoded}`;
    window.history.replaceState(null, "", newUrl);

    resultsList.innerHTML = "";

    const { data: cards } = await supabaseClient
      .from("cards")
      .select(`
        id, name, card_effects,
        card_versions (
          card_art ( image_url )
        )
      `)
      .eq("name", cardName)
      .limit(1);

    if (!cards || cards.length === 0) {
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

    const toggleWrapper = document.createElement("div");
    toggleWrapper.classList.add("toggle-wrapper");

    const faqBtn = document.createElement("button");
    faqBtn.textContent = "FAQ";
    faqBtn.classList.add("toggle-btn", "active");

    const mechBtn = document.createElement("button");
    mechBtn.textContent = "Mechanics";
    mechBtn.classList.add("toggle-btn");

    const infoBtn = document.createElement("button");
    infoBtn.textContent = "Card Info";
    infoBtn.classList.add("toggle-btn");

    toggleWrapper.appendChild(faqBtn);
    toggleWrapper.appendChild(mechBtn);
    toggleWrapper.appendChild(infoBtn);
    li.appendChild(toggleWrapper);

    // FAQ
    const { data: faqs } = await supabaseClient.rpc("get_card_faqs", {
      p_card_name: card.name,
    });

    const faqSection = document.createElement("ul");
    faqSection.classList.add("faq-list");

    if (faqs?.length) {
      faqs.forEach(faq => {
        const item = document.createElement("li");
        item.innerHTML = `<strong>Q:</strong> ${faq.question}<br/><strong>A:</strong> ${faq.answer}`;
        faqSection.appendChild(item);
      });
    } else {
      const noFaq = document.createElement("li");
      noFaq.textContent = "No FAQ available.";
      faqSection.appendChild(noFaq);
    }

    li.appendChild(faqSection);

    // Mechanics
    const mechSection = document.createElement("div");
    mechSection.classList.add("mechanics-section");
    mechSection.textContent = "Mechanics info coming soon.";
    mechSection.style.display = "none";
    li.appendChild(mechSection);

    // Card Info
    const infoSection = document.createElement("div");
    infoSection.classList.add("mechanics-section");
    infoSection.innerHTML = `<strong>Card Text:</strong><br>${card.card_effects || "No text available."}`;
    infoSection.style.display = "none";
    li.appendChild(infoSection);

    // Toggle behavior
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
  };

  // Load from ?card= param
  const urlParams = new URLSearchParams(window.location.search);
  const cardFromUrl = urlParams.get("card");
  if (cardFromUrl) {
    searchInput.value = decodeURIComponent(cardFromUrl);
    searchCards(decodeURIComponent(cardFromUrl));
  }
};
