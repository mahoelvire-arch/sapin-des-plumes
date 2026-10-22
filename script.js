const screens = document.querySelectorAll('.screen');
const showScreen = (id) => {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  window.scrollTo(0, 0);
};

const storageKey = 'wattlab_sapin_2026_demo';
const readWishes = () => {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

let wishes = readWishes();
let currentPlume = { pseudo: '', ornament: '⭐', email: '', consent: false };

// La révélation utilise la date réelle du navigateur : 25 décembre 2026.
const revealDate = new Date(2026, 11, 25, 0, 0, 0);
const isRevealed = () => new Date() >= revealDate;

document.querySelector('#enterBtn').addEventListener('click', () => showScreen('identity'));

document.querySelector('#identityForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const pseudo = document.querySelector('#pseudo').value.trim();
  const email = document.querySelector('#email').value.trim();
  const consent = document.querySelector('#consent').checked;
  if (pseudo.length < 2) return alert('Choisis un pseudonyme d’au moins 2 caractères.');
  if (consent && !email) return alert('Ajoute ton e-mail pour demander ta carte de Noël.');
  currentPlume = { pseudo, email: consent ? email : '', consent, ornament: '⭐' };
  document.querySelectorAll('.choice').forEach(choice => {
    choice.classList.toggle('selected', choice.dataset.ornament === '⭐');
  });
  showScreen('ornaments');
});

document.querySelectorAll('.choice').forEach(choice => {
  choice.addEventListener('click', () => {
    currentPlume.ornament = choice.dataset.ornament;
    document.querySelectorAll('.choice').forEach(item => item.classList.toggle('selected', item === choice));
  });
});

document.querySelector('#ornamentNext').addEventListener('click', () => showScreen('wish'));

document.querySelector('#wishText').addEventListener('input', (event) => {
  document.querySelector('#count').textContent = `${event.target.value.length} / 350 caractères`;
});

document.querySelector('#wishForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector('#wishText').value.trim();
  if (message.length < 5) return alert('Écris un message un peu plus long.');
  wishes.push({
    id: Date.now() + '-' + Math.random().toString(36).slice(2),
    pseudo: currentPlume.pseudo,
    ornament: currentPlume.ornament,
    message,
    // Démo locale uniquement. Aucun e-mail n'est réellement envoyé.
    email: currentPlume.email,
    consent: currentPlume.consent
  });
  try {
    localStorage.setItem(storageKey, JSON.stringify(wishes));
  } catch {
    alert('Impossible de conserver le vœu sur cet appareil.');
  }
  document.querySelector('#wishForm').reset();
  document.querySelector('#count').textContent = '0 / 350 caractères';
  renderTree();
  showScreen('tree');
});

function renderTree() {
  const layer = document.querySelector('#ornamentLayer');
  layer.replaceChildren();
  document.querySelector('#total').textContent = `${wishes.length} vœu${wishes.length > 1 ? 'x' : ''} accroché${wishes.length > 1 ? 's' : ''}`;
  document.querySelector('#treeSubtitle').textContent = isRevealed()
    ? 'Les vœux de Noël sont enfin révélés ! ✨'
    : 'Les messages restent secrets jusqu’au 25 décembre 2026. 🔒';
  document.querySelector('#detail').textContent = 'Sélectionne une décoration ✨';

  wishes.forEach((wish, index) => {
    const angle = index * 2.39996;
    const fraction = Math.sqrt((index + 0.5) / Math.max(wishes.length, 1));
    const y = 30 + fraction * 47;
    const widthAtY = 7 + (y - 24) * 0.65;
    const x = 50 + Math.sin(angle) * widthAtY * 0.8;
    const ornament = document.createElement('button');
    ornament.type = 'button';
    ornament.className = 'ornament';
    ornament.style.left = `${x}%`;
    ornament.style.top = `${y}%`;
    ornament.textContent = wish.ornament;
    ornament.setAttribute('aria-label', `Décoration de ${wish.pseudo}`);
    ornament.addEventListener('click', () => {
      document.querySelector('#detail').textContent = isRevealed()
        ? `${wish.ornament} ${wish.pseudo}\n\n« ${wish.message} »`
        : `${wish.ornament} ${wish.pseudo}\n\n🔒 Son vœu sera dévoilé le 25 décembre 2026.`;
    });
    layer.appendChild(ornament);
  });
}

document.querySelector('#addAnother').addEventListener('click', () => {
  document.querySelector('#identityForm').reset();
  showScreen('identity');
});
document.querySelector('#backHome').addEventListener('click', () => showScreen('home'));
renderTree();
