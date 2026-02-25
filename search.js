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
    return tokens.every(token => searchText.includes(token));
}

function queryParam(name){
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || "";
}

function renderResults(list){
    const grid = document.getElementById("resultsGrid");
    if(!grid) return;
    grid.innerHTML = "";

    if(!list.length){
        grid.innerHTML = `<p class="text-center text-gray-500 col-span-full">No products found for your search.</p>`;
        return;
    }

    list.forEach(p => {
        const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.image || ""}" alt="${p.title}" style="width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:10px;">
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

const searchInput = document.getElementById("searchPageInput");
const searchForm = document.getElementById("searchPageForm");
const searchMeta = document.getElementById("searchMeta");

function runSearch(query){
    const q = query.trim();
    const allProducts = window.products || [];
    const filtered = q ? allProducts.filter(p => matchesProduct(p, q)) : allProducts;
    renderResults(filtered);

    if(searchMeta){
        if(q){
            searchMeta.textContent = `${filtered.length} result(s) for "${q}"`;
        } else {
            searchMeta.textContent = `Showing all ${filtered.length} products`;
        }
    }
}

const initialQuery = queryParam("q");
if(searchInput){
    searchInput.value = initialQuery;
}
runSearch(initialQuery);

if(searchForm){
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = (searchInput?.value || "").trim();
        const url = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
        window.location.href = url;
    });
}
