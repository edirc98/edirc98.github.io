// ---------- Configuración compartida ----------
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const MEAL_ORDER = ["breakfast", "snack", "lunch", "dinner"];
const MEAL_LABEL = { breakfast: "Desayuno", snack: "Media mañana", lunch: "Comida", dinner: "Cena" };

const DATA_FILES = {
  breakfast: "data/breakfasts.json",
  snack: "data/snacks.json",
  lunch: "data/lunches.json",
  dinner: "data/dinners.json"
};

const TAGS_FILE = "data/tags.json";

// Mapa id -> {id, label, color}, disponible globalmente una vez cargado.
let TAGS = {};

async function loadTags() {
  const response = await fetch(TAGS_FILE);
  if (!response.ok) throw new Error(`No se pudo cargar ${TAGS_FILE}`);
  const list = await response.json();
  return Object.fromEntries(list.map((tag) => [tag.id, tag]));
}

// ---------- Carga de datos ----------
async function loadDishPools() {
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([mealType, path]) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
      const dishes = await response.json();
      return [mealType, dishes];
    })
  );
  return Object.fromEntries(entries);
}

// ---------- Utilidades de selección ----------
function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Coge `count` platos sin repetir si el pool es suficientemente grande;
// si el pool es más pequeño, reparte con el mínimo de repetición posible.
function pickWithoutRepeats(pool, count) {
  const shuffled = shuffle(pool);
  if (shuffled.length >= count) return shuffled.slice(0, count);
  const result = [];
  for (let i = 0; i < count; i++) result.push(shuffled[i % shuffled.length]);
  return result;
}

// Si ningún día de la semana tiene el tag pedido en las comidas principales,
// sustituye una comida al azar por un plato del pool que sí lo tenga.
function ensureTagCoverage(weekMenu, mealKeys, pools, tag) {
  const alreadyCovered = DAYS.some((day) =>
    mealKeys.some((meal) => weekMenu[day][meal].tags.includes(tag))
  );
  if (alreadyCovered) return;

  for (const mealKey of mealKeys) {
    const candidate = pools[mealKey].find((dish) => dish.tags.includes(tag));
    if (candidate) {
      const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
      weekMenu[randomDay][mealKey] = candidate;
      return;
    }
  }
}

// ---------- Generación del menú semanal ----------
function generateWeekMenu(pools) {
  const picksByMeal = {};
  MEAL_ORDER.forEach((mealKey) => {
    picksByMeal[mealKey] = pickWithoutRepeats(pools[mealKey], DAYS.length);
  });

  const weekMenu = {};
  DAYS.forEach((day, i) => {
    weekMenu[day] = {};
    MEAL_ORDER.forEach((mealKey) => {
      weekMenu[day][mealKey] = picksByMeal[mealKey][i];
    });
  });

  ensureTagCoverage(weekMenu, ["lunch", "dinner"], pools, "legumbre");
  ensureTagCoverage(weekMenu, ["lunch", "dinner"], pools, "pescado");

  return weekMenu;
}

async function buildWeeklyMenu() {
  const [pools, tags] = await Promise.all([loadDishPools(), loadTags()]);
  TAGS = tags;
  return generateWeekMenu(pools);
}
