// ---------- Datos del menú ----------
const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
const MEAL_ORDER = ["breakfast","snack","lunch","dinner"];
const MEAL_LABEL = {breakfast:"Desayuno", snack:"Media mañana", lunch:"Comida", dinner:"Cena"};

const MENU = {
  Lunes: {
    breakfast: {title:"Tostada integral con aguacate y huevo poché", time:"10 min", note:"Más una pieza de fruta.", tags:["huevo"]},
    snack: {title:"Yogur natural con nueces", time:"2 min", note:"", tags:[]},
    lunch: {title:"Lentejas estofadas con zanahoria, calabacín y pimiento", time:"10 min", note:"Preparadas el domingo, solo calentar.", tags:["legumbre"]},
    dinner: {title:"Salmón al horno con patata cocida y ensalada verde", time:"25 min", note:"", tags:["pescado"]}
  },
  Martes: {
    breakfast: {title:"Porridge de avena con plátano y canela", time:"10 min", note:"", tags:[]},
    snack: {title:"Fruta con un puñado de almendras", time:"2 min", note:"", tags:[]},
    lunch: {title:"Pollo a la plancha con arroz integral y verduras salteadas", time:"25 min", note:"Calabacín, pimiento y zanahoria. Usa el arroz precocido.", tags:[]},
    dinner: {title:"Tortilla de patata y cebolla con ensalada de tomate", time:"25 min", note:"", tags:["huevo"]}
  },
  Miércoles: {
    breakfast: {title:"Tostada con tomate, aceite de oliva y jamón", time:"10 min", note:"", tags:[]},
    snack: {title:"Yogur con fruta troceada", time:"2 min", note:"", tags:[]},
    lunch: {title:"Garbanzos con espinacas y huevo duro", time:"10 min", note:"Preparados el domingo.", tags:["legumbre","huevo"]},
    dinner: {title:"Merluza al horno con puré de patata y judías verdes", time:"25 min", note:"", tags:["pescado"]}
  },
  Jueves: {
    breakfast: {title:"Batido de plátano, avena, leche y cacao puro", time:"5 min", note:"", tags:[]},
    snack: {title:"Una pieza de fruta", time:"1 min", note:"", tags:[]},
    lunch: {title:"Pasta integral con boloñesa de pavo y verduras", time:"15 min", note:"Salsa preparada el domingo.", tags:[]},
    dinner: {title:"Ensalada completa: atún, huevo duro, tomate, maíz y patata", time:"15 min", note:"", tags:["pescado","huevo"]}
  },
  Viernes: {
    breakfast: {title:"Tostada con queso fresco batido y pavo", time:"10 min", note:"", tags:[]},
    snack: {title:"Fruta con frutos secos", time:"2 min", note:"", tags:[]},
    lunch: {title:"Arroz con pollo, cebolla, pimiento y guisantes", time:"30 min", note:"Estilo \"una sola olla\".", tags:[]},
    dinner: {title:"Revuelto de champiñones y espinacas con huevo y pan tostado", time:"15 min", note:"Cierre ligero de semana.", tags:["huevo"]}
  }
};

// ---------- Estado ----------
let activeDay = "Lunes";
let showSnack = true;
let viewMode = "day";

// ---------- Utilidades ----------
function weekCounts(){
  let legumbre = 0, pescado = 0;
  DAYS.forEach(d=>{
    MEAL_ORDER.forEach(m=>{
      const meal = MENU[d][m];
      if(meal.tags.includes("legumbre")) legumbre++;
      if(meal.tags.includes("pescado")) pescado++;
    });
  });
  return {legumbre, pescado};
}

function tilt(i){
  const vals = [-0.6, 0.5, -0.4, 0.7, -0.3];
  return vals[i % vals.length] + "deg";
}

function tagMarkup(tags){
  if(!tags.length) return "";
  const labels = {legumbre:"🫘 legumbre", pescado:"🐟 pescado", huevo:"🥚 huevo"};
  return `<div class="tags">${tags.map(t=>`<span class="tag ${t}">${labels[t]}</span>`).join("")}</div>`;
}

// ---------- Renderizado: piezas comunes ----------
function renderSummary(){
  const {legumbre, pescado} = weekCounts();
  document.getElementById("summary").innerHTML = `
    <span class="pill ${legumbre>=1?'ok':''}"><span class="dot"></span>🫘 legumbre × ${legumbre} esta semana</span>
    <span class="pill ${pescado>=1?'ok':''}"><span class="dot"></span>🐟 pescado × ${pescado} esta semana</span>
  `;
}

function renderTabs(){
  const el = document.getElementById("tabs");
  el.innerHTML = "";
  DAYS.forEach((d, i)=>{
    const btn = document.createElement("button");
    btn.className = "tab" + (d===activeDay ? " active" : "");
    btn.innerHTML = `<span class="num">0${i+1}</span>${d}`;
    btn.onclick = ()=>{ activeDay = d; render(); };
    el.appendChild(btn);
  });
}

function renderViewSwitch(){
  document.querySelectorAll(".view-btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.view === viewMode);
  });
  document.getElementById("tabs").style.display = viewMode === "week" ? "none" : "flex";
}

// ---------- Renderizado: vistas ----------
function renderDayView(){
  const main = document.getElementById("mainArea");
  main.innerHTML = `<div class="grid" id="grid"></div>`;
  const el = document.getElementById("grid");
  const mealsToShow = MEAL_ORDER.filter(m => showSnack || m !== "snack");
  mealsToShow.forEach((m, i)=>{
    const meal = MENU[activeDay][m];
    const card = document.createElement("div");
    card.className = "card";
    card.style.setProperty("--tilt", tilt(i));
    card.innerHTML = `
      <div class="card-head">
        <span class="meal-label">${MEAL_LABEL[m]}</span>
        <span class="time">${meal.time}</span>
      </div>
      <p class="title">${meal.title}</p>
      <p class="note">${meal.note}</p>
      ${tagMarkup(meal.tags)}
    `;
    el.appendChild(card);
  });
}

function renderWeekView(){
  const main = document.getElementById("mainArea");
  const mealsToShow = MEAL_ORDER.filter(m => showSnack || m !== "snack");

  let cells = `<div class="week-corner"></div>`;
  DAYS.forEach(d=>{ cells += `<div class="week-day-head">${d}</div>`; });

  mealsToShow.forEach(m=>{
    cells += `<div class="week-row-label">${MEAL_LABEL[m]}</div>`;
    DAYS.forEach(d=>{
      const meal = MENU[d][m];
      cells += `
        <div class="week-cell">
          <span class="time">${meal.time}</span>
          <p class="title">${meal.title}</p>
          ${tagMarkup(meal.tags)}
        </div>`;
    });
  });

  main.innerHTML = `<div class="week-scroll"><div class="week-grid">${cells}</div></div>`;
}

function renderMain(){
  if(viewMode === "week"){ renderWeekView(); }
  else{ renderDayView(); }
}

function render(){
  renderSummary();
  renderTabs();
  renderViewSwitch();
  renderMain();
}

// ---------- Eventos ----------
document.getElementById("snackToggle").addEventListener("change", (e)=>{
  showSnack = e.target.checked;
  renderMain();
});

document.getElementById("viewSwitch").addEventListener("click", (e)=>{
  const btn = e.target.closest(".view-btn");
  if(!btn) return;
  viewMode = btn.dataset.view;
  render();
});

render();
