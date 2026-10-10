/* ============================================================
   ⚙️ الإعدادات
   ============================================================ */
const TELEGRAM_BOT_TOKEN = '8659921146:AAEDBau1koh4GYxKlo2yZCIMH2H7zoeYgWw';
const TELEGRAM_CHAT_ID = '5310267778';
const SHIPPING_COST = 50;
const FREE_SHIPPING_MIN = 500;

let currentLang = 'ar';

/* ============================================================
   💳 بيانات التحويل
   ============================================================ */
const RECEIVING_ACCOUNTS = {
  instapay: {
    title: '⚡ بيانات إنستاباي',
    lines: [
      'رقم المحفظة / الموبايل: 01155273005',
      'اسم المستلم: فاطمة محمد',
      'IPA: fatma@instapay'
    ]
  },
  vodafone: {
    title: '📱 بيانات فودافون كاش',
    lines: [
      'رقم فودافون كاش: 01155273005',
      'اسم المستلم: فاطمة محمد'
    ]
  }
};

const paymentNames = {
  cash:     { ar: '💵 الدفع عند الاستلام', en: '💵 Cash on Delivery' },
  instapay: { ar: '⚡ إنستاباي',            en: '⚡ InstaPay' },
  vodafone: { ar: '📱 فودافون كاش',         en: '📱 Vodafone Cash' }
};

/* ============================================================
   📱 دالة إرسال رسالة على تيليجرام
   ============================================================ */
async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    const data = await response.json();
    if (data.ok) return true;
    return false;
  } catch (err) {
    return false;
  }
}

/* ============================================================
   📋 نسخ رقم الهاتف
   ============================================================ */
function copyPhoneNumber(phone) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(phone).then(() => {
      showToast('📋 تم النسخ!', `رقم: ${phone}`, 2500);
    }).catch(() => {
      fallbackCopy(phone);
    });
  } else {
    fallbackCopy(phone);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('📋 تم النسخ!', `رقم: ${text}`, 2500);
  } catch (err) {
    showToast('⚠️ مشكلة', 'انسخ الرقم يدوياً', 2500);
  }
  document.body.removeChild(textarea);
}

/* ============================================================
   📞 الاتصال المباشر
   ============================================================ */
function makeCall(event, phone) {
  event.preventDefault();

  // نحاول نفتح الاتصال
  try {
    window.location.href = `tel:${phone}`;
  } catch (err) {
    console.error('تعذر الاتصال:', err);
  }

  // على الكمبيوتر - ننسخ الرقم + نعرض إشعار
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (!isMobile) {
    setTimeout(() => {
      copyPhoneNumber(phone);
      showToast('📞 اتصل بينا', `الرقم: ${phone}`, 3500);
    }, 500);
  }
}

/* ============================================================
   📋 فتح وقفل مودال الاستبدال
   ============================================================ */
function openReturnModal() {
  const modal = document.getElementById('returnModal');
  if (modal) {
    modal.classList.add('open');
    document.body.classList.add('modal-open');
  }
}

function closeReturnModal() {
  const modal = document.getElementById('returnModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
}

/* ============================================================
   💳 عرض بيانات التحويل
   ============================================================ */
function getReceiveInfoHTML(method) {
  const account = RECEIVING_ACCOUNTS[method];
  if (!account) return '';
  const linesHTML = account.lines.map(line => `<p>${line}</p>`).join('');
  return `
    <h4>${account.title}</h4>
    ${linesHTML}
    <div class="copy-hint">📸 من فضلك صوّر البيانات أو انسخها للتحويل</div>
  `;
}

function updatePaymentReceiveInfo(method) {
  const box = document.getElementById('paymentReceiveInfo');
  if (!box) return;
  if (method === 'cash') {
    box.classList.remove('show');
    box.innerHTML = '';
  } else {
    box.innerHTML = getReceiveInfoHTML(method);
    box.classList.add('show');
  }
}

function showPayFields(method) {
  const instapayFields = document.getElementById('instapayFields');
  const vodafoneFields = document.getElementById('vodafoneFields');
  const instapaySender = document.getElementById('instapaySender');
  const vodafoneSender = document.getElementById('vodafoneSender');

  instapayFields.style.display = 'none';
  vodafoneFields.style.display = 'none';
  instapaySender.required = false;
  vodafoneSender.required = false;

  if (method === 'instapay') {
    instapayFields.style.display = 'block';
    instapaySender.required = true;
  } else if (method === 'vodafone') {
    vodafoneFields.style.display = 'block';
    vodafoneSender.required = true;
  }
}

document.querySelectorAll('input[name="paymentPay"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const method = radio.value;
    localStorage.setItem('gemora_payment', method);
    updatePaymentReceiveInfo(method);
    showPayFields(method);
  });
});

