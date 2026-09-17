(function() {
  'use strict';

  // REFERÊNCIAS DE ELEMENTOS
  const loginScreen = document.getElementById('loginScreen');
  const chatListScreen = document.getElementById('chatListScreen');
  const loginForm = document.getElementById('loginForm');
  
  const visitorCounter = document.getElementById('visitorCounter');
  const headerUsernameText = document.getElementById('headerUsernameText');
  const openProfileFromHeader = document.getElementById('openProfileFromHeader');
  const profileAlertBadge = document.getElementById('profileAlertBadge');

  const profileModal = document.getElementById('profileModal');
  const closeProfile = document.getElementById('closeProfile');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const profileNameInput = document.getElementById('profileNameInput');
  const profilePhoneInput = document.getElementById('profilePhoneInput');
  const profileBioInput = document.getElementById('profileBioInput');
  const profileWarningBanner = document.getElementById('profileWarningBanner');

  // VERIFICAÇÃO DE ESTADO DE LOGIN E PERFIL
  function checkProfileStatus() {
    const profile = JSON.parse(localStorage.getItem('chama_user_profile') || 'null');
    
    if (!profile || !profile.name || !profile.name.trim()) {
      // Perfil incompleto: fica em vermelho piscando e exige preenchimento
      openProfileFromHeader.classList.add('incomplete');
      profileAlertBadge.classList.remove('hidden');
      profileWarningBanner.classList.remove('hidden');
      return false;
    } else {
      // Perfil preenchido corretamente
      openProfileFromHeader.classList.remove('incomplete');
      profileAlertBadge.classList.add('hidden');
      profileWarningBanner.classList.add('hidden');
      headerUsernameText.textContent = profile.name;
      return true;
    }
  }

  // FLUXO DE LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      if (!email) return;

      localStorage.setItem('chama_logged_email', email);
      loginScreen.classList.remove('active');
      chatListScreen.classList.add('active');

      // Incrementa e exibe contador de visitas
      let visits = parseInt(localStorage.getItem('chama_visits') || '1482', 10);
      visits += 1;
      localStorage.setItem('chama_visits', visits);
      if (visitorCounter) visitorCounter.textContent = `👁️ ${visits.toLocaleString('pt-BR')} visitas`;

      // Verifica se o perfil está preenchido. Se não estiver, abre o modal de perfil obrigatoriamente
      if (!checkProfileStatus()) {
        profileModal.classList.add('open');
      }
    });
  }

  // ABRIR PERFIL AO CLICAR NO NOME NO TOPO
  if (openProfileFromHeader) {
    openProfileFromHeader.addEventListener('click', () => {
      const profile = JSON.parse(localStorage.getItem('chama_user_profile') || '{}');
      profileNameInput.value = profile.name || '';
      profilePhoneInput.value = profile.phone || '';
      profileBioInput.value = profile.bio || '';
      
      checkProfileStatus();
      profileModal.classList.add('open');
    });
  }

  if (closeProfile) {
    closeProfile.addEventListener('click', () => {
      if (!checkProfileStatus()) {
        alert('Você precisa preencher o seu perfil para poder utilizar o aplicativo!');
        return;
      }
      profileModal.classList.remove('open');
    });
  }

  // SALVAR PERFIL
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const name = profileNameInput.value.trim();
      const phone = profilePhoneInput.value.trim();
      const bio = profileBioInput.value.trim();

      if (!name) {
        alert('O nome de usuário é obrigatório!');
        return;
      }

      const profile = { name, phone, bio };
      localStorage.setItem('chama_user_profile', JSON.stringify(profile));

      checkProfileStatus();
      profileModal.classList.remove('open');
      alert('Perfil atualizado com sucesso!');
    });
  }

  // NAVEGAÇÃO DE CONVERSAS (Lista -> Chat)
  const chatRoomScreen = document.getElementById('chatRoomScreen');
  const chatItem = document.querySelector('.chat-item');
  const backBtn = document.getElementById('backBtn');

  if (chatItem) {
    chatItem.addEventListener('click', () => {
      chatListScreen.classList.remove('active');
      chatRoomScreen.classList.add('active');
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      chatRoomScreen.classList.remove('active');
      chatListScreen.classList.add('active');
    });
  }

  // MODAL DE CATÁLOGO (Visualizar)
  const catalogBtn = document.getElementById('catalogBtn');
  const catalogModal = document.getElementById('catalogModal');
  const closeCatalog = document.getElementById('closeCatalog');
  const catalogBodyList = document.getElementById('catalogBodyList');

  function renderCatalog() {
    const products = JSON.parse(localStorage.getItem('chama_catalog') || '[]');
    if (products.length === 0) {
      catalogBodyList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum produto cadastrado no catálogo.</p>';
      return;
    }
    catalogBodyList.innerHTML = products.map(p => `
      <div class="catalog-card">
        <h4>${p.name}</h4>
        <p style="font-weight: bold; color: #333; margin-bottom: 4px;">${p.price}</p>
        <p style="font-size: 13px; color: #666;">${p.desc}</p>
      </div>
    `).join('');
  }

  if (catalogBtn) {
    catalogBtn.addEventListener('click', () => {
      renderCatalog();
      catalogModal.classList.add('open');
    });
  }
  if (closeCatalog) {
    closeCatalog.addEventListener('click', () => catalogModal.classList.remove('open'));
  }

  // MODAL DE ADMINISTRAÇÃO (Criar Catálogo)
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const closeAdmin = document.getElementById('closeAdmin');
  const saveProductBtn = document.getElementById('saveProductBtn');
  const adminProductsList = document.getElementById('adminProductsList');

  function renderAdminProducts() {
    const products = JSON.parse(localStorage.getItem('chama_catalog') || '[]');
    if (products.length === 0) {
      adminProductsList.innerHTML = '<p style="font-size: 13px; color: #666;">Nenhum produto criado.</p>';
      return;
    }
    adminProductsList.innerHTML = products.map((p, index) => `
      <div class="admin-card">
        <h4>${p.name} - ${p.price}</h4>
        <p style="font-size: 12px; color: #666; margin-bottom: 6px;">${p.desc}</p>
        <button onclick="window.deleteProduct(${index})" style="background: #ff4d4d; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Excluir</button>
      </div>
    `).join('');
  }

  window.deleteProduct = function(index) {
    let products = JSON.parse(localStorage.getItem('chama_catalog') || '[]');
    products.splice(index, 1);
    localStorage.setItem('chama_catalog', JSON.stringify(products));
    renderAdminProducts();
  };

  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      renderAdminProducts();
      adminModal.classList.add('open');
    });
  }
  if (closeAdmin) {
    closeAdmin.addEventListener('click', () => adminModal.classList.remove('open'));
  }

  if (saveProductBtn) {
    saveProductBtn.addEventListener('click', () => {
      const name = document.getElementById('prodName').value.trim();
      const price = document.getElementById('prodPrice').value.trim();
      const desc = document.getElementById('prodDesc').value.trim();

      if (!name || !price) {
        alert('Informe pelo menos o nome e o preço!');
        return;
      }

      const products = JSON.parse(localStorage.getItem('chama_catalog') || '[]');
      products.push({ name, price, desc });
      localStorage.setItem('chama_catalog', JSON.stringify(products));

      document.getElementById('prodName').value = '';
      document.getElementById('prodPrice').value = '';
      document.getElementById('prodDesc').value = '';

      renderAdminProducts();
      alert('Produto adicionado com sucesso!');
    });
  }

  // MENSAGENS E VÍDEOS
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const messagesContainer = document.getElementById('messages');

  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    messageInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    processBubble(bubble);
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  const RE = /(https?:\/\/[^\s<]+)/gi;

  function youtube(u) {
    try {
      const x = new URL(u), h = x.hostname.replace(/^www\./, '');
      let id = '';
      if (h === 'youtu.be') id = x.pathname.split('/')[1] || '';
      else if (h.endsWith('youtube.com')) {
        if (x.pathname === '/watch') id = x.searchParams.get('v') || '';
        else {
          const p = x.pathname.split('/').filter(Boolean);
          if (['shorts', 'embed', 'live'].includes(p[0])) id = p[1] || '';
        }
      }
      return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null;
    } catch { return null; }
  }

  function tiktok(u) {
    try {
      const x = new URL(u), h = x.hostname.replace(/^www\./, '');
      if (!h.endsWith('tiktok.com')) return null;
      const m = x.pathname.match(/\/video\/(\d+)/);
      return m ? `https://www.tiktok.com/player/v1/${m[1]}?autoplay=0` : null;
    } catch { return null; }
  }

  function facebook(u) {
    try {
      const x = new URL(u), h = x.hostname.replace(/^www\./, '');
      if (!(h === 'facebook.com' || h === 'fb.watch' || h.endsWith('.facebook.com'))) return null;
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&width=560`;
    } catch { return null; }
  }

  function directVideo(u) {
    try {
      const x = new URL(u);
      return /\.(mp4|webm|ogg)(?:$|\?)/i.test(x.pathname + x.search) ? u : null;
    } catch { return null; }
  }

  function shopee(u) {
    try {
      const x = new URL(u), h = x.hostname.replace(/^www\./, '');
      return h === 'shopee.com.br' || h.endsWith('.shopee.com.br') || h === 's.shopee.com.br';
    } catch { return false; }
  }

  function addEmbed(bubble, url) {
    if (bubble.querySelector(`.ch-video-embed[data-url="${CSS.escape(url)}"]`)) return;
    const src = youtube(url) || tiktok(url) || facebook(url);
    const direct = directVideo(url);

    if (src) {
      const wrap = document.createElement('div');
      wrap.className = 'ch-video-embed';
      wrap.dataset.url = url;
      const f = document.createElement('iframe');
      f.src = src;
      f.loading = 'lazy';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      wrap.appendChild(f);
      bubble.appendChild(wrap);
      return;
    }

    if (direct) {
      const wrap = document.createElement('div');
      wrap.className = 'ch-video-embed';
      wrap.dataset.url = url;
      const v = document.createElement('video');
      v.src = direct;
      v.controls = true;
      v.preload = 'metadata';
      wrap.appendChild(v);
      bubble.appendChild(wrap);
      return;
    }

    if (shopee(url)) {
      const n = document.createElement('div');
      n.className = 'ch-video-note';
      n.dataset.url = url;
      n.innerHTML = '🛍️ Link da Shopee recebido. <a target="_blank" rel="noopener noreferrer">Abrir na Shopee</a>.';
      n.querySelector('a').href = url;
      bubble.appendChild(n);
    }
  }

  function processBubble(b) {
    if (!b || b.dataset.videoReady === '1') return;
    const raw = (b.textContent || '').trim();
    if (!raw) return;
    const urls = raw.match(RE) || [];
    [...new Set(urls)].slice(0, 3).forEach(u => addEmbed(b, u.replace(/[.,!?;:)]+$/, '')));
    b.dataset.videoReady = '1';
  }

  document.querySelectorAll('#messages .bubble').forEach(processBubble);
})();