let filtersBtn = document.getElementById("btnFilters");
let inputPromt = document.getElementById("promtInp");
let sendBtnAi = document.getElementById("sendBtn");
let btnAi = document.getElementById("btnIa");
let profile = document.getElementById("profileIcon");
let cartModalBtn = document.getElementById("cartBtn");
let clearChatBtn = document.getElementById("deleteChat");

let allProducts = document.getElementById("allProducts");
let hoodieBtn = document.getElementById("hoodieBtn");
let outerBtn = document.getElementById("outerBtn");
let accesoriesBtn = document.getElementById("accesoriesBtn");
let footwearBtn = document.getElementById("footwearBtn");

let storeContent = document.getElementById("storeContent");
let chatBox = document.getElementById("chatBox");
let contentIa = document.getElementById("contentIa");
const main = document.getElementById("main");

main.classList.add("chatClosed");
let modal = document.getElementById("modalLogin");
let modalCart = document.getElementById("modalCart");
let modalClose = document.getElementById("modalClose");
let modalCartClose = document.getElementById("modalCartClose");
let modalFilters = document.getElementById("modalFilters");
let modalFiltersClose = document.getElementById("modalFiltersClose");

const hamburgerMenu = document.getElementById("hamburgerMenu");
const listNav = document.getElementById("listNav");

let cartContent = document.getElementById("cartContent");
let cartSubtotal = document.getElementById("cartSubtotal");
let cartIva = document.getElementById("cartIva");
let cartTotal = document.getElementById("cartTotal");
let cartBadge = document.getElementById("cartBadge");

let historialConversacion = [];
let productosGlobal = [];
let productosCart = [];
let productosCargados = false;

const path = "/ElegancIA/front/";

const AUTH_KEY = "elegancIA_users";
const SESSION_KEY = "elegancIA_session";

function getUsers() {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "[]");
}
function saveUsers(users) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}
function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}
function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
function hashSimple(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString(16);
}
function getInitials(name) {
    return name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString("en-US", { year: "numeric", month: "long" });
}
function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.remove("hidden");
}
function clearAuthErrors() {
    document.querySelectorAll(".authError").forEach(e => {
        e.textContent = "";
        e.classList.add("hidden");
    });
}

const mobileNavOverlay = document.getElementById("mobileNavOverlay");
const mobileNavClose = document.getElementById("mobileNavClose");

function openMobileNav() {
    listNav.classList.add("active");
    mobileNavOverlay.classList.add("active");
    mobileNavClose.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeMobileNav() {
    listNav.classList.remove("active");
    mobileNavOverlay.classList.remove("active");
    mobileNavClose.classList.remove("active");
    document.body.style.overflow = "";
}

if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", () => {
        if (listNav.classList.contains("active")) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });
}

mobileNavClose.addEventListener("click", closeMobileNav);
mobileNavOverlay.addEventListener("click", closeMobileNav);

document.querySelectorAll(".navDropTrigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
        if (window.innerWidth > 768) return;
        const item = trigger.closest(".navDropItem");
        const isOpen = item.classList.contains("mobileOpen");
        document.querySelectorAll(".navDropItem").forEach(i => i.classList.remove("mobileOpen"));
        if (!isOpen) item.classList.add("mobileOpen");
    });
});

document.querySelectorAll("[data-filter-nav]").forEach(link => {
    link.addEventListener("click", () => {
        if (window.innerWidth <= 768) closeMobileNav();
    });
});

function switchToTab(tab) {
    clearAuthErrors();
    if (getSession()) {
        tab = "profile";
    }
    const formLogin = document.getElementById("formLogin");
    const formRegister = document.getElementById("formRegister");
    const formProfile = document.getElementById("formProfile");
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const authTabs = document.getElementById("authTabs");

    formLogin.classList.add("hidden");
    formRegister.classList.add("hidden");
    formProfile.classList.add("hidden");

    if (tab === "login") {
        formLogin.classList.remove("hidden");
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        authTabs.classList.remove("hidden");
    } else if (tab === "register") {
        formRegister.classList.remove("hidden");
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        authTabs.classList.remove("hidden");
    } else if (tab === "profile") {
        formProfile.classList.remove("hidden");
        authTabs.classList.add("hidden");
        updateProfileModal();
    }
}

