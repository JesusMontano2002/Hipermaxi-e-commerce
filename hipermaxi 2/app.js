/**
 * HIPERMAXI - Tienda en línea
 * Archivo: app.js (lógica de la tienda)
 *
 * Orden del archivo:
 *  1-3  Productos, categorías y lista de productos
 *  4-6  Carrito y checkout
 *  7-8  Utilidades, contacto y preguntas frecuentes
 *  9-15 Usuarios, filtros, más vendidos, panel de administrador y pedidos
 *  16-17 Pantalla de acceso e inicio
 *
 * Demo: cliente / cliente123  ·  admin / admin123  ·  código admin: HMX2026
 */

// ==========================================================
// 1. DATOS: CATÁLOGO DE PRODUCTOS
// ==========================================================

let P = [
  ["Manzana Royal Gala", "Frutas y Verduras", 14.9, 18.5, "🍎", "kg"],
  ["Banano", "Frutas y Verduras", 8.5, 0, "🍌", "kg"],
  ["Tomate", "Frutas y Verduras", 9.9, 12, "🍅", "kg"],
  ["Palta", "Frutas y Verduras", 19, 0, "🥑", "kg"],
  ["Lomo de res", "Carnes", 68, 79, "🥩", "kg"],
  ["Pechuga de pollo", "Carnes", 26.5, 0, "🍗", "kg"],
  ["Chorizo parrillero", "Carnes", 42, 0, "🌭", "kg"],
  ["Filete de pescado", "Carnes", 49, 55, "🐟", "kg"],
  ["Leche entera PIL 1L", "Lácteos y Huevos", 8.9, 0, "🥛", "1 L"],
  ["Queso criollo", "Lácteos y Huevos", 38, 45, "🧀", "kg"],
  ["Yogurt natural", "Lácteos y Huevos", 12.5, 0, "🍶", "900 ml"],
  ["Huevos (maple 30)", "Lácteos y Huevos", 39, 42, "🥚", "maple"],
  ["Pan de batalla", "Panadería", 1, 0, "🥖", "unidad"],
  ["Croissant", "Panadería", 4.5, 6, "🥐", "unidad"],
  ["Torta de chocolate", "Panadería", 85, 0, "🎂", "unidad"],
  ["Gaseosa cola 2L", "Bebidas", 13, 16, "🥤", "2 L"],
  ["Jugo de naranja 1L", "Bebidas", 11.5, 0, "🧃", "1 L"],
  ["Agua mineral 2L", "Bebidas", 6, 0, "💧", "2 L"],
  ["Cerveza pack 6", "Bebidas", 64, 72, "🍺", "pack"],
  ["Arroz extra 1 kg", "Abarrotes", 9.5, 0, "🍚", "1 kg"],
  ["Fideo espagueti", "Abarrotes", 6.8, 8, "🍝", "500 g"],
  ["Aceite vegetal 1L", "Abarrotes", 16, 19, "🫒", "1 L"],
  ["Café molido", "Abarrotes", 28, 0, "☕", "250 g"],
  ["Azúcar 1 kg", "Abarrotes", 7.5, 0, "🧂", "1 kg"],
  ["Detergente líquido", "Limpieza y Hogar", 42, 50, "🧴", "2 L"],
  ["Papel higiénico x12", "Limpieza y Hogar", 36, 0, "🧻", "pack"],
  ["Lavavajillas", "Limpieza y Hogar", 14, 16, "🧽", "750 ml"],
  ["Shampoo", "Cuidado Personal", 26, 32, "🧴", "400 ml"],
  ["Pasta dental", "Cuidado Personal", 12, 0, "🪥", "100 g"],
].map((a, i) => ({
  id: i,
  name: a[0],
  cat: a[1],
  price: a[2],
  old: a[3],
  emoji: a[4],
  unit: a[5],
  sold: ((i * 37) % 90) + 10,
}));
// ==========================================================
// 2. CONFIGURACIÓN Y ESTADO GLOBAL (carrito, categoría, búsqueda)
// ==========================================================

const QR = "qr.jpg";
let CATS = ["Todos", "Ofertas", ...new Set(P.map((p) => p.cat))];
let cat = "Todos",
  cart = {},
  qs = "";
