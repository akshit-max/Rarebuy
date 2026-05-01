import { onUserStateChange, loginWithEmail, signupWithEmail, loginWithGoogle, logout, currentUser, currentProfile } from './auth.js';
import { listenToAuctions, onProductsUpdate, placeBid } from './auction.js';
import { submitKYC } from './kyc.js';

// ---- Inject CSS ----
const style = document.createElement('style');
style.innerHTML = `
  /* Webflow Neutral Modals */
  .custom-modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    display: none; align-items: center; justify-content: center; z-index: 99999;
  }
  .custom-modal {
    background: #fff; padding: 32px; border-radius: 8px; max-width: 400px; width: 100%;
    font-family: inherit; color: #333; box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  .custom-modal h2 { margin-top: 0; font-size: 24px; color: #111; }
  .custom-input { width: 100%; padding: 12px; margin: 8px 0 16px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-family: inherit; }
  .custom-btn { width: 100%; padding: 14px; background: #111; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; transition: opacity 0.2s; }
  .custom-btn:hover { opacity: 0.8; }
  .custom-btn-outline { background: transparent; color: #111; border: 1px solid #111; margin-top: 10px; }
  .modal-close { background: none; border: none; cursor: pointer; float: right; font-size: 20px; }
  
  /* Auction Cards (Fallback grid if Webflow doesn't override) */
  #auction-root { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  .auction-card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: #fff; transition: transform 0.2s; }
  .auction-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
  .auction-card img { width: 100%; height: 200px; object-fit: cover; }
  .auction-content { padding: 20px; }
  .auction-title { font-size: 18px; margin: 0 0 10px; font-weight: bold; }
  .auction-bid { font-size: 16px; color: #666; margin-bottom: 10px; }
  .auction-timer { font-size: 14px; color: #e53e3e; margin-bottom: 16px; font-weight: 500; }
`;
document.head.appendChild(style);

// ---- Setup Modals ----
function createModal(id, innerHTML) {
  const backdrop = document.createElement('div');
  backdrop.id = id;
  backdrop.className = 'custom-modal-backdrop';
  backdrop.innerHTML = `
    <div class="custom-modal">
      <button class="modal-close" onclick="document.getElementById('${id}').style.display='none'">&times;</button>
      ${innerHTML}
    </div>
  `;
  document.body.appendChild(backdrop);
}

// 1. Auth Modal
createModal('auth-modal', `
  <h2 id="auth-title">Log In</h2>
  <div id="auth-error" style="color:red; font-size: 12px; margin-bottom: 10px;"></div>
  <input type="email" id="auth-email" class="custom-input" placeholder="Email Address">
  <input type="password" id="auth-password" class="custom-input" placeholder="Password">
  <button id="auth-action-btn" class="custom-btn">Log In</button>
  <button id="auth-google-btn" class="custom-btn custom-btn-outline">Sign in with Google</button>
  <p style="text-align: center; margin-top: 16px; font-size: 14px;">
    <a href="#" id="auth-toggle-link" style="color:#111;">Need an account? Sign Up</a>
  </p>
`);

// 2. KYC Modal
createModal('kyc-modal', `
  <h2>Identity Verification</h2>
  <p style="font-size:14px; color:#666;">Please verify your identity to place bids.</p>
  <div id="kyc-error" style="color:red; font-size: 12px; margin-bottom: 10px;"></div>
  <label>Full Name</label>
  <input type="text" id="kyc-name" class="custom-input" placeholder="Your Legal Name">
  <label>Upload ID (Passport/License)</label>
  <input type="file" id="kyc-id" class="custom-input" accept="image/*">
  <label>Upload Selfie</label>
  <input type="file" id="kyc-selfie" class="custom-input" accept="image/*">
  <button id="kyc-action-btn" class="custom-btn">Submit KYC</button>
`);

// 3. Bid Modal
createModal('bid-modal', `
  <h2>Place Bid</h2>
  <p id="bid-product-name"></p>
  <p>Current Highest: <strong id="bid-current-amount"></strong></p>
  <div id="bid-error" style="color:red; font-size: 12px; margin-bottom: 10px;"></div>
  <input type="number" id="bid-amount" class="custom-input" placeholder="Enter bid amount...">
  <button id="bid-action-btn" class="custom-btn">Confirm Bid</button>
`);

// ---- Auth Modal Logic ----
let isSignUpMode = false;
document.getElementById('auth-toggle-link').addEventListener('click', (e) => {
  e.preventDefault();
  isSignUpMode = !isSignUpMode;
  document.getElementById('auth-title').innerText = isSignUpMode ? 'Sign Up' : 'Log In';
  document.getElementById('auth-action-btn').innerText = isSignUpMode ? 'Sign Up' : 'Log In';
  e.target.innerText = isSignUpMode ? 'Already have an account? Log In' : 'Need an account? Sign Up';
});

document.getElementById('auth-action-btn').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;
  document.getElementById('auth-error').innerText = '';
  try {
    if (isSignUpMode) {
      await signupWithEmail(email, pass);
    } else {
      await loginWithEmail(email, pass);
    }
    document.getElementById('auth-modal').style.display = 'none';
  } catch(err) {
    document.getElementById('auth-error').innerText = err.message;
  }
});