function updateProfileModal() {
    const session = getSession();
    if (!session) return;
    document.getElementById("profileName").textContent = session.name;
    document.getElementById("profileEmail").textContent = session.email;
    document.getElementById("profileSince").textContent = formatDate(session.createdAt);
    const avatar = document.getElementById("profileAvatar");
    avatar.textContent = getInitials(session.name);
    const itemCount = productosCart.length;
    document.getElementById("profileCartCount").textContent = itemCount + " item" + (itemCount !== 1 ? "s" : "");
}

function actualizarNavbar() {
    const session = getSession();
    const iconSvg = document.getElementById("profileIconSvg");
    const navName = document.getElementById("navUserName");
    const navAvatar = document.getElementById("navUserAvatar");

    if (session) {
        iconSvg.classList.add("hidden");
        navAvatar.textContent = getInitials(session.name);
        navAvatar.classList.remove("hidden");
        navName.textContent = session.name.split(" ")[0];
        navName.classList.remove("hidden");
        profile.classList.add("loggedIn");
    } else {
        iconSvg.classList.remove("hidden");
        navAvatar.classList.add("hidden");
        navName.classList.add("hidden");
        profile.classList.remove("loggedIn");
    }
}

function handleLogin() {
    clearAuthErrors();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value;

    if (!email || !pass) {
        showAuthError("loginError", "Please fill in all fields.");
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === hashSimple(pass));

    if (!user) {
        showAuthError("loginError", "Incorrect email or password.");
        return;
    }

    saveSession(user);
    actualizarNavbar();
    modal.close();
    mostrarNotificacion("Welcome back, " + user.name.split(" ")[0] + "!");
}

function handleRegister() {
    clearAuthErrors();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pass = document.getElementById("regPass").value;
    const passConfirm = document.getElementById("regPassConfirm").value;

    if (!name || !email || !pass || !passConfirm) {
        showAuthError("registerError", "Please fill in all fields.");
        return;
    }
    if (pass.length < 6) {
        showAuthError("registerError", "Password must be at least 6 characters.");
        return;
    }
    if (pass !== passConfirm) {
        showAuthError("registerError", "Passwords do not match.");
        return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showAuthError("registerError", "This email is already registered.");
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password: hashSimple(pass),
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    saveSession(newUser);
    actualizarNavbar();
    modal.close();
    mostrarNotificacion("Welcome to ElegancIA, " + name.split(" ")[0] + "!");
}

function handleLogout() {
    clearSession();
    actualizarNavbar();
    modal.close();
    mostrarNotificacion("You've been logged out. See you soon!");
}

profile.addEventListener("click", () => {
    const session = getSession();
    if (session) {
        switchToTab("profile");
    } else {
        switchToTab("login");
    }
    modal.showModal();
});

document.getElementById("tabLogin").addEventListener("click", () => switchToTab("login"));
document.getElementById("tabRegister").addEventListener("click", () => switchToTab("register"));
document.getElementById("goToRegister").addEventListener("click", () => switchToTab("register"));
document.getElementById("goToLogin").addEventListener("click", () => switchToTab("login"));
document.getElementById("btnLogin").addEventListener("click", handleLogin);
document.getElementById("btnRegister").addEventListener("click", handleRegister);
document.getElementById("btnLogout").addEventListener("click", handleLogout);
document.getElementById("modalClose").addEventListener("click", () => modal.close());

["loginEmail", "loginPass"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", e => {
        if (e.key === "Enter") handleLogin();
    });
});
["regName", "regEmail", "regPass", "regPassConfirm"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", e => {
        if (e.key === "Enter") handleRegister();
    });
});

document.querySelectorAll(".togglePass").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.target);
        target.type = target.type === "password" ? "text" : "password";
    });
});

actualizarNavbar();