try {
  cart = JSON.parse(localStorage.getItem("hmx_cart") || "{}") || {};
} catch (e) {
  cart = {};
}
const $ = (id) => document.getElementById(id),
  bs = (n) => "Bs " + n.toFixed(2);
const save = () => {
// ==========================================================
// 7. UTILIDADES Y GUARDADO DE PRODUCTOS
// ==========================================================

  try {
    localStorage.setItem("hmx_cart", JSON.stringify(cart));
  } catch (e) {}
};
// ==========================================================
// 3. CATEGORÍAS Y LISTA DE PRODUCTOS
// ==========================================================

function setCat(c) {
  cat = c;
  renderCats();
  renderGrid();
  $("prods").scrollIntoView();
}
function renderCats() {
  CATS = ["Todos", "Ofertas", ...new Set(P.filter((p) => !p.hidden).map((p) => p.cat))];
  $("cats").innerHTML =
    '<button class="chip" style="background:var(--bl2);color:#fff;border-color:var(--bl2)" onclick="toggleMenu()">☰ Categorías</button>' +
    CATS.map(
      (c) =>
        `<button class="chip ${c == cat ? "on" : ""}" onclick="setCat('${c}')">${c == "Ofertas" ? "🔥 " : ""}${c}</button>`,
    ).join("");
}
function renderGrid() {
  let l = P.filter(
    (p) =>
      !p.hidden &&
      p.price >= F.min &&
      p.price <= F.max &&
      (!F.offer || p.old) &&
      (!F.top || topIds().includes(p.id)) &&
      (!F.cats.length || F.cats.includes(p.cat)) &&
      (cat == "Todos" || (cat == "Ofertas" ? p.old : p.cat == cat)) &&
      (p.name + p.cat).toLowerCase().includes(qs),
  );
  const s = $("sort").value;
  if (s == 1) l.sort((a, b) => a.price - b.price);
  if (s == 2) l.sort((a, b) => b.price - a.price);
  if (s == 3) l.sort((a, b) => a.name.localeCompare(b.name));
  if (s == 4) l.sort((a, b) => b.sold - a.sold);
  $("ttl").textContent = (cat == "Todos" ? "Todos los productos" : cat) + " (" + l.length + ")";
  $("grid").innerHTML = l.length
    ? l
        .map((p) => {
          const q = cart[p.id] || 0,
            d = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
          return `<div class="card">${d ? `<span class="tag">-${d}%</span>` : ""}<div class="pic">${p.emoji}</div><h4>${p.name}</h4><div class="u">${p.unit} · ${p.cat}</div><div><span class="pr">${bs(p.price)}</span>${p.old ? `<span class="old">${bs(p.old)}</span>` : ""}</div>
 ${q ? `<div class="qty"><button onclick="chg(${p.id},-1)">−</button><b>${q}</b><button onclick="chg(${p.id},1)">+</button></div>` : `<button class="add" onclick="chg(${p.id},1)">Agregar</button>`}</div>`;
        })
        .join("")
    : `<div class="empty">😕 No encontramos productos con esa búsqueda.</div>`;
}
// ==========================================================
// 4. CARRITO DE COMPRAS
// ==========================================================

function chg(id, d) {
  cart[id] = (cart[id] || 0) + d;
  if (cart[id] <= 0) delete cart[id];
  save();
  renderGrid();
  renderCart();
}
function totals() {
  let sub = 0,
    sav = 0,
    n = 0;
  for (const id in cart) {
    const p = P[id],
      q = cart[id];
    sub += p.price * q;
    if (p.old) sav += (p.old - p.price) * q;
    n += q;
  }
  return { sub, sav, n, ship: sub >= 200 || !sub ? 0 : 10 };
}
function renderCart() {
  const t = totals();
  $("cnt").textContent = t.n;
  $("items").innerHTML = t.n
    ? Object.keys(cart)
        .map((id) => {
          const p = P[id],
            q = cart[id];
          return `<div class="it"><div class="e">${p.emoji}</div><div class="n">${p.name}<small>${bs(p.price)} · ${p.unit}</small></div><div class="mini"><button onclick="chg(${id},-1)">−</button><b>${q}</b><button onclick="chg(${id},1)">+</button></div></div>`;
        })
        .join("")
    : `<div class="empty" style="padding:50px 10px">🛒<br>Tu carrito está vacío</div>`;
  $("sub").textContent = bs(t.sub);
  $("sav").textContent = "- " + bs(t.sav);
  $("ship").textContent = t.sub ? (t.ship ? bs(t.ship) : "Gratis") : "-";
  $("tot").textContent = bs(t.sub + t.ship);
  $("checkout").disabled = !t.n;
}
function drawer(o) {
  $("drawer").classList.toggle("on", o);
  $("ov").classList.toggle("on", o);
}
// ==========================================================
// 5. EVENTOS: abrir carrito, buscar y ordenar
// ==========================================================

