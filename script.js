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
