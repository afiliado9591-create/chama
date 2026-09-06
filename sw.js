const VERSION="chama-clean-v139";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();

    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.all(windows.map(async client => {
      try {
        const url = new URL(client.url);
        if (url.origin !== self.location.origin) return;
        if (url.searchParams.get("chama_update") === "139") return;
        url.searchParams.set("chama_update", "139");
        await client.navigate(url.toString());
      } catch (_) {}
    }));
  })());
});

function injectSafeUi(html) {
  const mediaMarker = 'media-render-safe.js?v=93';
  const menuMarker = 'app-menu.js?v=12';
  const supportMarker = 'chama-support.js?v=3';
  const unreadMarker = 'unread-badges.js?v=6';
  const profileMarker = 'profile-safe-v6.js?v=1';
  const homeMarker = 'home-conversations-search.js?v=5';
  const peopleFallbackMarker = 'people-search-fallback.js?v=1';
  const backMarker = 'ui-back-button.js?v=1';
  const ownAvatarMarker = 'home-own-avatar.js?v=2';
  const avatarEverywhereMarker = 'avatar-everywhere.js?v=2';
  const affiliateMenuMarker = 'affiliate-menu.js?v=2';
  const layoutRefreshMarker = 'layout-refresh.js?v=1';
  const profileHomeMessageMarker = 'profile-home-message.js?v=1';
  const homeProfileMessageMarker = 'home-profile-message.js?v=1';
  const socialVideoMarker = 'social-video-links.js?v=1';
  const clickableLinksMarker = 'clickable-links.js?v=1';
  const professionalPromoMarker = 'professional-promo.js?v=2';
  const affiliateToolsMarker = 'affiliate-tools.js?v=2';
  const referralMarker = 'referral-link.js?v=3';
  const adminPagesMenuMarker = 'admin-pages-menu.js?v=2';
  const communityOffersMarker = 'community-offers.js?v=1';
  const readReceiptMarker = 'read-receipts.js?v=1';
  const communityCountMarker = 'community-count.js?v=2';
  const adminCommunityCountMarker = 'admin-community-count.js?v=1';
  const affiliateDayMarker = 'affiliate-day.js?v=2';
  const adminAffiliateDayMarker = 'admin-affiliate-day.js?v=1';
  let out = html;

  if (!out.includes('window.chamaOpenChat=openChat;')) {
    out = out.replace('  async function saveMessage(text,label=text){', '  window.chamaOpenChat=openChat;\n\n  async function saveMessage(text,label=text){');
  }

  if (!out.includes('chama-chat-opened')) {
    out = out.replace(
      '    $("chatAvatar").textContent=(u.nome||u.email||"U").charAt(0).toUpperCase();',
      '    $("chatAvatar").textContent=(u.nome||u.email||"U").charAt(0).toUpperCase();\n    const activeEl=$("activeChat"); if(activeEl) activeEl.dataset.uid=u.uid||"";\n    document.dispatchEvent(new CustomEvent("chama-chat-opened",{detail:{uid:u.uid||"",nome:u.nome||"Usuário",photoUrl:u.photoUrl||""}}));'
    );
  }

  if (!out.includes('data-chama-message-meta-v123')) {
    out = out.replace(
      '        const b=document.createElement("div"); b.className="bubble "+(mine?"mine":"theirs");',
      '        const b=document.createElement("div"); b.className="bubble "+(mine?"mine":"theirs"); b.dataset.messageId=d.id; b.dataset.chamaCreatedMs=m.createdAt?.toMillis?String(m.createdAt.toMillis()):""; b.dataset.senderId=m.senderId||""; b.setAttribute("data-chama-message-meta-v123","1");'
    );
  }

  if (!out.includes('data-chama-chat-loading-v119')) {
    out = out.replace(
      '  async function openChat(u){\n    activeUser=u;',
      '  async function openChat(u){\n    activeUser=u;\n    const openingBox=$("messages"); if(openingBox) openingBox.innerHTML=\'<div data-chama-chat-loading-v119 style="margin:auto;color:#6a756f;padding:20px;text-align:center">Carregando conversa...</div>\';'
    );
  }

  if (!out.includes('firstChatCreated')) {
    out = out.replace(
      '    await addDoc(collection(db,"chats",chatId,"messages"),{text,senderId:me.uid,receiverId:activeUser.uid,createdAt:serverTimestamp()});',
      '    let firstChatCreated=false;\n    const messageCollection=collection(db,"chats",chatId,"messages");\n    const messageData={text,senderId:me.uid,receiverId:activeUser.uid,createdAt:serverTimestamp()};\n    try{\n      await addDoc(messageCollection,messageData);\n    }catch(sendErr){\n      if(!String(sendErr?.code||"").includes("permission-denied")) throw sendErr;\n      await setDoc(doc(db,"chats",chatId),{participants:ids,createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});\n      firstChatCreated=true;\n      await addDoc(messageCollection,messageData);\n    }'
    );
    out = out.replace(
      '      unreadCounts:{[activeUser.uid]:increment(1),[me.uid]:0}\n    },{merge:true});\n  }\n\n  $("composer")',
      '      unreadCounts:{[activeUser.uid]:increment(1),[me.uid]:0}\n    },{merge:true});\n    if(activeUser)document.dispatchEvent(new CustomEvent("chama-message-sent",{detail:{uid:activeUser.uid||"",nome:activeUser.nome||"Usuário",email:activeUser.email||"",photoUrl:activeUser.photoUrl||"",lastMessage:label||text||""}}));\n    if(firstChatCreated&&activeUser)setTimeout(()=>openChat(activeUser),0);\n  }\n\n  $("composer")'
    );
  }

  if (!out.includes('chama-message-sent')) {
    out = out.replace(
      '    if(firstChatCreated&&activeUser)setTimeout(()=>openChat(activeUser),0);',
      '    if(activeUser)document.dispatchEvent(new CustomEvent("chama-message-sent",{detail:{uid:activeUser.uid||"",nome:activeUser.nome||"Usuário",email:activeUser.email||"",photoUrl:activeUser.photoUrl||"",lastMessage:label||text||""}}));\n    if(firstChatCreated&&activeUser)setTimeout(()=>openChat(activeUser),0);'
    );
  }

  if (!out.includes('chama-first-message-hint-v119')) {
    out = out.replace(
      '    },e=>console.error(e));\n  }\n\n  async function saveMessage',
      '    },e=>{console.error(e);const box=$("messages");if(box)box.innerHTML=\'<div id="chama-first-message-hint-v119" style="margin:auto;color:#6a756f;padding:20px;text-align:center">Conversa ainda não iniciada. Envie a primeira mensagem.</div>\';});\n  }\n\n  async function saveMessage'
    );
  }

  if (!out.includes(mediaMarker)) out = out.replace('</body>', `<script src="./media-render-safe.js?v=93"></script></body>`);
  if (!out.includes(menuMarker)) out = out.replace('</body>', `<script src="./app-menu.js?v=12"></script></body>`);
  if (!out.includes(supportMarker)) out = out.replace('</body>', `<script src="./chama-support.js?v=3"></script></body>`);
  if (!out.includes(unreadMarker)) out = out.replace('</body>', `<script src="./unread-badges.js?v=6"></script></body>`);
  if (!out.includes(profileMarker)) out = out.replace('</body>', `<script src="./profile-safe-v6.js?v=1"></script></body>`);
  if (!out.includes(homeMarker)) out = out.replace('</body>', `<script src="./home-conversations-search.js?v=5"></script></body>`);
  if (!out.includes(peopleFallbackMarker)) out = out.replace('</body>', `<script src="./people-search-fallback.js?v=1"></script></body>`);
  if (!out.includes(backMarker)) out = out.replace('</body>', `<script src="./ui-back-button.js?v=1"></script></body>`);
  if (!out.includes(ownAvatarMarker)) out = out.replace('</body>', `<script src="./home-own-avatar.js?v=2"></script></body>`);
  if (!out.includes(avatarEverywhereMarker)) out = out.replace('</body>', `<script src="./avatar-everywhere.js?v=2"></script></body>`);
  if (!out.includes(affiliateMenuMarker)) out = out.replace('</body>', `<script src="./affiliate-menu.js?v=2"></script></body>`);
  if (!out.includes(layoutRefreshMarker)) out = out.replace('</body>', `<script src="./layout-refresh.js?v=1"></script></body>`);
  if (!out.includes(profileHomeMessageMarker)) out = out.replace('</body>', `<script src="./profile-home-message.js?v=1"></script></body>`);
  if (!out.includes(homeProfileMessageMarker)) out = out.replace('</body>', `<script src="./home-profile-message.js?v=1"></script></body>`);
  if (!out.includes(socialVideoMarker)) out = out.replace('</body>', `<script src="./social-video-links.js?v=1"></script></body>`);
  if (!out.includes(clickableLinksMarker)) out = out.replace('</body>', `<script src="./clickable-links.js?v=1"></script></body>`);
  if (!out.includes(professionalPromoMarker)) out = out.replace('</body>', `<script src="./professional-promo.js?v=2"></script></body>`);
  if (!out.includes(affiliateToolsMarker)) out = out.replace('</body>', `<script src="./affiliate-tools.js?v=2"></script></body>`);
  if (!out.includes(referralMarker)) out = out.replace('</body>', `<script src="./referral-link.js?v=3"></script></body>`);
  if (!out.includes(adminPagesMenuMarker)) out = out.replace('</body>', `<script src="./admin-pages-menu.js?v=2"></script></body>`);
  if (!out.includes(communityOffersMarker)) out = out.replace('</body>', `<script src="./community-offers.js?v=1"></script></body>`);
  if (!out.includes(readReceiptMarker)) out = out.replace('</body>', `<script src="./read-receipts.js?v=1"></script></body>`);
  if (!out.includes(communityCountMarker)) out = out.replace('</body>', `<script src="./community-count.js?v=2"></script></body>`);
  if (!out.includes(adminCommunityCountMarker)) out = out.replace('</body>', `<script src="./admin-community-count.js?v=1"></script></body>`);
  if (!out.includes(affiliateDayMarker)) out = out.replace('</body>', `<script src="./affiliate-day.js?v=2"></script></body>`);
  if (!out.includes(adminAffiliateDayMarker)) out = out.replace('</body>', `<script src="./admin-affiliate-day.js?v=1"></script></body>`);
  return out;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const response = await fetch(event.request, { cache: "no-store" });
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return response;
      const html = injectSafeUi(await response.text());
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    })());
    return;
  }

  event.respondWith(fetch(event.request, { cache: "no-store" }));
});