document.getElementById('auth-google-btn').addEventListener('click', async () => {
  try {
    await loginWithGoogle();
    document.getElementById('auth-modal').style.display = 'none';
  } catch(err) {
    document.getElementById('auth-error').innerText = err.message;
  }
});

// ---- KYC Modal Logic ----
document.getElementById('kyc-action-btn').addEventListener('click', async () => {
  const name = document.getElementById('kyc-name').value;
  const idFile = document.getElementById('kyc-id').files[0];
  const selfieFile = document.getElementById('kyc-selfie').files[0];
  const btn = document.getElementById('kyc-action-btn');
  
  if (!name || !idFile || !selfieFile) {
    document.getElementById('kyc-error').innerText = "Please complete all fields.";
    return;
  }

  btn.innerText = "Submitting...";
  btn.disabled = true;

  try {
    await submitKYC(name, idFile, selfieFile);
    document.getElementById('kyc-modal').style.display = 'none';
    alert("KYC submitted successfully. Awaiting approval.");
  } catch(err) {
    document.getElementById('kyc-error').innerText = err.message;
  } finally {
    btn.innerText = "Submit KYC";
    btn.disabled = false;
  }
});

// ---- Bid Modal Logic ----
let currentBidProductId = null;
let currentBidMinAmount = 0;

export function openBidModal(product) {
  if (!currentUser) {
    document.getElementById('auth-modal').style.display = 'flex';
    return;
  }
  
  if (currentProfile?.kycStatus !== 'verified') {
    if (currentProfile?.kycStatus === 'pending') {
      alert("Your KYC is currently pending approval. You cannot bid yet.");
      return;
    }
    document.getElementById('kyc-modal').style.display = 'flex';
    return;
  }

  currentBidProductId = product.id;
  currentBidMinAmount = product.currentBid || product.basePrice;
  document.getElementById('bid-product-name').innerText = "Bidding on: " + product.name;
  document.getElementById('bid-current-amount').innerText = "$" + currentBidMinAmount;
  document.getElementById('bid-error').innerText = '';
  document.getElementById('bid-amount').value = currentBidMinAmount + 1;
  document.getElementById('bid-modal').style.display = 'flex';
}

document.getElementById('bid-action-btn').addEventListener('click', async () => {
  const amount = parseFloat(document.getElementById('bid-amount').value);
  const btn = document.getElementById('bid-action-btn');
  document.getElementById('bid-error').innerText = '';

  if (isNaN(amount) || amount <= currentBidMinAmount) {
    document.getElementById('bid-error').innerText = "Bid must be higher than current highest bid.";
    return;
  }

  btn.innerText = "Placing Bid...";
  btn.disabled = true;

  try {
    await placeBid(currentBidProductId, amount);
    document.getElementById('bid-modal').style.display = 'none';
    alert("Bid placed successfully!");
  } catch (err) {
    document.getElementById('bid-error').innerText = err.message;
  } finally {
    btn.innerText = "Confirm Bid";
    btn.disabled = false;
  }
});


// ---- Products Rendering ----
const productsData = new Map();

function formatTime(endTime) {
  if (!endTime) return "No timer string";
  let target = endTime;
  if (endTime.toDate) target = endTime.toDate();
  else target = new Date(endTime);
  
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return "Auction Ended";
  
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function renderProducts() {
  const root = document.getElementById('auction-root');
  if (!root) return;

  root.innerHTML = '';
  const list = Array.from(productsData.values());
  if (list.length === 0) {
    root.innerHTML = '<p>No active auctions.</p>';
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'auction-card';
    
    // Timer element setup
    const timerId = 'timer-' + item.id;
    let timerInterval = null;
    
    card.innerHTML = `
      <img src="${item.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${item.name}">
      <div class="auction-content">
        <h3 class="auction-title">${item.name}</h3>
        <p class="auction-bid">Current Bid: <strong>$${item.currentBid || item.basePrice}</strong></p>
        <div class="auction-timer" id="${timerId}">${formatTime(item.endTime)}</div>
        <button class="custom-btn bid-trigger" data-id="${item.id}">Place Bid</button>
      </div>
    `;
    root.appendChild(card);

    if (item.endTime) {
      timerInterval = setInterval(() => {
        const el = document.getElementById(timerId);
        if (el) {
          const t = formatTime(item.endTime);
          el.innerText = t;
          if (t === "Auction Ended") {
            clearInterval(timerInterval);
            el.nextElementSibling.disabled = true; // disable bid btn
          }
        } else {
          clearInterval(timerInterval);
        }
      }, 1000);
    }

    card.querySelector('.bid-trigger').addEventListener('click', () => {
      openBidModal(item);
    });
  });
}

onProductsUpdate((items) => {
  items.forEach(i => productsData.set(i.id, i));
  renderProducts();
});

// Setup dynamic user status injection to a hypothetical navigation class
onUserStateChange((user, profile) => {
  // Can be bound later to Webflow native user menu
 
});

// Initialize fetching
document.addEventListener('DOMContentLoaded', () => {
  listenToAuctions();
});
