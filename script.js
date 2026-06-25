// ── INTRO TRANSITION SCHEDULER ──
(function () {
  const initIntro = () => {
    const overlay = document.getElementById('intro-overlay');
    const phoneScreen = document.querySelector('.phone-screen');
    const screenGlow = document.querySelector('.screen-glow');
    const screenParticles = document.querySelector('.screen-particles');
    const targetMascot = document.querySelector('.mascot-img');
    const mascotContainer = document.querySelector('.boot-mascot-container');
    const mascotImg = document.querySelector('.boot-mascot');

    if (!overlay) return;

    // Boot screen background fades from black to light cream
    setTimeout(() => {
      if (phoneScreen) phoneScreen.classList.add('is-booted');
      if (screenGlow) screenGlow.style.opacity = '1';
      if (screenParticles) screenParticles.style.opacity = '1';
    }, 1000);

    // Transition trigger at ~3.0 seconds
    setTimeout(() => {
      if (targetMascot && mascotContainer && overlay) {
        const targetRect = targetMascot.getBoundingClientRect();
        const introRect = mascotContainer.getBoundingClientRect();

        // Calculate translation relative to its current screen position
        const translateX = targetRect.left - introRect.left;
        const translateY = targetRect.top - introRect.top;

        // Add visual transition classes
        overlay.classList.add('is-transitioning');
        mascotContainer.classList.add('glide-active');

        // Apply dynamic transform directly to the mascot container (scale up to 1.0)
        mascotContainer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(1.0)`;

        // Reveal landing page elements
        document.body.classList.remove('intro-active');
        document.body.classList.add('reveal-homepage');
      } else {
        // Fallback if coordinates cannot be resolved
        document.body.classList.remove('intro-active');
        document.body.classList.add('reveal-homepage');
        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.visibility = 'hidden';
        }
      }

      // Cleanup overlay after glide animation completes (1.2s + buffer)
      setTimeout(() => {
        if (overlay) {
          overlay.style.display = 'none';
        }
      }, 1300);

    }, 3000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();

// placeholder art until real assets are dropped in
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    const isLogo = img.classList.contains('logo');
    const el = document.createElement('div');
    el.className = img.className;
    el.style.cssText = isLogo
      ? 'height:48px;display:flex;align-items:center;justify-content:center;font-family:"Fraunces",serif;font-size:1.6rem;color:#6E2C3E;margin:0 auto 1.6rem;'
      : 'width:100%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 38% 32%,#7C6191,#46305E 70%);box-shadow:0 20px 26px rgba(70,48,94,.28);';
    el.textContent = isLogo ? 'theraseek' : '';
    img.replaceWith(el);
  });
});

// --- MODAL LOGIC ---
const modal = document.getElementById('auth-modal');
const formWaitlist = document.getElementById('form-waitlist');
const formAccount = document.getElementById('form-account');
const modalSuccess = document.getElementById('modal-success');
const tabWaitlist = document.getElementById('tab-waitlist');
const tabAccount = document.getElementById('tab-account');
const wlMsg = document.getElementById('wl-msg');
const accMsg = document.getElementById('acc-msg');
const successDesc = document.getElementById('success-desc');

function openModal(type) {
  modal.classList.add('active');
  switchTab(type);
}

function closeModal() {
  modal.classList.remove('active');
  // Reset forms on close
  setTimeout(() => {
    formWaitlist.reset();
    formAccount.reset();
    wlMsg.textContent = '';
    accMsg.textContent = '';
    wlMsg.className = 'form-msg';
    accMsg.className = 'form-msg';
    
    // Switch out of success state if it was there
    formWaitlist.classList.remove('active');
    formAccount.classList.remove('active');
    modalSuccess.classList.remove('active');
    
    // Reactivate appropriate tab
    if (tabWaitlist.classList.contains('active')) formWaitlist.classList.add('active');
    if (tabAccount.classList.contains('active')) formAccount.classList.add('active');
  }, 300);
}

function switchTab(type) {
  // Clear messages
  wlMsg.textContent = '';
  accMsg.textContent = '';
  
  if (type === 'waitlist') {
    tabWaitlist.classList.add('active');
    tabAccount.classList.remove('active');
    formWaitlist.classList.add('active');
    formAccount.classList.remove('active');
    modalSuccess.classList.remove('active');
  } else {
    tabAccount.classList.add('active');
    tabWaitlist.classList.remove('active');
    formAccount.classList.add('active');
    formWaitlist.classList.remove('active');
    modalSuccess.classList.remove('active');
  }
}

// --- API LOGIC ---
const API_BASE = 'https://theraseek-api.rajarshisaha123-4.workers.dev';

document.getElementById('form-waitlist').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('wl-email').value.trim();
  const btn = document.getElementById('btn-wl');
  
  if (!email) return;

  btn.disabled = true;
  btn.textContent = 'Saving...';
  wlMsg.textContent = '';
  wlMsg.className = 'form-msg';

  try {
    const res = await fetch(`${API_BASE}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Failed to join waitlist');

    // Show success
    formWaitlist.classList.remove('active');
    modalSuccess.classList.add('active');
    successDesc.textContent = "💌 You're in! Watch your inbox — Luna can't wait to meet you.";

  } catch (err) {
    wlMsg.textContent = err.message || 'Something went wrong. Please try again.';
    wlMsg.className = 'form-msg error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Join Waitlist →';
  }
});

document.getElementById('form-account').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('acc-email').value.trim();
  const password = document.getElementById('acc-pass').value.trim();
  const btn = document.getElementById('btn-acc');
  
  if (!email || !password) return;

  btn.disabled = true;
  btn.textContent = 'Creating...';
  accMsg.textContent = '';
  accMsg.className = 'form-msg';

  try {
    const res = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Failed to create account');

    // Show success
    formAccount.classList.remove('active');
    modalSuccess.classList.add('active');
    successDesc.innerHTML = "Account created successfully.<br><br><strong>Waitlist Status: Pending</strong><br><br>We'll notify you the moment it's ready.";

  } catch (err) {
    accMsg.textContent = err.message || 'Something went wrong. Please try again.';
    accMsg.className = 'form-msg error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account →';
  }
});
