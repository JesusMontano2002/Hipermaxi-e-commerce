/**
 * HIPERMAXI - Conexión con Dolibarr (DoliCloud)
 * Cárgalo en index.html DESPUÉS de app.js:
 *   <script src="app.js"></script>
 *   <script src="dolibarr.js"></script>
 */

const DOLI = {
  base: "https://hipermaxi.with11.dolicloud.com/api/index.php",
  key: "JesusAPI1234", // ⚠️ visible para cualquiera que abra la web (ver nota)
  socid: 369, // ID del tercero "Cliente Web" en Dolibarr (créalo y pon su ID)
};

async function doli(path, options = {}) {
  const res = await fetch(DOLI.base + path, {
    ...options,
    headers: {
      DOLAPIKEY: DOLI.key,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Dolibarr ${res.status}: ${await res.text()}`);
  return res.json();
}

// ---------- 1. PRODUCTOS: Dolibarr -> tienda ----------
async function cargarProductosDolibarr() {
  try {
    const lista = await doli(
      "/products?sortfield=t.ref&sortorder=ASC&limit=200&sqlfilters=" +
        encodeURIComponent("(t.tosell:=:1)")
    );
    if (!Array.isArray(lista) || !lista.length) return;

    // IMPORTANTE: app.js usa el id como posición en el arreglo (P[i.id]),
    // por eso id = índice y guardamos el id real de Dolibarr aparte.
    P = lista.map((d, i) => ({
      id: i,
      doliId: d.id,
      name: d.label || d.ref,
      cat: "General", // ver nota de categorías abajo
      price: parseFloat(d.price_ttc || d.price || 0),
      old: 0,
      emoji: "🛒",
      unit: "unidad",
      sold: 0,
      stock: parseFloat(d.stock_reel || 0),
    }));

    renderCats();
    renderGrid();
    renderTop();
    console.log(`Dolibarr: ${P.length} productos cargados`);
  } catch (e) {
    console.error("No se pudo cargar Dolibarr, se usa el catálogo local:", e);
  }
}

// ---------- 2. PEDIDOS: tienda -> Dolibarr ----------
async function enviarPedidoDolibarr(no, items) {
  const lines = items
    .filter((i) => P[i.id] && P[i.id].doliId)
    .map((i) => ({
      fk_product: P[i.id].doliId,
      qty: i.q,
      subprice: P[i.id].price,
      tva_tx: 0,
    }));
  if (!lines.length) return;

  const id = await doli("/orders", {
    method: "POST",
    body: JSON.stringify({
      socid: DOLI.socid,
      date: Math.floor(Date.now() / 1000),
      ref_client: String(no),
      note_private: `Pedido web ${no} - cliente: ${USER ? USER.name : "invitado"}`,
      lines,
    }),
  });
  console.log("Pedido creado en Dolibarr, id:", id);
}

// Engancha el envío al saveOrder() que ya existe en app.js
const _saveOrderOriginal = saveOrder;
saveOrder = function (no, tot, pg, r) {
  const items = Object.keys(cart).map((id) => ({ id: +id, q: cart[id] }));
  _saveOrderOriginal(no, tot, pg, r);
  enviarPedidoDolibarr(no, items).catch((e) =>
    console.error("Pedido NO enviado a Dolibarr:", e)
  );
};

cargarProductosDolibarr();