$("openCart").onclick = () => drawer(true);
$("closeCart").onclick = $("ov").onclick = () => drawer(false);
$("q").oninput = (e) => {
  qs = e.target.value.toLowerCase().trim();
  renderGrid();
};
$("sort").onchange = renderGrid;
// ==========================================================
// 6. CHECKOUT: finalizar compra, pago QR y confirmación
// ==========================================================

$("checkout").onclick = () => {
  drawer(false);
  if (!USER) {
    openLogin("Inicia sesión para finalizar tu compra");
    return;
  }
  $("box").style.width = "";
  const t = totals();
  $("box").innerHTML =
    `<h3>Finalizar compra</h3><form id="f"><label>Nombre completo</label><input type="text" id="nm" required><label>Celular</label><input type="tel" id="tl" required pattern="[0-9 +]{7,}">
 <label>Tipo de entrega</label><div class="opts"><label class="opt"><input type="radio" name="en" value="d" checked> 🚚 Delivery</label><label class="opt"><input type="radio" name="en" value="r"> 🏬 Recojo</label></div>
 <div id="ad"><label>Dirección (Cochabamba)</label><input type="text" id="dr"></div>
 <label>Método de pago</label><div class="opts"><label class="opt"><input type="radio" name="pg" value="QR" checked> 📱 QR</label><label class="opt"><input type="radio" name="pg" value="Tarjeta"> 💳 Tarjeta</label><label class="opt"><input type="radio" name="pg" value="Efectivo"> 💵 Efectivo</label></div>
 <div class="sum" style="margin-top:14px;border-radius:12px"><div class="row t"><span>Total a pagar</span><span id="tp">${bs(t.sub + t.ship)}</span></div></div>
 <button class="go" type="submit">Confirmar pedido</button><button type="button" class="chip" style="width:100%;margin-top:8px" onclick="$('modal').classList.remove('on')">Seguir comprando</button></form>`;
  $("modal").classList.add("on");
  $("nm").value = USER.name;
  const upd = () => {
    const r = document.querySelector("[name=en]:checked").value == "r";
    $("ad").style.display = r ? "none" : "block";
    $("dr").required = !r;
    $("tp").textContent = bs(t.sub + (r ? 0 : t.ship));
  };
  document.querySelectorAll("[name=en]").forEach((e) => (e.onchange = upd));
  upd();
  $("f").onsubmit = (ev) => {
    ev.preventDefault();
    const r = document.querySelector("[name=en]:checked").value == "r",
      pg = document.querySelector("[name=pg]:checked").value,
      tot = t.sub + (r ? 0 : t.ship),
      no = "HMX-" + Math.floor(100000 + Math.random() * 900000),
      nm = $("nm").value.split(" ")[0];
    $("box").innerHTML =
      `<div class="ok"><div class="big">✅</div><h3>¡Gracias, ${nm.replace(/[<>&]/g, "")}!</h3><p>Tu pedido <b>${no}</b> fue registrado.</p><p>${r ? "Recógelo en tu sucursal Hipermaxi en 1 hora." : "Llegará a tu domicilio en menos de 2 horas."}</p><p>Pago: <b>${pg}</b> · Total: <b>${bs(tot)}</b></p>${pg == "QR" ? `<div style="background:var(--bg2);border-radius:14px;padding:12px;margin:10px 0"><p style="margin:0 0 8px"><b>Escanea el QR y paga ${bs(tot)}</b><br><small>Ingresa el monto exacto en tu app bancaria.</small></p><img src="${QR}" alt="QR de pago Banco Ganadero" style="width:100%;max-width:280px;border-radius:12px"></div>` : ""}<div style="text-align:left">${supportHTML()}</div><button class="go" onclick="$('modal').classList.remove('on')">${pg == "QR" ? "Ya realicé el pago" : "Volver a la tienda"}</button></div>`;
    saveOrder(no, tot, pg, r);
    cart = {};
    save();
    renderGrid();
    renderCart();
  };
};
$("modal").onclick = (e) => {
  if (e.target.id == "modal") $("modal").classList.remove("on");
};