/* ============ قائمة الموبايل ============ */
const menuBtn = document.getElementById('menuBtn');
const mainNav = document.getElementById('mainNav');
if (menuBtn && mainNav) {
  menuBtn.addEventListener('click', () => mainNav.classList.toggle('open'));
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });
}

/* ============ تبديل اللغة ============ */
const langBtn = document.getElementById('langBtn');
function switchLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-ar][data-en]').forEach(el => {
    el.textContent = el.getAttribute('data-' + lang);
  });
  const emailIn = document.querySelector('#newsletterForm input[type="email"]');
  if (emailIn) emailIn.placeholder = (lang === 'ar') ? 'أدخل بريدك الإلكتروني' : 'Enter your email';
  if (langBtn) langBtn.textContent = (lang === 'ar') ? 'EN' : 'ع';
  document.title = (lang === 'ar') ? 'GEMORA | عالم الأحجار الكريمة' : 'GEMORA | The World of Gemstones';
  renderCart();
}
if (langBtn) {
  langBtn.addEventListener('click', () => {
    currentLang = (currentLang === 'ar') ? 'en' : 'ar';
    switchLanguage(currentLang);
  });
}

/* ============ تأثير الدايرة على العنوان ============ */
const heroTitle = document.getElementById('heroTitle');
if (heroTitle) {
  heroTitle.addEventListener('mousemove', (e) => {
    const rect = heroTitle.getBoundingClientRect();
    heroTitle.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
    heroTitle.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
  });
  heroTitle.addEventListener('mouseenter', () => heroTitle.classList.add('hovering'));
  heroTitle.addEventListener('mouseleave', () => {
    heroTitle.classList.remove('hovering');
    heroTitle.style.setProperty('--mouse-x', '-500px');
    heroTitle.style.setProperty('--mouse-y', '-500px');
  });
}

/* ============ الإشعار الداخلي ============ */
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');
const toastClose = document.getElementById('toastClose');
let toastTimeout;
function showToast(title, message, duration = 3000) {
  if (!toast) return;
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}
if (toastClose) toastClose.addEventListener('click', () => toast.classList.remove('show'));

/* ============ الأكونت ============ */
const userAvatar = document.getElementById('userAvatar');
const avatarImg = document.getElementById('avatarImg');
const avatarFallback = document.getElementById('avatarFallback');
const avatarName = document.getElementById('avatarName');

function updateUserAvatar() {
  if (!userAvatar) return;
  try {
    const savedAvatar = localStorage.getItem('gemora_avatar');
    const savedName = localStorage.getItem('gemora_name');
    const savedEmail = localStorage.getItem('gemora_email');
    if (savedAvatar) {
      avatarImg.src = savedAvatar;
      avatarImg.style.display = 'block';
      avatarFallback.style.display = 'none';
    } else if (savedName || savedEmail) {
      avatarFallback.textContent = (savedName || savedEmail).charAt(0).toUpperCase();
      avatarFallback.style.display = 'flex';
      avatarImg.style.display = 'none';
    } else {
      avatarFallback.textContent = '👤';
      avatarFallback.style.display = 'flex';
      avatarImg.style.display = 'none';
    }
    avatarName.textContent = savedName ? savedName.substring(0, 12) : ((currentLang === 'ar') ? 'حسابي' : 'Account');
  } catch (err) {}
}
updateUserAvatar();

/* ============ Modal الحساب ============ */
const accountModal = document.getElementById('accountModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const accountForm = document.getElementById('accountForm');
const modalSuccess = document.getElementById('modalSuccess');
const avatarInput = document.getElementById('avatarInput');
const avatarImage = document.getElementById('avatarImage');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
let currentAvatarData = null;

function openAccountModal() {
  try {
    const savedName = localStorage.getItem('gemora_name');
    const savedEmail = localStorage.getItem('gemora_email');
    const savedAvatar = localStorage.getItem('gemora_avatar');
    if (savedName) nameInput.value = savedName;
    if (savedEmail) emailInput.value = savedEmail;
    if (savedAvatar) {
      currentAvatarData = savedAvatar;
      avatarImage.src = savedAvatar;
      avatarImage.classList.add('has-image');
      avatarPlaceholder.style.display = 'none';
    }
  } catch (err) {}
  accountModal.classList.add('open');
  document.body.classList.add('modal-open');
  modalSuccess.classList.remove('show');
}

function closeAccountModal() {
  accountModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

if (userAvatar) userAvatar.addEventListener('click', (e) => { e.preventDefault(); openAccountModal(); });
if (modalOverlay) modalOverlay.addEventListener('click', closeAccountModal);
if (modalClose) modalClose.addEventListener('click', closeAccountModal);

/* ============ رفع الصورة ============ */
if (avatarInput) {
  avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const resizedData = await resizeImage(file, 300);
    currentAvatarData = resizedData;
    avatarImage.src = resizedData;
    avatarImage.classList.add('has-image');
    avatarPlaceholder.style.display = 'none';
  });
}

