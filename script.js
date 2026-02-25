// Loader
window.addEventListener("load", () => {
    document.getElementById("loader").style.display = "none";
});

// Mobile Menu
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
    navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
});

// Scroll To Top
const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
    scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Use shared products from products.js (window.products)
const grid = document.getElementById("productGrid");

function renderProducts(list){
    if(!grid) return;
    grid.innerHTML="";
    if(!list.length){
        grid.innerHTML = `<p class="text-center text-gray-500 col-span-full">No products found for your search.</p>`;
        return;
    }
    list.forEach(p=>{
        const discount = p.oldPrice ? Math.round((1 - p.price/p.oldPrice) * 100) : 0;
        grid.innerHTML += `
        <div class="product-card">
            <img src="${p.image||''}" alt="${p.title}" style="width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:10px;">
            <h3 class="font-bold">${p.title}</h3>
            <p class="text-sm text-gray-600">${p.desc}</p>
            <div class="mt-2">
                <span class="text-blue-600 font-bold">$${p.price}</span>
                <span class="line-through text-gray-400">$${p.oldPrice}</span>
                <span class="discount-badge">-${discount}%</span>
            </div>
            <a href="product.html?id=${p.id}" class="btn-primary mt-3 inline-block">View Details</a>
        </div>
        `;
    });
}

if(window.products) renderProducts(window.products);

// Search
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const searchSuggestions = document.getElementById("searchSuggestions");

function normalizeText(value){
    return (value || "").toString().toLowerCase().trim();
}

function tokenize(value){
    return normalizeText(value).split(/\s+/).filter(Boolean);
}

function buildSearchText(product){
    const chunks = [
        product.title,
        product.desc,
        product.category,
        ...(Array.isArray(product.keywords) ? product.keywords : [])
    ];
    return normalizeText(chunks.join(" "));
}

function matchesProduct(product, query){
    const searchText = buildSearchText(product);
    const tokens = tokenize(query);
    if(!tokens.length) return true;

    // Each token must exist in any searchable field. Supports 2+ letter partial search.
    return tokens.every(token => searchText.includes(token));
}

if(searchInput){
    searchInput.addEventListener("input",(e)=>{
        const query = e.target.value;
        const trimmed = query.trim();

        if(!searchSuggestions) return;
        if(!trimmed){
            searchSuggestions.style.display = "none";
            searchSuggestions.innerHTML = "";
            return;
        }

        const matches = (window.products||[])
            .filter(p => matchesProduct(p, query))
            .slice(0, 6);

        if(!matches.length){
            searchSuggestions.innerHTML = `<div class="search-suggestion-empty">No matching products</div>`;
            searchSuggestions.style.display = "block";
            return;
        }

        searchSuggestions.innerHTML = matches.map(p => `
            <a class="search-suggestion-link" href="product.html?id=${p.id}" data-product-id="${p.id}">
                <span class="search-suggestion-title">${p.title}</span>
                <span class="search-suggestion-meta">${p.category || "Product"}</span>
            </a>
        `).join("");
        searchSuggestions.style.display = "block";
    });

    searchInput.addEventListener("focus", () => {
        if(searchSuggestions && searchSuggestions.innerHTML){
            searchSuggestions.style.display = "block";
        }
    });

    searchInput.addEventListener("blur", () => {
        if(!searchSuggestions) return;
        setTimeout(() => {
            searchSuggestions.style.display = "none";
        }, 150);
    });
}

if(searchForm){
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = (searchInput?.value || "").trim();
        if(!query) return;
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    });
}

if(searchSuggestions){
    // Use mousedown so navigation happens before input blur hides the dropdown.
    searchSuggestions.addEventListener("mousedown", (e) => {
        if(!(e.target instanceof Element)) return;
        const link = e.target.closest(".search-suggestion-link");
        if(!link) return;
        e.preventDefault();
        const id = link.getAttribute("data-product-id");
        if(id){
            window.location.href = `product.html?id=${encodeURIComponent(id)}`;
        }
    });
}

// Modal
const modal = document.getElementById("productModal");
const modalData = document.getElementById("modalData");

function openModal(id){
    const p = (window.products||[]).find(x=>x.id===id);
    if(!p) return;
    modal.style.display="flex";
    modalData.innerHTML=`
        <h2 class="text-2xl font-bold mb-3">${p.title}</h2>
        <img src="${p.image||''}" alt="${p.title}" style="width:100%;max-height:320px;object-fit:cover;border-radius:8px;margin-bottom:12px;">
        <p>${p.desc}</p>
        <div class="mt-3"><strong>Price:</strong> $${p.price} <span class="line-through">$${p.oldPrice}</span></div>
        <a href="${p.link}" target="_blank" class="btn-primary mt-4 inline-block">
            Buy Now
        </a>
    `;
}

document.getElementById("closeModal").onclick = ()=> modal.style.display="none";

window.onclick = (e)=>{
    if(e.target === modal) modal.style.display="none";
};