cartModalBtn.addEventListener("click", () => {
    actualizarCarrito();
    modalCart.showModal();
});
modalCartClose.addEventListener("click", () => {
    modalCart.close();
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (productosCart.length === 0) {
        mostrarNotificacion("Your cart is empty.");
        return;
    }
    mostrarNotificacion("Thank you for your purchase!");
    productosCart = [];
    actualizarCarrito();
    modalCart.close();
});

document.getElementById("newsletterBtn").addEventListener("click", () => {
    const input = document.getElementById("newsletterEmail");
    const email = input.value.trim();
    if (!email || !email.includes("@")) {
        mostrarNotificacion("Please enter a valid email.");
        return;
    }
    mostrarNotificacion("Thanks for subscribing!");
    input.value = "";
});

document.getElementById("busqueda").addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!productosCargados) return;
    if (!query) {
        applyFilters();
        return;
    }
    const filtered = productosGlobal.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        (p.etiquetas && p.etiquetas.some(t => t.toLowerCase().includes(query)))
    );
    generarTarjetas(filtered);
});

sendBtnAi.addEventListener("click", enviarMensaje);

document.addEventListener("DOMContentLoaded", async () => {
    await cargarProductos();
    obtenerSaludoInicial();
    const id = obtenerId();
    if (id) {
        renderProducto(id);
    }
});

btnAi.addEventListener("click", () => {
    const isOpen = chatBox.classList.contains("chatOpen");
    if (isOpen) {
        chatBox.classList.remove("chatOpen");
        main.classList.add("chatClosed");
    } else {
        chatBox.classList.add("chatOpen");
        main.classList.remove("chatClosed");
    }
});

async function cargarProductos() {
    try {
        const respuesta = await fetch("../back/products.json");
        const datos = await respuesta.json();
        productosGlobal = datos;
        productosCargados = true;
        generarTarjetas(datos);
        return datos;
    } catch (error) {
        console.error("Error cargando los datos:", error);
    }
}

async function obtenerSaludoInicial() {
    try {
        const respuesta = await fetch("../back/chat.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ historial: [] }),
        });
        const datos = await respuesta.json();
        generarMensaje(datos.respuesta, "Bot");
        if (datos.lista && Array.isArray(datos.lista)) {
            let ul = document.createElement("ul");
            datos.lista.forEach(item => {
                let li = document.createElement("li");
                li.textContent = item;
                ul.appendChild(li);
            });
            let divLista = document.createElement("div");
            divLista.className = "messageBot";
            divLista.appendChild(ul);
            contentIa.appendChild(divLista);
        }
        historialConversacion.push({
            role: "assistant",
            content: datos.respuesta
        });
    } catch (error) {
        console.error("Error saludando al usuario:", error);
    }
}

function obtenerId() {
    const pathname = window.location.pathname;
    if (!pathname.startsWith(path)) return null;
    const rest = pathname.replace(path, "");
    const partes = rest.split("/").filter(p => p);
    return partes.length > 0 ? partes[0] : null;
}

window.addEventListener("popstate", () => {
    const id = obtenerId();
    if (id) {
        renderProducto(id);
    } else {
        renderTienda();
    }
});

inputPromt.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enviarMensaje();
    }
});

function resetChat() {
    contentIa.innerHTML = "";
}

clearChatBtn.addEventListener("click", () => {
    resetChat();
    historialConversacion = [];
    generarMensaje("Chat cleared.", "Bot");
});

