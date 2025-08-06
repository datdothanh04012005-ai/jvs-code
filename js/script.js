const collections = {
  "Calatrava": [
    { name: "Calatrava Classic 5227", price: 1500000000, image: "image/5227.jpg", description: "Classic elegance with gold case.", id: "5227" },
    { name: "Calatrava Elegance 5196", price: 1400000000, image: "image/5196..jpg", description: "Timeless design with blue dial.", id: "5196" }
  ],
  "Nautilus": [
    { name: "Nautilus Sport 5711", price: 1200000000, image: "image/5711.jpg", description: "Stainless steel sporty look.", id: "5711" },
    { name: "Nautilus Chrono 5980", price: 1800000000, image: "image/5980.jpg", description: "Chronograph with blue dial.", id: "5980" }
  ],
  "Grand Complications": [
    { name: "Grand Perpetual 5205", price: 2200000000, image: "image/5205.jpg", description: "Perpetual calendar with moon phase.", id: "5205" },
    { name: "Grand Chrono 5270", price: 2500000000, image: "image/5270.jpg", description: "Chronograph perpetual calendar.", id: "5270" }
  ]
};

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let loggedInUser = null;

// Clear stored login state on page load
localStorage.removeItem("loggedInUser");

// Update login button text if user is logged in
if (loggedInUser) {
  document.getElementById("login-btn").textContent = loggedInUser;
} else {
  document.getElementById("login-btn").textContent = "Login";
}

function addWatchToCart(name, price, image) {
  if (!cart.some(cartItem => cartItem.name === name)) {
    cart.push({ name, price, image });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`Added ${name} to your cart!`);
  } else {
    alert(`${name} is already in your cart!`);
  }
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  localStorage.setItem("cart", JSON.stringify(cart));
  showCartModal(); // Refresh cart modal
}

function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  showCartModal(); // Refresh cart modal
}

function showProductModal(collection, watchId) {
  const product = collections[collection]?.find(item => item.id === watchId);
  if (product) {
    const modal = document.getElementById("product-modal");
    const modalImage = document.getElementById("modal-image");
    const modalName = document.getElementById("modal-name");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");
    const modalAddToCart = document.getElementById("modal-add-to-cart");

    modalImage.src = product.image;
    modalImage.alt = product.name;
    modalName.textContent = product.name;
    modalDescription.textContent = product.description;
    modalPrice.textContent = `${product.price.toLocaleString('vi-VN')} VND`;
    modalAddToCart.onclick = () => addWatchToCart(product.name, product.price, product.image);

    modal.style.display = "flex";
  } else {
    console.error(`Product not found: ${collection} - ${watchId}`);
  }
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  modal.style.display = "none";
}

function showLoginModal() {
  const modal = document.getElementById("login-modal");
  modal.style.display = "flex";
}

function closeLoginModal() {
  const modal = document.getElementById("login-modal");
  modal.style.display = "none";
}

function showCartModal() {
  const modal = document.getElementById("cart-modal");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  cartItems.innerHTML = "";
  let totalPrice = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-center">Cart empty.</p>';
  } else {
    cart.forEach(item => {
      totalPrice += item.price;
      const cartItem = `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="price">${item.price.toLocaleString('vi-VN')} VND</p>
          </div>
          <button class="remove-item-btn" onclick="removeFromCart('${item.name}')">delete</button>
        </div>
      `;
      cartItems.innerHTML += cartItem;
    });
  }

  cartTotal.textContent = `Tổng: ${totalPrice.toLocaleString('vi-VN')} VND`;
  modal.style.display = "flex";
}

function closeCartModal() {
  const modal = document.getElementById("cart-modal");
  modal.style.display = "none";
}

// Search functionality with suggestions
const searchForm = document.querySelector(".search-bar form");
const searchInput = document.querySelector("#search-input");
const suggestionsContainer = document.querySelector("#suggestions");
const collectionGrid = document.querySelector("#collection-grid");

