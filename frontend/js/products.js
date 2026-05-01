const API = "https://rarebuy.onrender.com/api";

async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();

    displayProducts(products);
   

  } catch (err) {
    console.error(err);
  }
}



function displayProducts(products) {
  const container = document.getElementById("products");

  container.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");

    card.style = `
      border:1px solid #333;
      padding:10px;
      margin:10px;
      cursor:pointer;
      width:200px;
    `;

    card.innerHTML = `
      <img src="${product.image}" width="100%">
      <h3>${product.title}</h3>
      <p>
        ${product.isAuction 
          ? "Auction 🔥" 
          : "Price: ₹" + product.price}
      </p>
    `;

    // 👉 CLICK → go to product page
    card.onclick = () => {
      window.location.href = `product.html?id=${product._id}`;
    };

    container.appendChild(card);
  });
}