function resizeImage(file, maxSize = 300) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ============ حفظ الحساب ============ */
if (accountForm) {
  accountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (!name || !email) return;

    try {
      localStorage.setItem('gemora_name', name);
      localStorage.setItem('gemora_email', email);
      localStorage.setItem('gemora_subscribed', 'true');
      if (currentAvatarData) localStorage.setItem('gemora_avatar', currentAvatarData);
    } catch (err) { alert('حدثت مشكلة في الحفظ'); return; }

    updateUserAvatar();
    modalSuccess.classList.add('show');

    showToast(
      (currentLang === 'ar') ? '🎉 تم حفظ بياناتك!' : '🎉 Saved!',
      (currentLang === 'ar') ? `أهلاً ${name}!` : `Welcome ${name}!`,
      3500
    );

    const tgMessage =
      `👤 <b>عميل جديد سجل في GEMORA</b>\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>الاسم:</b> ${name}\n` +
      `📧 <b>الإيميل:</b> ${email}\n` +
      `🕐 <b>التاريخ:</b> ${new Date().toLocaleString('ar-EG')}`;

    sendTelegram(tgMessage);

    setTimeout(() => {
      closeAccountModal();
      modalSuccess.classList.remove('show');
    }, 1800);
  });
}

/* ============ النشرة البريدية ============ */
const newsletterForm = document.getElementById('newsletterForm');
const newsletterSection = document.querySelector('.newsletter');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailIn = newsletterForm.querySelector('input[type="email"]');
    const email = emailIn.value.trim();
    if (!email) return;
    if (newsletterSection) newsletterSection.classList.add('hidden');
    try {
      localStorage.setItem('gemora_email', email);
      localStorage.setItem('gemora_subscribed', 'true');
    } catch (err) {}
    updateUserAvatar();
    showToast((currentLang === 'ar') ? '🎉 تم الاشتراك!' : '🎉 Subscribed!', email);

    const tgMessage =
      `📧 <b>مشترك جديد في النشرة البريدية</b>\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `📧 <b>الإيميل:</b> ${email}\n` +
      `🕐 <b>التاريخ:</b> ${new Date().toLocaleString('ar-EG')}`;
    sendTelegram(tgMessage);

    emailIn.value = '';
  });
}
try {
  if (localStorage.getItem('gemora_subscribed') === 'true' && newsletterSection) {
    newsletterSection.classList.add('hidden');
  }
} catch (err) {}

/* ============ نظام السلة ============ */
const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItemsBox = document.getElementById('cartItems');
const cartSubtitle = document.getElementById('cartSubtitle');
const cartTotalBox = document.getElementById('cartTotalBox');
const cartTotal = document.getElementById('cartTotal');

let cart = [];
try {
  const saved = localStorage.getItem('gemora_cart');
  if (saved) cart = JSON.parse(saved);
} catch (err) { cart = []; }

function saveCart() {
  try { localStorage.setItem('gemora_cart', JSON.stringify(cart)); } catch (err) {}
}
function getTotalCount() { return cart.reduce((sum, item) => sum + item.qty, 0); }
function getTotalPrice() { return cart.reduce((sum, item) => sum + (item.price * item.qty), 0); }
function getShipping() {
  const subtotal = getTotalPrice();
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
}
function getGrandTotal() { return getTotalPrice() + getShipping(); }

function updateBadge() {
  if (!cartBadge) return;
  const count = getTotalCount();
  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
}
function bumpCart() {
  if (!cartBtn) return;
  cartBtn.classList.remove('bump');
  void cartBtn.offsetWidth;
  cartBtn.classList.add('bump');
  setTimeout(() => cartBtn.classList.remove('bump'), 600);
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  saveCart(); updateBadge(); bumpCart(); renderCart();
  const name = (currentLang === 'ar') ? product.nameAr : product.nameEn;
  showToast((currentLang === 'ar') ? '✅ تمت الإضافة!' : '✅ Added!', name, 2000);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(); updateBadge(); renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateBadge(); renderCart();
}

function renderCart() {
  if (!cartItemsBox) return;
  if (cart.length === 0) {
    cartItemsBox.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>${currentLang === 'ar' ? 'السلة فاضية' : 'Cart is empty'}</h3>
        <p>${currentLang === 'ar' ? 'ضيف منتجات عشان تشوفها هنا' : 'Add products to see them here'}</p>
      </div>
    `;
    if (cartTotalBox) cartTotalBox.style.display = 'none';
    if (cartSubtitle) cartSubtitle.textContent = (currentLang === 'ar') ? 'لديك 0 منتج' : 'You have 0 items';
    return;
  }
  cartItemsBox.innerHTML = cart.map(item => {
    const name = (currentLang === 'ar') ? item.nameAr : item.nameEn;
    const priceText = (currentLang === 'ar') ? `${item.price.toLocaleString('en-US')} ج.م` : `${item.price.toLocaleString('en-US')} EGP`;
    return `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${item.img}" alt=""></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-price">${priceText}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">🗑</button>
      </div>
    `;
  }).join('');
  if (cartTotalBox) {
    cartTotalBox.style.display = 'block';
    const total = getTotalPrice();
    cartTotal.textContent = (currentLang === 'ar') ? `${total.toLocaleString('en-US')} ج.م` : `${total.toLocaleString('en-US')} EGP`;
  }
  if (cartSubtitle) {
    const count = getTotalCount();
    cartSubtitle.textContent = (currentLang === 'ar') ? `لديك ${count} ${count === 1 ? 'منتج' : 'منتجات'}` : `You have ${count} ${count === 1 ? 'item' : 'items'}`;
  }
}