self.addEventListener("push", event => {
  let payload = {};
  try {
    payload = event.data?.json?.() || {};
  } catch (_) {
    try { payload = JSON.parse(event.data?.text?.() || "{}") || {}; } catch (_) {}
  }

  const data = payload.data || payload;
  if (data.type === "chama_message") {
    const title = data.senderName || payload.notification?.title || "Nova mensagem no Chama";
    const body = data.text || payload.notification?.body || "Você recebeu uma nova mensagem";
    event.waitUntil(self.registration.showNotification(title, {
      body,
      icon: "./icon.svg",
      badge: "./icon.svg",
      tag: "chama-msg-" + (data.chatId || "nova"),
      renotify: true,
      requireInteraction: false,
      silent: false,
      vibrate: [250, 120, 250],
      data: { type: "chama_message", chatId: data.chatId || "" }
    }));
    return;
  }

  if (data.type === "chama_channel") {
    const title = "📢 " + (data.channelName || "Canal Chama");
    const body = data.text || "Nova publicação";
    event.waitUntil(self.registration.showNotification(title, {
      body,
      icon: "./icon.svg",
      badge: "./icon.svg",
      tag: "chama-channel-" + (data.channelId || "novo"),
      renotify: true,
      requireInteraction: false,
      silent: false,
      vibrate: [180,100,180],
      data: { type: "chama_channel", channelId: data.channelId || "" }
    }));
  }
});

self.addEventListener("notificationclick", event => {
  const data = event.notification?.data || {};
  event.notification.close();
  let url = "./";
  if (data.type === "chama_message" && data.chatId) url = "./?chat=" + encodeURIComponent(data.chatId);
  if (data.type === "chama_channel" && data.channelId) url = "./?channel=" + encodeURIComponent(data.channelId);

  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const client of list) {
      if ("navigate" in client) client.navigate(url).catch(() => {});
      if ("focus" in client) return client.focus();
    }
    return self.clients.openWindow(url);
  }));
});
