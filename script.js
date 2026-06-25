// ── INTRO TRANSITION SCHEDULER ──
(function () {
  const initIntro = () => {
    const overlay = document.getElementById('intro-overlay');
    const glow = document.querySelector('.intro-glow');
    const logoWrapper = document.querySelector('.intro-logo-wrapper');
    const targetLogo = document.querySelector('.logo-img');

    if (!overlay) return;

    // Scene 1: At 100ms, fade in background radial glow
    setTimeout(() => {
      if (glow) {
        glow.classList.add('is-visible');
      }
    }, 100);

    // Scene 2: At 500ms, logo materializes
    setTimeout(() => {
      if (logoWrapper) {
        logoWrapper.classList.add('materialize');
      }
    }, 500);

    // Scene 3: At 1500ms, logo pulses gently once
    setTimeout(() => {
      if (logoWrapper) {
        logoWrapper.classList.add('pulse-glow');
      }
    }, 1500);

    // Scene 4: At 2300ms, glide/scale transition to navbar position
    setTimeout(() => {
      if (targetLogo && logoWrapper) {
        // Temporarily reveal the homepage layout to get the correct layout coordinates
        const isIntroActive = document.body.classList.contains('intro-active');
        const isRevealActive = document.body.classList.contains('reveal-homepage');
        
        document.body.classList.remove('intro-active');
        document.body.classList.add('reveal-homepage');
        
        // Force reflow so getBoundingClientRect() returns the correct layout values
        const targetRect = targetLogo.getBoundingClientRect();
        
        // Restore initial body classes for a clean fade transition
        if (isIntroActive) {
          document.body.classList.add('intro-active');
        }
        if (!isRevealActive) {
          document.body.classList.remove('reveal-homepage');
        }

        // Measure current bounding rect of the wrapper
        const introRect = logoWrapper.getBoundingClientRect();

        // Calculate center points
        const introCenterX = introRect.left + introRect.width / 2;
        const introCenterY = introRect.top + introRect.height / 2;

        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        // Calculate translation relative to its current screen position
        const translateX = targetCenterX - introCenterX;
        const translateY = targetCenterY - introCenterY;

        // Calculate scale relative to unscaled width (offsetWidth)
        const unscaledWidth = logoWrapper.offsetWidth || 220;
        let targetWidth = targetRect.width;
        if (targetWidth === 0) {
          // Fallback if image aspect ratio isn't loaded yet (height is 62px, aspect ratio is 825/303)
          targetWidth = 62 * (825 / 303);
        }
        const targetScale = targetWidth / unscaledWidth;

        // Add visual transition classes
        overlay.classList.add('is-transitioning');
        logoWrapper.classList.add('glide-active');

        // Apply dynamic transform directly to the logo wrapper
        logoWrapper.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${targetScale})`;

        // Reveal landing page elements
        document.body.classList.remove('intro-active');
        document.body.classList.add('reveal-homepage');
      } else {
        // Fallback if elements cannot be resolved
        document.body.classList.remove('intro-active');
        document.body.classList.add('reveal-homepage');
        document.body.classList.add('intro-complete');
        overlay.style.display = 'none';
      }

      // Cleanup overlay after glide animation completes (0.65s + buffer = 700ms)
      setTimeout(() => {
        document.body.classList.add('intro-complete');
        overlay.style.display = 'none';
      }, 700);

    }, 2300);
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
    if (formWaitlist) formWaitlist.reset();
    if (document.getElementById('form-account')) document.getElementById('form-account').reset();
    if (document.getElementById('form-login')) document.getElementById('form-login').reset();
    
    if (wlMsg) wlMsg.textContent = '';
    if (accMsg) accMsg.textContent = '';
    if (document.getElementById('log-msg')) document.getElementById('log-msg').textContent = '';
    
    if (wlMsg) wlMsg.className = 'form-msg';
    if (accMsg) accMsg.className = 'form-msg';
    if (document.getElementById('log-msg')) document.getElementById('log-msg').className = 'form-msg';
    
    // Switch out of success state if it was there
    formWaitlist.classList.remove('active');
    if (document.getElementById('form-account')) document.getElementById('form-account').classList.remove('active');
    if (document.getElementById('form-login')) document.getElementById('form-login').classList.remove('active');
    modalSuccess.classList.remove('active');
    
    // Reactivate appropriate tab
    if (tabWaitlist && tabWaitlist.classList.contains('active')) formWaitlist.classList.add('active');
    if (document.getElementById('tab-account') && document.getElementById('tab-account').classList.contains('active')) document.getElementById('form-account').classList.add('active');
    if (document.getElementById('tab-login') && document.getElementById('tab-login').classList.contains('active')) document.getElementById('form-login').classList.add('active');
  }, 300);
}

function switchTab(type) {
  // Clear messages
  if (wlMsg) wlMsg.textContent = '';
  if (accMsg) accMsg.textContent = '';
  if (document.getElementById('log-msg')) document.getElementById('log-msg').textContent = '';
  
  const forms = {
    'waitlist': document.getElementById('form-waitlist'),
    'account': document.getElementById('form-account'),
    'login': document.getElementById('form-login')
  };
  const tabs = {
    'waitlist': document.getElementById('tab-waitlist'),
    'account': document.getElementById('tab-account'),
    'login': document.getElementById('tab-login')
  };

  Object.keys(forms).forEach(key => {
    if (forms[key]) forms[key].classList.remove('active');
    if (tabs[key]) tabs[key].classList.remove('active');
  });

  if (forms[type]) forms[type].classList.add('active');
  if (tabs[type]) tabs[type].classList.add('active');
  modalSuccess.classList.remove('active');

  const tabsContainer = document.getElementById('modal-tabs-container');
  if (tabsContainer) {
    if (type === 'login') {
      tabsContainer.style.display = 'none';
    } else {
      tabsContainer.style.display = 'flex';
    }
  }
}

// --- API LOGIC ---
const API_BASE = 'https://theraseek-api.theraseek-backend.workers.dev';

// Session Handling
function checkSession() {
  const email = localStorage.getItem('theraseek_email');
  const loginItem = document.getElementById('nav-login-item');
  const logoutItem = document.getElementById('nav-logout-item');
  const dashboardItem = document.getElementById('nav-dashboard-item');
  
  if (email && loginItem && logoutItem && dashboardItem) {
    loginItem.style.display = 'none';
    logoutItem.style.display = 'block';
    dashboardItem.style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', checkSession);

function logout() {
  localStorage.removeItem('theraseek_email');
  localStorage.removeItem('theraseek_status');
  window.location.reload();
}

// Feedback Logic
const feedbackModal = document.getElementById('feedback-modal');
function openFeedback() {
  if (feedbackModal) feedbackModal.classList.add('active');
}
function closeFeedback() {
  if (feedbackModal) {
    feedbackModal.classList.remove('active');
    setTimeout(() => {
      document.getElementById('form-feedback').reset();
      document.getElementById('fb-status').textContent = '';
      document.getElementById('form-feedback').style.display = 'block';
      document.getElementById('fb-success').style.display = 'none';
    }, 300);
  }
}

document.getElementById('form-feedback')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('fb-email').value.trim();
  const message = document.getElementById('fb-msg').value.trim();
  const btn = document.getElementById('btn-fb');
  const fbStatus = document.getElementById('fb-status');
  
  if (!message) return;
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  fbStatus.textContent = '';
  fbStatus.className = 'form-msg';

  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Failed to submit feedback');

    document.getElementById('form-feedback').style.display = 'none';
    document.getElementById('fb-success').style.display = 'block';
  } catch (err) {
    fbStatus.textContent = err.message || 'Something went wrong.';
    fbStatus.className = 'form-msg error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Feedback →';
  }
});

// Waitlist
document.getElementById('form-waitlist')?.addEventListener('submit', async (e) => {
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

// Google Auth handles login/signup seamlessly via redirect