function openCartModal() {
  renderCart();
  cartModal.classList.add('open');
  document.body.classList.add('modal-open');
}
function closeCartModal() {
  cartModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

if (cartBtn) cartBtn.addEventListener('click', openCartModal);
if (cartOverlay) cartOverlay.addEventListener('click', closeCartModal);
if (cartClose) cartClose.addEventListener('click', closeCartModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (cartModal && cartModal.classList.contains('open')) closeCartModal();
    if (accountModal && accountModal.classList.contains('open')) closeAccountModal();
    if (paymentModal && paymentModal.classList.contains('open')) closePaymentModal();
    if (returnModal && returnModal.classList.contains('open')) closeReturnModal();
  }
});

/* ============ نظام الدفع ============ */
const paymentModal = document.getElementById('paymentModal');
const paymentOverlay = document.getElementById('paymentOverlay');
const paymentClose = document.getElementById('paymentClose');
const paymentForm = document.getElementById('paymentForm');
const payItemsCount = document.getElementById('payItemsCount');
const paySubtotal = document.getElementById('paySubtotal');
const payShipping = document.getElementById('payShipping');
const payTotalPrice = document.getElementById('payTotalPrice');

const payName = document.getElementById('payName');
const payPhone = document.getElementById('payPhone');
const payAddress = document.getElementById('payAddress');
const paySubmitBtn = document.getElementById('paySubmitBtn');

function openPaymentModal() {
  if (cart.length === 0) return;

  const count = getTotalCount();
  const subtotal = getTotalPrice();
  const shipping = getShipping();
  const grand = getGrandTotal();

  payItemsCount.textContent = count;
  paySubtotal.textContent = (currentLang === 'ar') ? `${subtotal.toLocaleString('en-US')} ج.م` : `${subtotal.toLocaleString('en-US')} EGP`;

  if (shipping === 0) {
    payShipping.innerHTML = (currentLang === 'ar') ? '<span class="shipping-free">🎁 مجاني</span>' : '<span class="shipping-free">🎁 FREE</span>';
  } else {
    payShipping.textContent = (currentLang === 'ar') ? `${shipping} ج.م` : `${shipping} EGP`;
  }

  payTotalPrice.textContent = (currentLang === 'ar') ? `${grand.toLocaleString('en-US')} ج.م` : `${grand.toLocaleString('en-US')} EGP`;

  const savedPayment = localStorage.getItem('gemora_payment') || 'cash';
  const payRadio = document.querySelector(`input[name="paymentPay"][value="${savedPayment}"]`);
  if (payRadio) payRadio.checked = true;

  updatePaymentReceiveInfo(savedPayment);
  showPayFields(savedPayment);

  try {
    const savedName = localStorage.getItem('gemora_name');
    if (savedName) payName.value = savedName;
  } catch (err) {}

  paymentModal.classList.add('open');
  document.body.classList.add('modal-open');
  if (cartModal) closeCartModal();
}