try {
  const s = JSON.parse(localStorage.getItem("hmx_p") || "null");
  if (s && s.length) P = s;
} catch (e) {}
const saveP = () => sv("hmx_p", P),
  closeM = () => $("modal").classList.remove("on");
// ==========================================================
// 8. ATENCIÓN AL CLIENTE: contacto, redes y preguntas frecuentes
// ==========================================================

const CT = {
  wa: "https://wa.me/59160716553",
  fb: "https://www.facebook.com/profile.php?id=61595497016392",
  ig: "https://instagram.com/hipermaxi.srl",
  tk: "https://www.tiktok.com/@hipermaxi.srl",
  tel: "tel:+59160716553",
};
const FAQ = [
  [
    "¿Cuánto tarda mi pedido?",
    "El delivery llega en menos de 2 horas y el recojo en tienda está listo en 1 hora.",
  ],
  ["¿Cuál es el costo de envío?", "Bs 10, y es gratis en compras desde Bs 200."],
  [
    "¿Cómo pago con QR?",
    "Escanea el QR con la app de tu banco e ingresa el monto exacto de tu total.",
  ],
  [
    "¿Puedo cambiar o devolver un producto?",
    "Sí, dentro de las 24 horas con tu número de pedido si llegó en mal estado.",
  ],
  [
    "¿Cómo contacto a atención al cliente?",
    "Por WhatsApp, redes sociales o llamada, todos los días de 8:00 a 22:00.",
  ],
];
const faqHTML = (n) =>
  FAQ.slice(0, n || 9)
    .map((f) => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`)
    .join("");
const socHTML = () =>
  `<div class="soc"><a style="background:#25D366" href="${CT.wa}" target="_blank" rel="noopener">💬 WhatsApp</a><a style="background:#1877F2" href="${CT.fb}" target="_blank" rel="noopener">Facebook</a><a style="background:#C13584" href="${CT.ig}" target="_blank" rel="noopener">Instagram</a><a style="background:#111" href="${CT.tk}" target="_blank" rel="noopener">TikTok</a><a style="background:var(--or)" href="${CT.tel}">📞 Llamar</a></div>`;
const supportHTML = () =>
  `<h4 style="color:var(--bl);margin:14px 0 4px">Atención al cliente</h4>${faqHTML(3)}<p style="font-size:13px;margin:8px 0 0">¿Necesitas ayuda con tu pedido? Escríbenos:</p>${socHTML()}`;
// ==========================================================
// 9. USUARIOS Y SESIÓN (cliente / administrador)
// ==========================================================

const USERS = {
  admin: { pass: "admin123", role: "admin", name: "Administrador", email: "admin@hipermaxi.com" },
  cliente: {
    pass: "cliente123",
    role: "user",
    name: "Cliente Demo",
    email: "cliente@hipermaxi.com",
  },
};
let USER = null,
  ORD = [],
  F = { min: 0, max: 1e9, offer: false, top: false, cats: [] };
// ==========================================================
// 16. PANTALLA DE ACCESO: crear cuenta, recuperar contraseña e ingresar
// ==========================================================

try {
  USER = JSON.parse(localStorage.getItem("hmx_user") || "null");
  ORD = JSON.parse(localStorage.getItem("hmx_orders") || "[]") || [];
} catch (e) {}
function sv(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
}
// ==========================================================
// 10. PRODUCTOS MÁS VENDIDOS
// ==========================================================

const topIds = () =>
  P.filter((p) => !p.hidden)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4)
    .map((p) => p.id);
function renderTop() {
  $("top").innerHTML =
    `<h3>🏆 Los más vendidos</h3><div class="topg">` +
    topIds()
      .map((id, i) => {
        const p = P[id],
          q = cart[id] || 0;
        return `<div class="card"><span class="rank">#${i + 1}</span><div class="pic">${p.emoji}</div><h4>${p.name}</h4><div class="u">${p.sold} vendidos</div><div class="pr">${bs(p.price)}</div>${q ? `<div class="qty"><button onclick="chg(${id},-1)">−</button><b>${q}</b><button onclick="chg(${id},1)">+</button></div>` : `<button class="add" onclick="chg(${id},1)">Agregar</button>`}</div>`;
      })
      .join("") +
    "</div>";
}
const _rg = renderGrid;
renderGrid = function () {
  _rg();
  renderTop();
};
// ==========================================================
// 11. FILTROS AVANZADOS
// ==========================================================

