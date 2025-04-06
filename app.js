const { createClient } = supabase;

const SUPABASE_URL = "https://iwwkdrqwdniigeeogwie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3d2tkcnF3ZG5paWdlZW9nd2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDUzODMsImV4cCI6MjA1NjA4MTM4M30.K_cPRK6eksBxUFR5lqclNByn7Ia2IEoq7w46HPaxwPg";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM elements
const searchInput = document.getElementById("searchInput");
const resultsList = document.getElementById("results");

searchInput.addEventListener("input", async () => {
  const query = searchInput.value;

  if (!query) {
    resultsList.innerHTML = "";
    return;
  }

  const { data, error } = await supabaseClient
    .from("cards")
    .select("*")
    .ilike("name", `%${query}%`);

  resultsList.innerHTML = "";

  if (error) {
    resultsList.innerHTML = `<li>Error: ${error.message}</li>`;
    return;
  }

  if (data.length === 0) {
    resultsList.innerHTML = `<li>No results found</li>`;
    return;
  }

  data.forEach(card => {
    const li = document.createElement("li");
    li.textContent = `${card.name} - Stack Cost: ${card.stack_cost}`;
    resultsList.appendChild(li);
  });
});
