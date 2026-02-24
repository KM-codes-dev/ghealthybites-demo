(function () {
  const $ = (id) => document.getElementById(id);

  // Footer year
  $("year").textContent = new Date().getFullYear();

  // Demo cart state
  const cart = [];
  const cartEl = $("cart");
  const totalEl = $("total");

  function renderCart() {
    if (!cartEl) return;
    cartEl.innerHTML = "";

    if (cart.length === 0) {
      cartEl.innerHTML = `<div class="muted small" style="padding:12px 0;">Your cart is empty. Add items from the menu.</div>`;
      totalEl.textContent = "₹0";
      return;
    }

    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <div style="font-weight:850">${item.name}</div>
          <div class="muted small">₹${item.price}</div>
        </div>
        <button class="btn btn-small btn-ghost" data-remove="${idx}" type="button">Remove</button>
      `;
      cartEl.appendChild(row);
    });

    totalEl.textContent = `₹${total}`;
  }

  function addToCart(name, price) {
    cart.push({ name, price });
    renderCart();
    recordJourneyEvent("addedToCart", { item: name, price: String(price) });
  }

  function removeFromCart(index) {
    const removed = cart.splice(index, 1)[0];
    renderCart();
    if (removed) recordJourneyEvent("removedFromCart", { item: removed.name });
  }

  // Menu "Add" buttons
  document.querySelectorAll(".addBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-item");
      const price = Number(btn.getAttribute("data-price"));
      addToCart(name, price);
    });
  });

  // Spotlight add button
  $("btnAddSpotlight")?.addEventListener("click", () => {
    addToCart("Lemon Herb Chicken Bowl", 349);
  });

  // Cart remove delegation
  cartEl?.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.getAttribute("data-remove") !== null) {
      removeFromCart(Number(target.getAttribute("data-remove")));
    }
  });

  $("btnClear")?.addEventListener("click", () => {
    cart.length = 0;
    renderCart();
    recordJourneyEvent("clearedCart", {});
  });

  $("btnCheckout")?.addEventListener("click", () => {
    alert("Demo order placed ✅ (No real payment happened.)");
    recordJourneyEvent("placedDemoOrder", { items: String(cart.length) });
  });

  // Simple menu filters
  const chips = document.querySelectorAll(".chip");
  const cards = document.querySelectorAll(".menu-card");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");

      const filter = chip.getAttribute("data-filter");
      cards.forEach((card) => {
        const tags = (card.getAttribute("data-tags") || "").split(" ");
        const show = filter === "all" || tags.includes(filter);
        card.style.display = show ? "" : "none";
      });

      recordJourneyEvent("filteredMenu", { filter });
    });
  });

  // ===== Genesys helpers =====
  function hasGenesys() {
    return typeof window.Genesys === "function";
  }

  function setStatus(text) {
    const el = $("genesysStatus");
    if (el) el.textContent = `Status: ${text}`;
  }

  async function openMessenger() {
    if (!hasGenesys()) {
      console.warn("Genesys() not found. Paste your Messenger deployment snippet into index.html.");
      setStatus("Messenger not detected (paste snippet).");
      return;
    }
    try {
      await window.Genesys("command", "Messenger.open", {});
      setStatus("Messenger detected ✅ (opened)");
    } catch (e) {
      setStatus("Messenger detected ✅ (may already be open)");
    }
  }

  async function closeMessenger() {
    if (!hasGenesys()) {
      setStatus("Messenger not detected (paste snippet).");
      return;
    }
    try {
      await window.Genesys("command", "Messenger.close", {});
      setStatus("Messenger detected ✅ (closed)");
    } catch (e) {
      setStatus("Messenger detected ✅ (may already be closed)");
    }
  }

  function recordJourneyEvent(eventName, customAttributes = {}) {
    if (!hasGenesys()) {
      // Still allow local testing without Genesys
      console.log(`[demo] Journey event (Genesys not loaded): ${eventName}`, customAttributes);
      setStatus("Messenger not detected yet (paste snippet).");
      return;
    }

    window.Genesys("command", "Journey.record", {
      eventName,
      customAttributes,
      traitsMapper: []
    });

    console.log(`Journey event recorded: ${eventName}`, customAttributes);
    setStatus(`Messenger detected ✅ (recorded: ${eventName})`);
  }

  // Wire up Genesys buttons
  ["btnOpenMessenger", "btnOpenMessenger2", "btnNeedHelp"].forEach((id) =>
    $(id)?.addEventListener("click", () => {
      recordJourneyEvent("requestedSupport", { source: id });
      openMessenger();
    })
  );

  ["btnCloseMessenger", "btnCloseMessenger2"].forEach((id) =>
    $(id)?.addEventListener("click", closeMessenger)
  );

  $("btnRecordMenuViewed")?.addEventListener("click", () =>
    recordJourneyEvent("menuViewed", { pageSection: "heroSpotlight" })
  );

  $("btnRecordPricing")?.addEventListener("click", () =>
    recordJourneyEvent("viewedOffers", { offer: "weeklyBundle" })
  );

  $("btnRecordSupport")?.addEventListener("click", () =>
    recordJourneyEvent("askedSupport", { page: "genesysLab" })
  );

  // Initial render + status
  renderCart();
  setStatus(hasGenesys() ? "Messenger detected ✅" : "Messenger not detected yet (paste snippet).");
})();