function actualizarCarrito() {
    cartContent.innerHTML = "";
    let subTotal = 0;
    let totalArticulos = 0;

    productosCart.forEach((producto, index) => {
        if (!producto.cantidad) {
            producto.cantidad = 1;
        }
        subTotal += (producto.precio * producto.cantidad);
        totalArticulos += producto.cantidad;

        const miniCard = document.createElement("div");
        miniCard.className = "cartItem";

        miniCard.innerHTML = `
            <img src="/ElegancIA${producto.img}" alt="${producto.nombre}">
            <div class="cartItemInfo">
                <h4>${producto.nombre}</h4>
                <p>$${producto.precio.toFixed(2)}</p>
            </div>
            <div class="cartQuantity">
                <button class="qtyBtn" onclick="disminuirCantidad(${index})">-</button>
                <span>${producto.cantidad}</span>
                <button class="qtyBtn" onclick="aumentarCantidad(${index})">+</button>
            </div>
        `;

        const removeBtn = document.createElement("button");
        removeBtn.className = "removeBtn";
        removeBtn.textContent = "X";

        removeBtn.addEventListener("click", () => {
            productosCart.splice(index, 1);
            actualizarCarrito();
        });

        miniCard.appendChild(removeBtn);
        cartContent.appendChild(miniCard);
    });

    if (productosCart.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "cartEmpty";
        emptyMsg.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="50" height="50">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <p>Your cart is empty</p>
            <span>Add some products to get started!</span>
        `;
        cartContent.appendChild(emptyMsg);
    }

    const iva = subTotal * 0.16;
    const total = subTotal + iva;

    cartSubtotal.textContent = `$${subTotal.toFixed(2)}`;
    cartIva.textContent = `$${iva.toFixed(2)}`;
    cartTotal.textContent = `$${total.toFixed(2)}`;

    if (cartBadge) {
        cartBadge.textContent = totalArticulos;
        if (totalArticulos > 0) {
            cartBadge.classList.remove("hidden");
        } else {
            cartBadge.classList.add("hidden");
        }
    }
    actualizarEstadoBotones();
}

const aumentarCantidad = (index) => {
    productosCart[index].cantidad++;
    actualizarCarrito();
}
const disminuirCantidad = (index) => {
    if (productosCart[index].cantidad > 1) {
        productosCart[index].cantidad--;
        actualizarCarrito();
    } else {
        productosCart.splice(index, 1);
        actualizarCarrito();
    }
}

function generarTarjetaChat(productId) {
    const producto = productosGlobal.find(p => p.id == productId);
    if (!producto) {
        console.error("Backend sent ID:", productId, "but it was not found in productosGlobal.");
        return;
    }

    const card = document.createElement("div");
    card.className = "chatMiniCard messageBot";

    card.innerHTML = `
        <img src="/ElegancIA${producto.img}" />
        <div class="chatMiniText">
            <span class="chatMiniTitle">${producto.nombre}</span>
            <span class="chatMiniPrice">$${producto.precio.toFixed(2)}</span>
        </div>
    `;

    card.addEventListener("click", () => {
        const nuevaUrl = path + producto.id;
        history.pushState({ id: producto.id }, "", nuevaUrl);
        renderProducto(producto.id);
    });

    contentIa.appendChild(card);
    contentIa.scrollTop = contentIa.scrollHeight;
}

async function enviarMensaje() {
    let mensaje = inputPromt.value.trim();
    inputPromt.value = "";
    if (!mensaje) return;

    generarMensaje(mensaje, "User");
    historialConversacion.push({ role: "user", content: mensaje });

    const loadingEl = document.createElement("p");
    loadingEl.className = "loadingDots";
    loadingEl.innerHTML = "......";
    contentIa.appendChild(loadingEl);
    contentIa.scrollTop = contentIa.scrollHeight;

    try {
        const respuesta = await fetch("../back/chat.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ historial: historialConversacion })
        });

        if (!respuesta.ok) {
            throw new Error("HTTP error: " + respuesta.status);
        }

        const datos = await respuesta.json();

        if (datos.agregar_al_carrito && datos.product_id) {
            const productoaAgregar = productosGlobal.find(p => p.id == datos.product_id);
            if (productoaAgregar) {
                const yaExiste = productosCart.some(p => String(p.id) === String(productoaAgregar.id));
                if (!yaExiste) {
                    productosCart.push(productoaAgregar);
                    actualizarCarrito();
                    mostrarNotificacion(`AI added ${productoaAgregar.nombre} to your cart!`);
                }
            }
        }

        if (contentIa.contains(loadingEl)) {
            contentIa.removeChild(loadingEl);
        }

        let mensajeIa = datos.respuesta || "There was an error, try again later.";
        generarMensaje(mensajeIa, "Bot");

        const pId = (datos.product_id !== null && datos.product_id !== undefined && datos.product_id !== "") ? datos.product_id : null;

        if (pId) {
            generarTarjetaChat(pId);
            const nuevaUrl = path + pId;
            history.pushState({ id: pId }, "", nuevaUrl);
            renderProducto(pId);
        }

        if (datos.lista && Array.isArray(datos.lista) && (!datos.product_id || datos.lista.length > 1)) {
            let ul = document.createElement("ul");
            datos.lista.forEach(item => {
                let li = document.createElement("li");
                li.textContent = item;
                ul.appendChild(li);
            });
            let divLista = document.createElement("div");
            divLista.className = "messageBot";
            divLista.appendChild(ul);
            contentIa.appendChild(divLista);
        }

        historialConversacion.push({
            role: "assistant",
            content: datos.respuesta
        });

    } catch (error) {
        if (contentIa.contains(loadingEl)) {
            contentIa.removeChild(loadingEl);
        }
        console.error("Error en enviarMensaje:", error);
        generarMensaje("There was a connection error. Please try again.", "Bot");
    }
}

function generarMensaje(mensaje, sender) {
    let p = document.createElement("p");
    p.className = `message${sender}`;
    const id = Date.now();
    p.id = id;
    p.innerHTML = mensaje;
    contentIa.appendChild(p);
    contentIa.scrollTop = contentIa.scrollHeight;
    return id;
}

function renderProducto(id) {
    const producto = productosGlobal.find(p => p.id == id);
    document.title = producto ? producto.nombre : "ElegancIA";

    if (!producto) return;

    const yaEnCarrito = productosCart.some(p => String(p.id) === String(producto.id));
    const tallasHTML = producto.tallas.map(t => `<button class="tag-badge">${t}</button>`).join('');
    const coloresHTML = producto.colores.join(', ');
    const etiquetasHTML = producto.etiquetas.map(e => `<span class="tag-badge outline">#${e}</span>`).join('');

    const stockStatus = producto.stock
        ? `<span class="stock-status in-stock">In stock</span>`
        : `<span class="stock-status out-of-stock">Out of stock</span>`;

    let btnCarrito = "";
    if (!producto.stock) {
        btnCarrito = `<button class="addCart disabled" disabled>Sold out</button>`;
    } else if (yaEnCarrito) {
        btnCarrito = `<button class="addCart inCart" id="btnSingleCart" data-id="${producto.id}" disabled>Added to cart</button>`;
    } else {
        btnCarrito = `<button class="addCart" id="btnSingleCart" data-id="${producto.id}">Add to cart</button>`;
    }

    const rutaImagen = `/ElegancIA${producto.img.replace('..', '')}`;

    storeContent.innerHTML = `
        <div id="singleProductView">
            <button id="volverBtn" class="btn-small">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
                Go back to the store
            </button>
            <div class="productDetailCard">
                <div class="productDetailImg">
                    <img src="${rutaImagen}" alt="${producto.nombre}"/>
                </div>
                <div class="productDetailInfo">
                    <div class="header-info">
                        <span class="category-tag">${producto.categoria}</span>
                        ${stockStatus}
                    </div>
                    <h2>${producto.nombre}</h2>
                    <p class="price">$${producto.precio.toFixed(2)}</p>
                    <p class="desc">${producto.descripcion}</p>
                    <div class="extra-info">
                        <div class="info-row">
                            <strong>Sizes:</strong>
                            <div class="tags-container">${tallasHTML}</div>
                        </div>
                        <p><strong>Colors:</strong> ${coloresHTML}</p>
                        <p><strong>Material:</strong> ${producto.material}</p>
                        <p><strong>Care Instructions:</strong> ${producto.cuidados}</p>
                    </div>
                    <div class="tags-container" style="margin-top: 10px;">
                        ${etiquetasHTML}
                    </div>
                    ${btnCarrito}
                </div>
            </div>
        </div>
    `;

    document.getElementById("volverBtn").addEventListener("click", (e) => {
        e.preventDefault();
        history.replaceState({}, "", path);
        renderTienda();
    });

    const btnSingleCart = document.getElementById("btnSingleCart");
    if (btnSingleCart) {
        btnSingleCart.addEventListener("click", () => {
            const yaExiste = productosCart.some(p => String(p.id) === String(producto.id));
            if (!yaExiste) {
                productosCart.push(producto);
                mostrarNotificacion(`${producto.nombre} added to your cart!`);
                actualizarCarrito();
            }
        });
    }
}

function renderTienda() {
    document.title = "ElegancIA";
    applyFilters();
}

function generarTarjetas(datos) {
    storeContent.innerHTML = "";
    for (let i = 0; i < datos.length; i++) {
        const producto = datos[i];

        const div = document.createElement("div");
        div.className = "productCart";
        div.dataset.id = producto.id;

        const img = document.createElement("img");
        img.src = `/ElegancIA` + producto.img;
        img.alt = producto.nombre;

        const h2 = document.createElement("h2");
        h2.innerHTML = producto.nombre;

        const p = document.createElement("p");
        p.textContent = "$" + producto.precio.toFixed(2);

        const btn = document.createElement("button");
        btn.classList.add("addCart");

        if (!producto.stock) {
            btn.textContent = "Sold out";
            btn.disabled = true;
            btn.classList.add("disabled");
        } else {
            btn.textContent = "Add to cart";
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const yaExiste = productosCart.some(p => p.id === producto.id);
                if (!yaExiste) {
                    productosCart.push(producto);
                    mostrarNotificacion(`${producto.nombre} added to your cart!`);
                    actualizarCarrito();
                }
            });
        }

        div.appendChild(img);
        div.appendChild(h2);
        div.appendChild(p);
        div.appendChild(btn);

        div.addEventListener("click", (e) => {
            if (e.target.tagName !== "BUTTON") {
                const nuevaUrl = path + producto.id;
                history.pushState({ id: producto.id }, "", nuevaUrl);
                renderProducto(producto.id);
            }
        });

        storeContent.appendChild(div);
    }
    actualizarEstadoBotones();
}