function closePaymentModal() {
  paymentModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

if (paymentOverlay) paymentOverlay.addEventListener('click', closePaymentModal);
if (paymentClose) paymentClose.addEventListener('click', closePaymentModal);

/* ============ تنفيذ الدفع ============ */
if (paymentForm) {
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = payName.value.trim();
    const phone = payPhone.value.trim();
    const address = payAddress.value.trim();

    const selectedRadio = document.querySelector('input[name="paymentPay"]:checked');
    const savedPayment = selectedRadio ? selectedRadio.value : 'cash';
    const payMethodText = paymentNames[savedPayment][currentLang];

    const subtotal = getTotalPrice();
    const shipping = getShipping();
    const grand = getGrandTotal();
    const count = getTotalCount();

    if (!name || !phone || !address) {
      showToast('⚠️ ناقص بيانات', 'من فضلك املأ كل البيانات', 2500);
      return;
    }

    let senderNumber = '';
    if (savedPayment === 'instapay') {
      senderNumber = document.getElementById('instapaySender').value.trim();
      if (senderNumber.length < 11) { showToast('⚠️ رقم غلط', 'أدخل رقم المحول منه كامل', 2500); return; }
    } else if (savedPayment === 'vodafone') {
      senderNumber = document.getElementById('vodafoneSender').value.trim();
      if (senderNumber.length < 11) { showToast('⚠️ رقم غلط', 'أدخل رقم فودافون كامل', 2500); return; }
    }

    paySubmitBtn.classList.add('loading');
    paySubmitBtn.disabled = true;

    const productsList = cart.map(item => {
      const itemName = (currentLang === 'ar') ? item.nameAr : item.nameEn;
      return `• ${itemName} × ${item.qty} = ${(item.price * item.qty).toLocaleString('en-US')} ج.م`;
    }).join('\n');

    const shippingText = shipping === 0 ? '🎁 مجاني' : `${shipping} ج.م`;

    let senderInfo = '';
    if (senderNumber) {
      senderInfo = `📲 <b>رقم المحول منه:</b> ${senderNumber}\n`;
    }

    const tgMessage =
      `🛒 <b>أوردر جديد من GEMORA</b>\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>الاسم:</b> ${name}\n` +
      `📱 <b>الموبايل:</b> ${phone}\n` +
      `📍 <b>العنوان:</b> ${address}\n` +
      `💳 <b>طريقة الدفع:</b> ${payMethodText}\n` +
      senderInfo +
      `━━━━━━━━━━━━━━━━━\n` +
      `📦 <b>المنتجات:</b>\n${productsList}\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `📊 <b>عدد المنتجات:</b> ${count}\n` +
      `💰 <b>الإجمالي الفرعي:</b> ${subtotal.toLocaleString('en-US')} ج.م\n` +
      `🚚 <b>الشحن:</b> ${shippingText}\n` +
      `💵 <b>الإجمالي النهائي:</b> ${grand.toLocaleString('en-US')} ج.م\n` +
      `🕐 <b>التاريخ:</b> ${new Date().toLocaleString('ar-EG')}`;

    await sendTelegram(tgMessage);

    paySubmitBtn.classList.remove('loading');
    paySubmitBtn.disabled = false;

    showToast(
      (currentLang === 'ar') ? '🎉 تم استلام طلبك!' : '🎉 Order Received!',
      (currentLang === 'ar')
        ? `شكراً ${name}! هنتواصل معاك قريب`
        : `Thanks ${name}! We'll contact you soon`,
      4000
    );

    setTimeout(() => {
      cart = [];
      saveCart();
      updateBadge();
      renderCart();
      closePaymentModal();
      paymentForm.reset();
    }, 2000);
  });
}

/* ============ زرار "إتمام الشراء" ============ */
const cartCheckout = document.getElementById('cartCheckout');
if (cartCheckout) {
  cartCheckout.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('🛒 السلة فاضية', 'ضيف منتجات الأول', 2500);
      return;
    }
    closeCartModal();
    setTimeout(openPaymentModal, 400);
  });
}

/* ============ ربط أزرار "أضف للسلة" ============ */
document.querySelectorAll('.btn-small').forEach(button => {
  button.addEventListener('click', () => {
    addToCart({
      id: button.dataset.id,
      nameAr: button.dataset.nameAr,
      nameEn: button.dataset.nameEn,
      price: Number(button.dataset.price),
      img: button.dataset.img
    });
    const originalText = button.textContent;
    button.textContent = (currentLang === 'ar') ? 'تمت الإضافة ✓' : 'Added ✓';
    button.style.background = 'var(--gold)';
    button.style.color = 'var(--white)';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 1500);
  });
});

/* ============ تشغيل أول مرة ============ */
updateBadge();
renderCart();