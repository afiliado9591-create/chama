(() => {
  if (window.__CHAMA_AVAILABILITY_SAFE__) return;
  window.__CHAMA_AVAILABILITY_SAFE__ = true;

  const FIREBASE_VERSION = "12.18.0";
  let db = null;
  let auth = null;
  let initialized = false;
  let publicProfiles = new Map();

  async function firebase() {
    const appMod = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`);
    const authMod = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`);
    const fsMod = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`);
    const app = appMod.getApps()[0];
    if (!app) throw new Error("Firebase app não encontrada");
    auth = authMod.getAuth(app);
    db = fsMod.getFirestore(app);
    return { fsMod, authMod };
  }

  function addStyles() {
    if (document.getElementById("chamaAvailabilityStyle")) return;
    const style = document.createElement("style");
    style.id = "chamaAvailabilityStyle";
    style.textContent = `
      #chamaAvailabilityButton{display:block;width:100%;box-sizing:border-box;margin:8px 0;padding:9px 12px;border:1px solid rgba(0,0,0,.12);border-radius:10px;background:#fff;font:inherit;text-align:left;cursor:pointer}
      #chamaAvailabilityButton .cf-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#aaa;margin-right:7px}
      #chamaAvailabilityButton.available .cf-dot{background:#19a64a}
      #chamaAvailabilityModal{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box}
      #chamaAvailabilityCard{width:min(390px,100%);background:#fff;border-radius:16px;padding:20px;box-sizing:border-box;box-shadow:0 12px 40px rgba(0,0,0,.25)}
      #chamaAvailabilityCard h3{margin:0 0 8px;font-size:20px}
      #chamaAvailabilityCard p{margin:0 0 16px;line-height:1.4}
      #chamaAvailabilityCard button{padding:10px 14px;border:0;border-radius:10px;cursor:pointer}
      #chamaAvailabilitySave{background:#19a64a;color:#fff}
      #chamaAvailabilityClose{margin-left:8px;background:#eee}
      #chamaAvailabilityToggle{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #ddd;border-radius:12px;cursor:pointer}
      #chamaAvailabilityToggle input{width:20px;height:20px}
      #meEmail{display:none!important}
      #usersList .user-email{display:none!important}
      #usersList .chama-profile-subtitle{display:block;font-size:12px;color:#6a756f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
    `;
    document.head.appendChild(style);
  }

  function button() {
    let el = document.getElementById("chamaAvailabilityButton");
    if (el) return el;
    const me = document.getElementById("meName");
    const users = document.getElementById("usersList");
    if (!me && !users) return null;
    el = document.createElement("button");
    el.id = "chamaAvailabilityButton";
    el.type = "button";
    el.innerHTML = '<span class="cf-dot"></span><span>Disponibilidade: verificando...</span>';
    if (me && me.parentElement) me.parentElement.insertBefore(el, me.nextSibling);
    else if (users && users.parentElement) users.parentElement.insertBefore(el, users);
    el.onclick = openModal;
    return el;
  }

  function setButton(value) {
    const el = button();
    if (!el) return;
    el.classList.toggle("available", !!value);
    const text = el.querySelector("span:last-child");
    if (text) text.textContent = value ? "Disponível para conversar" : "Não estou disponível";
  }

  async function readCurrent() {
    if (!db || !auth?.currentUser) return false;
    const { doc, getDoc } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`);
    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    return snap.exists() ? !!snap.data().disponivelParaConversar : false;
  }

  async function saveCurrent(value) {
    if (!db || !auth?.currentUser) return;
    const { doc, setDoc, serverTimestamp } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`);
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      disponivelParaConversar: !!value,
      statusUpdatedAt: serverTimestamp()
    }, { merge: true });
    setButton(!!value);
  }

  async function loadPublicProfiles() {
    if (!db) return;
    try {
      const { collection, getDocs, limit, query } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`);
      const snap = await getDocs(query(collection(db, "publicProfiles"), limit(100)));
      publicProfiles = new Map();
      snap.forEach(s => publicProfiles.set(s.id, s.data()));
      decorateUserRows();
    } catch (e) {
      console.warn("Chama perfis públicos:", e);
    }
  }

  function decorateUserRows() {
    document.querySelectorAll("#usersList .user").forEach(row => {
      const uid = row.dataset.uid;
      if (!uid) return;
      row.querySelector(".user-email")?.setAttribute("aria-hidden", "true");
      const profile = publicProfiles.get(uid) || {};
      const phrase = String(profile.statusTexto || profile.frase || "").trim();
      let sub = row.querySelector(".chama-profile-subtitle");
      if (!phrase) { if (sub) sub.remove(); return; }
      if (!sub) {
        sub = document.createElement("span");
        sub.className = "chama-profile-subtitle";
        const main = row.querySelector(".user-main");
        if (main) main.appendChild(sub);
      }
      sub.textContent = phrase;
      sub.title = phrase;
    });
  }

  function relabelProfileField() {
    document.querySelectorAll(".cf-field").forEach(field => {
      const label = field.querySelector("label");
      const textarea = field.querySelector("textarea");
      if (label && textarea && label.textContent.trim() === "Status") {
        label.textContent = "Frase / apresentação";
        textarea.placeholder = "Ex.: Moda evangélica • Deus seja louvado • Faço negócios 🤝";
      }
    });
  }

  function refreshVisibleRows() {
    decorateUserRows();
    relabelProfileField();
  }

  function closeModal() {
    document.getElementById("chamaAvailabilityModal")?.remove();
  }

  async function openModal() {
    if (!auth?.currentUser) return;
    if (document.getElementById("chamaAvailabilityModal")) return;
    let value = false;
    try { value = await readCurrent(); } catch (_) {}
    const modal = document.createElement("div");
    modal.id = "chamaAvailabilityModal";
    modal.innerHTML = `
      <div id="chamaAvailabilityCard" role="dialog" aria-modal="true" aria-label="Disponibilidade">
        <h3>Disponibilidade</h3>
        <p>Mostre para outras pessoas quando você está disponível para conversar.</p>
        <label id="chamaAvailabilityToggle">
          <input id="chamaAvailabilityInput" type="checkbox" ${value ? "checked" : ""}>
          <span>🟢 Disponível para conversar</span>
        </label>
        <div style="margin-top:16px;text-align:right">
          <button id="chamaAvailabilitySave" type="button">Salvar</button>
          <button id="chamaAvailabilityClose" type="button">Fechar</button>
        </div>
      </div>`;
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.body.appendChild(modal);
    document.getElementById("chamaAvailabilityClose").onclick = closeModal;
    document.getElementById("chamaAvailabilitySave").onclick = async () => {
      const save = document.getElementById("chamaAvailabilitySave");
      save.disabled = true;
      try {
        await saveCurrent(document.getElementById("chamaAvailabilityInput").checked);
        closeModal();
      } catch (e) {
        console.error("Chama disponibilidade:", e);
        save.disabled = false;
        alert("Não foi possível salvar agora. Tente novamente.");
      }
    };
  }

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      await firebase();
      addStyles();
      const { onAuthStateChanged } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`);
      onAuthStateChanged(auth, async user => {
        if (!user) return;
        await loadPublicProfiles();
        let tries = 0;
        const timer = setInterval(async () => {
          const el = button();
          refreshVisibleRows();
          tries++;
          if (el || tries >= 40) {
            clearInterval(timer);
            if (!el) return;
            try { setButton(await readCurrent()); } catch (_) { setButton(false); }
          }
        }, 250);
        setInterval(refreshVisibleRows, 1200);
      });
    } catch (e) {
      console.error("Chama availability module:", e);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();