function mostrarNotificacion(mensaje) {
    const buy = document.createElement("div");
    buy.className = "buyNotification";
    buy.textContent = mensaje;

    document.body.appendChild(buy);

    setTimeout(() => {
        buy.classList.add("show");
    }, 10);

    setTimeout(() => {
        buy.classList.remove("show");
        setTimeout(() => {
            buy.remove();
        }, 300);
    }, 3000);
}

function actualizarEstadoBotones() {
    const botones = document.querySelectorAll(".addCart");

    botones.forEach(btn => {
        let productId;

        const tarjetaDiv = btn.closest(".productCart");
        if (tarjetaDiv) {
            productId = tarjetaDiv.dataset.id;
        } else if (btn.id === "btnSingleCart") {
            productId = btn.dataset.id;
        }

        if (!productId) return;

        const producto = productosGlobal.find(p => String(p.id) === String(productId));
        if (producto && !producto.stock) return;

        const yaEnCarrito = productosCart.some(p => String(p.id) === String(productId));

        if (yaEnCarrito) {
            btn.disabled = true;
            btn.classList.add("inCart");
            btn.textContent = "Added to cart";
        } else {
            btn.disabled = false;
            btn.classList.remove("inCart");
            btn.textContent = btn.id === "btnSingleCart" ? "Add to cart" : "Add to cart";
        }
    });
}

