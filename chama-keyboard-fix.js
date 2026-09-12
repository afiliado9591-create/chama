(() => {
  'use strict';
  const apply = () => {
    const chat = document.getElementById('chatPanel');
    const active = document.getElementById('activeChat');
    const input = document.getElementById('messageInput');
    if (!chat || !active) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const top = 66;
    const height = Math.max(260, Math.round(vv.height - top));
    chat.style.top = `${top}px`;
    chat.style.bottom = 'auto';
    chat.style.height = `${height}px`;
    active.style.minHeight = '0';
    active.style.height = `${height}px`;
    active.style.overflow = 'hidden';
    const messages = document.getElementById('messages');
    if (messages) messages.style.minHeight = '0';
    if (document.activeElement === input) {
      requestAnimationFrame(() => {
        try { input.scrollIntoView({block:'nearest', inline:'nearest'}); } catch (_) {}
      });
    }
  };
  const reset = () => {
    const chat = document.getElementById('chatPanel');
    const active = document.getElementById('activeChat');
    if (!chat || !active) return;
    if (window.innerWidth <= 700) {
      apply();
    } else {
      chat.style.top = ''; chat.style.bottom = ''; chat.style.height = '';
      active.style.minHeight = ''; active.style.height = ''; active.style.overflow = '';
    }
  };
  const boot = () => {
    reset();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', reset, {passive:true});
      window.visualViewport.addEventListener('scroll', reset, {passive:true});
    }
    window.addEventListener('resize', reset, {passive:true});
    document.addEventListener('focusin', e => {
      if (e.target && e.target.id === 'messageInput') setTimeout(reset, 50);
    });
    document.addEventListener('focusout', e => {
      if (e.target && e.target.id === 'messageInput') setTimeout(reset, 120);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