const togF = (c) => {
  F.cats = F.cats.includes(c) ? F.cats.filter((x) => x != c) : [...F.cats, c];
  renderGrid();
};
function renderFlt() {
  const cs = [...new Set(P.filter((p) => !p.hidden).map((p) => p.cat))];
  $("flt").innerHTML =
    `<div><b>Rango de precio</b><label>Mínimo (Bs)<input type="number" min="0" value="${F.min || ""}" onchange="F.min=+this.value||0;renderGrid()"></label><label>Máximo (Bs)<input type="number" min="0" value="${F.max < 1e9 ? F.max : ""}" onchange="F.max=+this.value||1e9;renderGrid()"></label></div><div><b>Tipo</b><label><input type="checkbox" ${F.offer ? "checked" : ""} onchange="F.offer=this.checked;renderGrid()"> Solo ofertas</label><label><input type="checkbox" ${F.top ? "checked" : ""} onchange="F.top=this.checked;renderGrid()"> Más vendidos</label></div><div><b>Categorías</b>${cs.map((c) => `<label><input type="checkbox" ${F.cats.includes(c) ? "checked" : ""} onchange="togF('${c}')"> ${c}</label>`).join("")}</div><div><button class="chip" onclick="F={min:0,max:1e9,offer:false,top:false,cats:[]};renderFlt();renderGrid()">Limpiar filtros</button></div>`;
}
// ==========================================================
// 12. MENÚ DESPLEGABLE DE CATEGORÍAS
// ==========================================================

function toggleMenu() {
  const m = $("menu");
  m.classList.toggle("on");
  const v = P.filter((p) => !p.hidden);
  m.innerHTML = CATS.map(
    (c) =>
      `<button onclick="setCat('${c}');toggleMenu()"><span>${c == "Ofertas" ? "🔥 " : ""}${c}</span><span>${c == "Todos" ? v.length : c == "Ofertas" ? v.filter((p) => p.old).length : v.filter((p) => p.cat == c).length}</span></button>`,
  ).join("");
}
// ==========================================================
// 13. CUENTA: login interno, mi cuenta y panel de administrador
// ==========================================================

