const API = "https://rarebuy.onrender.com/api";

// 🔒 PROTECT PAGE
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  window.location.href = "login.html";
}


// ➕ ADD PRODUCT
async function addProduct() {
  const title = document.getElementById("title").value;
  const file = document.getElementById("image").files[0];
  const price = document.getElementById("price").value;
  const isAuction = document.getElementById("isAuction").checked;
const endTimeValue = document.getElementById("endTime").value;
const endTime = endTimeValue || null;

  const msgEl = document.getElementById("msg");

  if (!title || !file) {
    msgEl.innerText = "Title & Image required";
    return;
  }

  msgEl.innerText = "Uploading...";

  try {
    const base64 = await toBase64(file);

    const res = await fetch(`${API}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        title,
        image: base64,
        price,
        isAuction,
        endTime
      })
    });

    const data = await res.json();

    if (res.ok) {
      msgEl.innerText = "✅ Product added";

      // reset
      document.getElementById("title").value = "";
      document.getElementById("image").value = "";
      document.getElementById("price").value = "";
      document.getElementById("isAuction").checked = false;
      document.getElementById("endTime").value = "";

      loadProducts();

    } else {
      msgEl.innerText = data.msg || "❌ Failed";
    }

  } catch (err) {
    console.error(err);
    msgEl.innerText = "❌ Error occurred";
  }
}


// 🔧 BASE64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}


// 📦 LOAD PRODUCTS (UPDATED UI WITH CRUD)
// async function loadProducts() {
//   try {
//     const res = await fetch(`${API}/products`);
//     const products = await res.json();

//     const container = document.getElementById("productList");
//     container.innerHTML = "";

//     if (!products.length) {
//       container.innerHTML = "<p>No products found</p>";
//       return;
//     }

//     products.forEach(p => {
//       const div = document.createElement("div");

//       div.style = `
//         border:1px solid #333;
//         padding:10px;
//         margin:10px;
//         background:#111;
//         color:#e5d3b3;
//       `;

//       div.innerHTML = `
//         <img src="${p.image}" width="120"><br>
//         <b>${p.title}</b><br>

//         ${
//           p.isAuction
//             ? `🔴 Auction (₹${p.currentBid || 0})`
//             : `🟢 ₹${p.price}`
//         }

//         <br><br>

//         <button onclick="toggleAuction('${p._id}', ${p.isAuction})">
//           ${p.isAuction ? "Disable Auction" : "Enable Auction"}
//         </button>

//         <button onclick="editProduct('${p._id}', '${p.title}', '${p.price || ""}')">
//           Edit
//         </button>

//         <button onclick="deleteProduct('${p._id}')">
//           Delete
//         </button>
//       `;

//       container.appendChild(div);
//     });

//   } catch (err) {
//     console.error(err);
//   }
// }


// async function loadProducts() {
//   try {
//     const res = await fetch(`${API}/products`);
//     const products = await res.json();

//     const container = document.getElementById("productList");
//     container.innerHTML = "";

//     if (!products.length) {
//       container.innerHTML = "<p>No products found</p>";
//       return;
//     }

//     products.forEach(p => {
//       const div = document.createElement("div");
//       div.className = "card";

//       div.innerHTML = `
//         <img src="${p.image}" />

//         <div class="title">${p.title}</div>

//         <div class="price">
//           ${
//             p.isAuction
//               ? `🔴 Auction ₹${p.currentBid || 0}`
//               : `🟢 ₹${p.price}`
//           }
//         </div>

//         <div class="actions">
//           <button onclick="toggleAuction('${p._id}', ${p.isAuction})">
//             ${p.isAuction ? "Disable" : "Auction"}
//           </button>

//           <button onclick="editProduct('${p._id}', '${p.title}', '${p.price || ""}')">
//             Edit
//           </button>

//           <button onclick="deleteProduct('${p._id}')">
//             Delete
//           </button>
//         </div>
//       `;

//       container.appendChild(div);
//     });

//   } catch (err) {
//     console.error(err);
//   }
// }


async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();

    const container = document.getElementById("productList");
    container.innerHTML = "";

    if (!products.length) {
      container.innerHTML = "<p>No products found</p>";
      return;
    }

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="${p.image}" />

        <div class="title">${p.title}</div>

        <div class="price">
          ${
            p.isAuction
              ? `<span style="color:#ff4d4d;">● Auction ₹${p.currentBid || 0}</span>`
              : `<span style="color:#4dff88;">● ₹${p.price}</span>`
          }
        </div>

        <div class="actions">
          <button onclick="toggleAuction('${p._id}', ${p.isAuction})">
            ${p.isAuction ? "Disable" : "Auction"}
          </button>

          <button onclick="editProduct('${p._id}', '${p.title}', '${p.price || ""}')">
            Edit
          </button>

          <button onclick="deleteProduct('${p._id}')">
            Delete
          </button>
        </div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
  }
}

// 🔁 TOGGLE AUCTION

let toggleId = null;
let toggleMode = null;

function toggleAuction(id, currentStatus) {
  toggleId = id;

  const modal = document.getElementById("toggleModal");
  const input = document.getElementById("toggleInput");
  const title = document.getElementById("toggleTitle");

  modal.style.display = "flex";

  if (!currentStatus) {
    toggleMode = "auction";
    title.innerText = "Set Auction End Time";
    input.type = "datetime-local";
    input.value = "";
  } else {
    toggleMode = "price";
    title.innerText = "Set Fixed Price";
    input.type = "number";
    input.value = "";
  }
}

async function confirmToggle() {
  const input = document.getElementById("toggleInput").value;

  if (!input) {
    alert("Value required");
    return;
  }

  let updateData = {};

  if (toggleMode === "auction") {
    updateData = {
      isAuction: true,
      price: null,
      endTime: input
    };
  } else {
    updateData = {
      isAuction: false,
      price: input,
      endTime: null
    };
  }

  await fetch(`${API}/products/${toggleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify(updateData)
  });

  closeToggleModal();
  loadProducts();
}

function closeToggleModal() {
  document.getElementById("toggleModal").style.display = "none";
}


// async function toggleAuction(id, currentStatus) {

  // let updateData = {};

  // if (!currentStatus) {
  //   // 👉 enabling auction → ask time
  //   const endTime = prompt("Enter auction end time (YYYY-MM-DDTHH:MM)");

  //   if (!endTime) {
  //     alert("Time is required for auction");
  //     return;
  //   }

  //   updateData = {
  //     isAuction: true,
  //     price: null,
  //     endTime: endTime
  //   };

  // } else {
  //   // 👉 disabling auction → ask price
  //   const price = prompt("Enter fixed price");

  //   if (!price) {
  //     alert("Price is required");
  //     return;
  //   }

  //   updateData = {
  //     isAuction: false,
  //     price: price,
  //     endTime: null
  //   };
  // }

  // const res = await fetch(`${API}/products/${id}`, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Authorization": token
  //   },
  //   body: JSON.stringify(updateData)
  // });

  // if (res.ok) loadProducts();

  
// }
// async function toggleAuction(id, currentStatus) {
//   const newPrice = currentStatus
//     ? prompt("Enter price for fixed product")
//     : null;

//   const res = await fetch(`${API}/products/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": token
//     },
//     body: JSON.stringify({
//       isAuction: !currentStatus,
//       price: currentStatus ? newPrice : null,
//       endTime: !currentStatus ? new Date(Date.now() + 3600000) : null
//     })
//   });

//   if (res.ok) loadProducts();
// }


// ✏️ EDIT PRODUCT
function editProduct(id, title, price) {
  const newTitle = prompt("Enter new title", title);
  const newPrice = prompt("Enter new price", price);

  if (!newTitle) return;

  updateProduct(id, newTitle, newPrice);
}


// 🔄 UPDATE PRODUCT
async function updateProduct(id, title, price) {
  const res = await fetch(`${API}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({
      title,
      price,
      isAuction: false
    })
  });

  if (res.ok) loadProducts();
}


// 🗑️ DELETE PRODUCT
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  const res = await fetch(`${API}/products/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": token
    }
  });

  if (res.ok) loadProducts();
}


// 🚪 LOGOUT
function logout() {
  localStorage.clear();
  window.location.href = "index.htm";
}


// 🚀 INIT
loadProducts();