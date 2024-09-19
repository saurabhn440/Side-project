// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJdW4i4Ed7WKcj8IFFMi_oXazjjQw4uu8",
    authDomain: "curser-396bc.firebaseapp.com",
    databaseURL: "https://curser-396bc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "curser-396bc",
    storageBucket: "curser-396bc.appspot.com",
    messagingSenderId: "374369933325",
    appId: "1:374369933325:web:ece51b218f87313d4b9d44",
    measurementId: "G-50PE1PLTQ7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Reference to the products in the database
const productsRef = database.ref('products');

// Keep track of selected products
let selectedProducts = new Set();

// Function to create a product block
function createProductBlock(product, id, isAdmin = false) {
    const productBlock = document.createElement('div');
    productBlock.className = 'product-block';
    productBlock.dataset.id = id;

    productBlock.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
        <div class="product-details">
            <div class="product-name">${product.name}</div>
            <div class="product-type">${product.type}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
    `;

    if (isAdmin) {
        productBlock.addEventListener('click', () => toggleAdminSelection(id));
    } else {
        productBlock.addEventListener('click', () => toggleSelection(id));
    }

    return productBlock;
}

// Function to toggle selection for admin
function toggleAdminSelection(id) {
    const productBlock = document.querySelector(`.product-block[data-id="${id}"]`);
    productBlock.classList.toggle('selected');

    if (selectedProducts.has(id)) {
        selectedProducts.delete(id);
    } else {
        selectedProducts.add(id);
    }

    updateDeleteSelectedButton();
}

// Function to update the "Delete Selected" button
function updateDeleteSelectedButton() {
    const deleteSelectedBtn = document.getElementById('delete-selected');
    if (deleteSelectedBtn) {
        if (selectedProducts.size > 0) {
            deleteSelectedBtn.style.display = 'block';
            deleteSelectedBtn.textContent = `Delete Selected (${selectedProducts.size})`;
        } else {
            deleteSelectedBtn.style.display = 'none';
        }
    }
}

// Function to toggle selection for main page
function toggleSelection(id) {
    const productBlock = document.querySelector(`.product-block[data-id="${id}"]`);
    productBlock.classList.toggle('selected');

    if (selectedProducts.has(id)) {
        selectedProducts.delete(id);
    } else {
        selectedProducts.add(id);
    }

    updateCartCount();
}

// Function to update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = selectedProducts.size;
    }
}

// Function to update the product display
function updateProductDisplay(products, isAdmin = false) {
    const container = document.getElementById('product-container');
    if (container) {
        container.innerHTML = '';

        for (const [id, product] of Object.entries(products)) {
            const productBlock = createProductBlock(product, id, isAdmin);
            container.appendChild(productBlock);
        }
    }
}

// Listen for changes in the products data
productsRef.on('value', (snapshot) => {
    const products = snapshot.val();
    const isAdminPage = window.location.pathname.includes('admin.html');
    updateProductDisplay(products, isAdminPage);
});

// Function to add a product (used by the admin panel)
function addProduct() {
    const name = document.getElementById('productName').value;
    const type = document.getElementById('productType').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const imageUrl = document.getElementById('productImage').value;

    if (name && type && !isNaN(price) && imageUrl) {
        productsRef.push({
            name: name,
            type: type,
            price: price,
            imageUrl: imageUrl
        }).then(() => {
            alert('Product added successfully!');
            // Clear the form
            document.getElementById('productName').value = '';
            document.getElementById('productType').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productImage').value = '';
        }).catch((error) => {
            alert('Error adding product: ' + error.message);
        });
    } else {
        alert('Please fill all fields correctly.');
    }
}

// Function to delete selected products
function deleteSelectedProducts() {
    if (confirm(`Are you sure you want to delete ${selectedProducts.size} selected product(s)?`)) {
        const deletePromises = Array.from(selectedProducts).map(id => 
            productsRef.child(id).remove()
        );

        Promise.all(deletePromises)
            .then(() => {
                alert('Selected products deleted successfully!');
                selectedProducts.clear();
                updateDeleteSelectedButton();
            })
            .catch((error) => {
                alert('Error deleting products: ' + error.message);
            });
    }
}

// Add click event to cart icon (you can implement cart view functionality here)
const cartIcon = document.getElementById('cart-icon');
if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        alert(`You have ${selectedProducts.size} item(s) in your cart.`);
    });
}

// Add click event to delete selected button
const deleteSelectedBtn = document.getElementById('delete-selected');
if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', deleteSelectedProducts);
}

// Initialize the delete selected button
updateDeleteSelectedButton();