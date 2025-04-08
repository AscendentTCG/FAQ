const { createClient } = supabase;

const SUPABASE_URL = "https://iwwkdrqwdniigeeogwie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3d2tkcnF3ZG5paWdlZW9nd2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDUzODMsImV4cCI6MjA1NjA4MTM4M30.K_cPRK6eksBxUFR5lqclNByn7Ia2IEoq7w46HPaxwPg";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultsList = document.getElementById("results");

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchCards();
  });

  searchBtn.addEventListener("click", () => searchCards());

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

    for (const card of cards) {
      const li = document.createElement("li");
      li.classList.add("card-item");

      // Show image
      const version = card.card_versions?.[0];
      const imageUrl = version?.card_art?.[0]?.image_url;

      if (imageUrl) {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = card.name;
        img.classList.add("card-image");
        li.appendChild(img);
      }

      // Create toggle buttons
      const toggleWrapper = document.createElement("div");
      toggleWrapper.classList.add("toggle-wrapper");

      const faqBtn = document.createElement("button");
      faqBtn.textContent = "FAQ";
      faqBtn.classList.add("toggle-btn", "active");

      const mechBtn = document.createElement("button");
      mechBtn.textContent = "Mechanics";
      mechBtn.classList.add("toggle-btn");

      toggleWrapper.appendChild(faqBtn);
      toggleWrapper.appendChild(mechBtn);
      li.appendChild(toggleWrapper);

      // Fetch FAQs
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
        const empty = document.createElement("li");
        empty.textContent = "No FAQ available.";
        faqSection.appendChild(empty);
      }

      li.appendChild(faqSection);

      // Mechanics placeholder
      const mechSection = document.createElement("div");
      mechSection.classList.add("mechanics-section");
      mechSection.textContent = "Mechanics info coming soon.";
      mechSection.style.display = "none";
      li.appendChild(mechSection);

      // Toggle functionality
      faqBtn.addEventListener("click", () => {
        faqBtn.classList.add("active");
        mechBtn.classList.remove("active");
        faqSection.style.display = "block";
        mechSection.style.display = "none";
      });

      mechBtn.addEventListener("click", () => {
        mechBtn.classList.add("active");
        faqBtn.classList.remove("active");
        faqSection.style.display = "none";
        mechSection.style.display = "block";
      });

      resultsList.appendChild(li);
    }
  }
};