function updUser() {
  document.body.classList.toggle("locked", !USER);
  if (!USER) {
    $("lu2").value = "";
    $("lp2").value = "";
    $("le2").textContent = "";
  } else scrollTo(0, 0);
// ==========================================================
// 17. INICIALIZACIÓN: arranque de la tienda
// ==========================================================

  $("userBtn").textContent = USER
    ? (USER.role == "admin" ? "🛠️ " : "👤 ") + USER.name.split(" ")[0]
    : "👤 Ingresar";
}
function openLogin(msg) {
  $("box").style.width = "";
  $("box").innerHTML =
    `<h3>Iniciar sesión</h3>${msg ? `<p style="color:var(--or);font-weight:600">${msg}</p>` : ""}<form id="lf"><label>Usuario</label><input type="text" id="lu" required autocomplete="username"><label>Contraseña</label><input type="password" id="lp" required autocomplete="current-password"><p id="le" style="color:#d32f2f;margin:6px 0;font-size:13px"></p><button class="go" type="submit">Entrar</button><p style="font-size:13px;color:var(--mu)">Perfiles de demostración:</p><div class="opts"><button type="button" class="chip" onclick="$('lu').value='cliente';$('lp').value='cliente123'">👤 Cliente</button><button type="button" class="chip" onclick="$('lu').value='admin';$('lp').value='admin123'">🛠️ Administrador</button></div></form>`;
  $("modal").classList.add("on");
  $("lf").onsubmit = (e) => {
    e.preventDefault();
    const k = $("lu").value.trim().toLowerCase(),
      u = USERS[k];
    if (u && u.pass == $("lp").value) {
      USER = { name: u.name, role: u.role, user: k };
      sv("hmx_user", USER);
      updUser();
      closeM();
    } else $("le").textContent = "Usuario o contraseña incorrectos";
  };
}
function openAcc() {
  if (!USER) return openLogin();
  const adm = USER.role == "admin",
    my = (adm ? ORD : ORD.filter((o) => o.user == USER.user)).slice(-8).reverse();
  let top = P.slice().sort((a, b) => b.sold - a.sold)[0];
  $("box").style.width = adm ? "min(760px,100%)" : "";
  $("box").innerHTML =
    `<h3>${adm ? "🛠️ Panel de administración" : "👤 Mi cuenta"}</h3><p>Hola, <b>${USER.name}</b> (${adm ? "Administrador" : "Cliente"})</p>
${
  adm
    ? `<div class="st"><div><b>${ORD.length}</b>Pedidos</div><div><b>${bs(ORD.reduce((s, o) => s + o.tot, 0))}</b>Ventas</div><div><b>${top.emoji} ${top.name}</b>Más vendido</div></div>
<h4>Productos</h4><div class="tw"><table class="t"><tr><th>Producto</th><th>Precio</th><th>Vendidos</th><th></th></tr>${P.filter(
        (p) => !p.hidden,
      )
        .map(
          (p) =>
            `<tr><td>${p.emoji} ${p.name}</td><td><input type="number" step="0.1" min="0" value="${p.price}" style="width:80px" onchange="admPrice(${p.id},this.value)"></td><td>${p.sold}</td><td><button class="chip" onclick="admDel(${p.id})">Quitar</button></td></tr>`,
        )
        .join("")}</table></div>
<h4>Agregar producto</h4><div class="opts"><input type="text" id="an" placeholder="Nombre"><input type="text" id="ac" placeholder="Categoría"><input type="number" id="ap" placeholder="Precio Bs" min="0" step="0.1"><input type="text" id="ae" placeholder="Emoji 🍩"></div><button class="go" onclick="admAdd()">Agregar producto</button>`
    : ""
}
<h4>${adm ? "Últimos pedidos" : "Mis pedidos"}</h4>${my.length ? `<div class="tw"><table class="t"><tr><th>N°</th><th>Fecha</th>${adm ? "<th>Cliente</th>" : ""}<th>Pago</th><th>Total</th></tr>${my.map((o) => `<tr><td>${o.no}</td><td>${o.date}</td>${adm ? `<td>${o.name}</td>` : ""}<td>${o.pg}</td><td>${bs(o.tot)}</td></tr>`).join("")}</table></div>` : `<p style="color:var(--mu)">Aún no hay pedidos.</p>`}
<button class="chip" style="width:100%;margin-top:14px" onclick="USER=null;sv('hmx_user',null);updUser();closeM()">Cerrar sesión</button>`;
  $("modal").classList.add("on");
}
const refresh = () => {
  renderCats();
  renderFlt();
  renderGrid();
  renderCart();
};
// ==========================================================
// 14. ACCIONES DEL ADMINISTRADOR (precios, quitar y agregar productos)
// ==========================================================

function admPrice(i, v) {
  if (+v > 0) {
    P[i].price = +v;
    saveP();
    refresh();
  }
}
function admDel(i) {
  P[i].hidden = true;
  delete cart[i];
  save();
  saveP();
  refresh();
  openAcc();
}
function admAdd() {
  const n = $("an").value.trim(),
    c = $("ac").value.trim(),
    p = +$("ap").value;
  if (!n || !c || !(p > 0)) return;
  P.push({
    id: P.length,
    name: n,
    cat: c,
    price: p,
    old: 0,
    emoji: $("ae").value.trim() || "📦",
    unit: "unidad",
    sold: 0,
  });
  saveP();
  refresh();
  openAcc();
}
// ==========================================================
// 15. REGISTRO DE PEDIDOS
// ==========================================================