if (searchForm && searchInput && suggestionsContainer) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    suggestionsContainer.innerHTML = "";
    
    if (query.length === 0) {
      suggestionsContainer.classList.remove("active");
      return;
    }

    const suggestions = [];
    Object.keys(collections).forEach(collection => {
      collections[collection].forEach(item => {
        if (item.name.toLowerCase().includes(query) || collection.toLowerCase().includes(query)) {
          suggestions.push({ ...item, collection });
        }
      });
    });

    if (suggestions.length > 0) {
      suggestionsContainer.classList.add("active");
      suggestions.forEach(item => {
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion-item");
        suggestionItem.textContent = item.name;
        suggestionItem.dataset.watchId = item.id;
        suggestionItem.dataset.collection = item.collection;
        suggestionItem.addEventListener("click", () => {
          if (document.getElementById("product-modal")) {
            showProductModal(item.collection, item.id);
            suggestionsContainer.classList.remove("active");
            searchInput.value = item.name;
          } else {
            window.location.href = `collections.html?watch=${item.id}`;
          }
        });
        suggestionsContainer.appendChild(suggestionItem);
      });
    } else {
      suggestionsContainer.classList.remove("active");
    }
  });

  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target)) {
      suggestionsContainer.classList.remove("active");
    }
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.toLowerCase();
    if (collectionGrid) {
      collectionGrid.innerHTML = "";
      const filteredCollections = Object.keys(collections).filter(collection =>
        collection.toLowerCase().includes(query)
      ).map(collection => ({
        name: collection,
        items: collections[collection]
      }));

      filteredCollections.forEach(collection => {
        collection.items.forEach(item => {
          const watchCard = `
            <div class="watch-card" data-collection="${collection.name}" data-watch="${item.id}">
              <div class="collection-image" onclick="showProductModal('${collection.name}', '${item.id}')">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
              </div>
              <div class="watch-info">
                <span class="collection-badge">${collection.name}</span>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="price">${item.price.toLocaleString('vi-VN')} VND</p>
                <button class="add-to-cart-btn" onclick="addWatchToCart('${item.name}', ${item.price}, '${item.image}')">Add to Cart</button>
              </div>
            </div>
          `;
          collectionGrid.innerHTML += watchCard;
        });
      });

      if (filteredCollections.length === 0) {
        collectionGrid.innerHTML = '<p class="text-center">No collections found.</p>';
      }
    } else {
      window.location.href = `collections.html?search=${encodeURIComponent(query)}`;
    }
  });
}

// Handle query parameters on collections page load
if (collectionGrid && window.location.search) {
  const urlParams = new URLSearchParams(window.location.search);
  const watchId = urlParams.get("watch");
  const searchQuery = urlParams.get("search");

  if (watchId) {
    const collection = Object.keys(collections).find(col =>
      collections[col].some(item => item.id === watchId)
    );
    if (collection) {
      showProductModal(collection, watchId);
    }
  } else if (searchQuery) {
    collectionGrid.innerHTML = "";
    const filteredCollections = Object.keys(collections).filter(collection =>
      collection.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(collection => ({
      name: collection,
      items: collections[collection]
    }));

    filteredCollections.forEach(collection => {
      collection.items.forEach(item => {
        const watchCard = `
          <div class="watch-card" data-collection="${collection.name}" data-watch="${item.id}">
            <div class="collection-image" onclick="showProductModal('${collection.name}', '${item.id}')">
              <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="watch-info">
              <span class="collection-badge">${collection.name}</span>
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <p class="price">${item.price.toLocaleString('vi-VN')} VND</p>
              <button class="add-to-cart-btn" onclick="addWatchToCart('${item.name}', ${item.price}, '${item.image}')">Add to Cart</button>
            </div>
          </div>
        `;
        collectionGrid.innerHTML += watchCard;
      });
    });

    if (filteredCollections.length === 0) {
      collectionGrid.innerHTML = '<p class="text-center">No collections found.</p>';
    }
  }
}

// Login form submission
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("login-name").value.trim();
    const password = document.getElementById("login-password").value.trim();
    if (name.length > 0 && password.length > 0) {
      localStorage.setItem("loggedInUser", name);
      document.getElementById("login-btn").textContent = name;
      alert("Login successful!");
      closeLoginModal();
    } else {
      alert("Please enter both name and password!");
    }
  });
}

// Cart checkout
const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
    } else {
      alert("buy successfully!");
      clearCart();
    }
  });
}

// Clear cart button
const clearCartBtn = document.getElementById("clear-cart-btn");
if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
    } else {
      clearCart();
      alert("removed all in cart!");
    }
  });
}

// Login button
document.getElementById("login-btn").addEventListener("click", () => {
  if (!loggedInUser) {
    showLoginModal();
  } else {
    alert(`login with name: ${loggedInUser}`);
  }
});

// Cart button
const wishlistBtn = document.getElementById("wishlist-btn");
if (wishlistBtn) {
  wishlistBtn.addEventListener("click", () => {
    showCartModal();
  });
}

// Contact form submission
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = contactForm.querySelector("input[type='text']").value;
    const email = contactForm.querySelector("input[type='email']").value;
    const message = contactForm.querySelector("textarea").value;
    alert(`Thank you, ${name}! Your message has been sent.`);
    contactForm.reset();
  });
}