let activeFilters = {
    category: "All",
    maxPrice: 150,
    stock: "all",
    sort: "default"
};

allProducts.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveFilterBtn("allProducts");
    activeFilters.category = "All";
    applyFilters();
});
hoodieBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveFilterBtn("hoodieBtn");
    activeFilters.category = "Hoodies";
    applyFilters();
});
outerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveFilterBtn("outerBtn");
    activeFilters.category = "Outerwear";
    applyFilters();
});
accesoriesBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveFilterBtn("accesoriesBtn");
    activeFilters.category = "Accessories";
    applyFilters();
});
footwearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveFilterBtn("footwearBtn");
    activeFilters.category = "Footwear";
    applyFilters();
});

function setActiveFilterBtn(activeId) {
    ["allProducts", "hoodieBtn", "outerBtn", "accesoriesBtn", "footwearBtn"].forEach(id => {
        document.getElementById(id)?.classList.remove("activeFilterItem");
    });
    document.getElementById(activeId)?.classList.add("activeFilterItem");
}

function applyFilters() {
    if (!productosCargados) return;
    let filtered = [...productosGlobal];
    if (activeFilters.category !== "All") {
        filtered = filtered.filter(p => p.categoria === activeFilters.category);
    }
    filtered = filtered.filter(p => p.precio <= activeFilters.maxPrice);
    if (activeFilters.stock === "instock") {
        filtered = filtered.filter(p => p.stock === true);
    }
    if (activeFilters.sort === "price-asc") {
        filtered.sort((a, b) => a.precio - b.precio);
    } else if (activeFilters.sort === "price-desc") {
        filtered.sort((a, b) => b.precio - a.precio);
    } else if (activeFilters.sort === "name") {
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    generarTarjetas(filtered);
    document.querySelectorAll("#filterCategories .filterChip").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.cat === activeFilters.category);
    });
}