function saveOrder(no, tot, pg, r) {
  const items = Object.keys(cart).map((id) => ({ id: +id, q: cart[id] }));
  items.forEach((i) => (P[i.id].sold += i.q));
  ORD.push({
    no,
    date: new Date().toLocaleString("es-BO"),
    user: USER.user,
    name: USER.name,
    pg,
    tot,
    r,
    items,
  });
  sv("hmx_orders", ORD);
  saveP();
}
try {
  Object.assign(USERS, JSON.parse(localStorage.getItem("hmx_users") || "{}"));
} catch (e) {}
const ADMIN_CODE = "HMX2026";
const gv = (id) => {
  ["gl", "gr", "gp"].forEach((x) => ($(x).hidden = x != id));
  $("le2").textContent = "";
};
$("rr").onchange = () => ($("rcw").hidden = $("rr").value != "admin");
$("rf").onsubmit = (e) => {
  e.preventDefault();
  const k = $("ru").value.trim().toLowerCase(),
    role = $("rr").value,
    er = $("re");
  if (USERS[k]) return (er.textContent = "Ese usuario ya existe");
  if (Object.values(USERS).some((u) => u.email == $("rm").value.trim().toLowerCase()))
    return (er.textContent = "Ese correo ya está registrado");
  if ($("rp").value != $("rp2").value) return (er.textContent = "Las contraseñas no coinciden");
  if (role == "admin" && $("rc").value != ADMIN_CODE)
    return (er.textContent = "Código de administrador incorrecto");
  USERS[k] = {
    pass: $("rp").value,
    role,
    name: $("rn").value.trim(),
    email: $("rm").value.trim().toLowerCase(),
  };
  sv("hmx_users", USERS);
  USER = { name: USERS[k].name, role, user: k };
  sv("hmx_user", USER);
  $("rf").reset();
  er.textContent = "";
  gv("gl");
  updUser();
};
let pOk = null;
$("pf").onsubmit = (e) => {
  e.preventDefault();
  const er = $("pe");
  if (!pOk) {
    const k = $("pu").value.trim().toLowerCase(),
      u = USERS[k];
    if (u && u.email == $("pm").value.trim().toLowerCase()) {
      pOk = k;
      $("pnw").hidden = false;
      $("pn").required = $("pn2").required = true;
      $("pb").textContent = "Guardar nueva contraseña";
      er.style.color = "#2e7d32";
      er.textContent = "Datos verificados. Elige tu nueva contraseña.";
    } else {
      er.style.color = "#d32f2f";
      er.textContent = "El usuario y el correo no coinciden con ninguna cuenta";
    }
    return;
  }
  if ($("pn").value != $("pn2").value) {
    er.style.color = "#d32f2f";
    er.textContent = "Las contraseñas no coinciden";
    return;
  }
  USERS[pOk].pass = $("pn").value;
  sv("hmx_users", USERS);
  pOk = null;
  $("pf").reset();
  $("pnw").hidden = true;
  $("pn").required = $("pn2").required = false;
  $("pb").textContent = "Verificar datos";
  er.textContent = "";
  gv("gl");
  $("le2").style.color = "#2e7d32";
  $("le2").textContent = "Contraseña actualizada. Ya puedes ingresar.";
};
$("gf").onsubmit = (e) => {
  e.preventDefault();
  const k = $("lu2").value.trim().toLowerCase(),
    u = USERS[k];
  if (u && u.pass == $("lp2").value) {
    USER = { name: u.name, role: u.role, user: k };
    sv("hmx_user", USER);
    updUser();
  } else {
    $("le2").style.color = "#d32f2f";
    $("le2").textContent = "Usuario o contraseña incorrectos";
  }
};
$("userBtn").onclick = () => (USER ? openAcc() : openLogin());
$("faqb").innerHTML = faqHTML();
$("soc").innerHTML = socHTML();
$("soc2").innerHTML = socHTML();
$("wab").href = CT.wa;
updUser();
renderFlt();
document.addEventListener("click", (e) => {
  if (!e.target.closest("nav")) $("menu").classList.remove("on");
});
renderCats();
renderGrid();
renderCart();
