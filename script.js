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

// form
const form  = document.getElementById('join');
const email = document.getElementById('email');
const hint  = document.getElementById('hint');
const count = document.getElementById('count');

const btn = form.querySelector('button');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = email.value.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    hint.textContent = 'Hmm, that email looks off — mind checking it?';
    hint.classList.add('is-error');
    email.focus();
    return;
  }

  hint.classList.remove('is-error');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    const endpoint = (typeof WAITLIST_ENDPOINT !== 'undefined' && WAITLIST_ENDPOINT) || '';
    if (endpoint) {
      // Apps Script needs a "simple" request to skip CORS preflight:
      // text/plain body + no-cors mode. We can't read the response, so we
      // treat a completed request as success.
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ email: value, source: 'landing' }),
      });
    } else {
      await new Promise((r) => setTimeout(r, 500)); // demo mode
    }

    form.classList.add('is-done');
    hint.innerHTML = "💌 You're in! Watch your inbox — Seeker can't wait to meet you.";
    count.textContent = (parseInt(count.textContent.replace(/,/g, ''), 10) + 1).toLocaleString('en-IN');
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Notify me →';
    hint.textContent = 'Something went wrong on our end — please try again in a moment.';
    hint.classList.add('is-error');
  }
});