filtersBtn.addEventListener("click", () => {
    modalFilters.showModal();
    syncModalToState();
});
modalFiltersClose.addEventListener("click", () => modalFilters.close());

function syncModalToState() {
    document.querySelectorAll("#filterCategories .filterChip").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.cat === activeFilters.category);
    });
    document.getElementById("filterPrice").value = activeFilters.maxPrice;
    document.getElementById("filterPriceLabel").textContent = "$" + activeFilters.maxPrice;
    document.querySelectorAll("[data-stock]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.stock === activeFilters.stock);
    });
    document.querySelectorAll("[data-sort]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.sort === activeFilters.sort);
    });
}

document.querySelectorAll("#filterCategories .filterChip").forEach(chip => {
    chip.addEventListener("click", () => {
        document.querySelectorAll("#filterCategories .filterChip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeFilters.category = chip.dataset.cat;
    });
});

document.getElementById("filterPrice").addEventListener("input", (e) => {
    activeFilters.maxPrice = Number(e.target.value);
    document.getElementById("filterPriceLabel").textContent = "$" + e.target.value;
});

document.querySelectorAll("[data-stock]").forEach(chip => {
    chip.addEventListener("click", () => {
        document.querySelectorAll("[data-stock]").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeFilters.stock = chip.dataset.stock;
    });
});

document.querySelectorAll("[data-sort]").forEach(chip => {
    chip.addEventListener("click", () => {
        document.querySelectorAll("[data-sort]").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeFilters.sort = chip.dataset.sort;
    });
});

document.getElementById("btnApplyFilters").addEventListener("click", () => {
    const catMap = {
        "All": "allProducts",
        "Hoodies": "hoodieBtn",
        "Outerwear": "outerBtn",
        "Accessories": "accesoriesBtn",
        "Footwear": "footwearBtn"
    };
    setActiveFilterBtn(catMap[activeFilters.category] || "allProducts");
    applyFilters();
    modalFilters.close();
});

document.getElementById("btnClearFilters").addEventListener("click", () => {
    activeFilters = { category: "All", maxPrice: 150, stock: "all", sort: "default" };
    syncModalToState();
});

document.querySelectorAll("[data-filter-nav]").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const cat = link.dataset.filterNav;
        activeFilters.category = cat;
        const catMap = {
            "Hoodies": "hoodieBtn",
            "Outerwear": "outerBtn",
            "Accessories": "accesoriesBtn",
            "Footwear": "footwearBtn"
        };
        setActiveFilterBtn(catMap[cat] || "allProducts");
        applyFilters();
        document.getElementById("storeContent").scrollIntoView({ behavior: "smooth" });
        closeMobileNav();
    });
});