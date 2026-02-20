let cartBtn = document.getElementsByClassName("addCart");
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

let cartContent = document.getElementById("cartContent");
let cartSubtotal = document.getElementById("cartSubtotal");
let cartIva = document.getElementById("cartIva");
let cartTotal = document.getElementById("cartTotal");
let cartBadge = document.getElementById("cartBadge");

let historialConversacion = [];
let productosGlobal = [];
let productosCart = [];

const path = "/Tienda-Allegra-con-ia/front/";

const AUTH_KEY = "allegra_users";
const SESSION_KEY = "allegra_session";

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
    mostrarNotificacion("Welcome to Allegra, " + name.split(" ")[0] + "!");
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

profile.addEventListener("click", () => {
    modal.showModal();
});

cartModalBtn.addEventListener("click", () => {
    modalCart.showModal();
});
// modalClose.addEventListener("click", () => {
//     modal.close();
// });
modalCartClose.addEventListener("click", () => {
    modalCart.close();
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

btnIa.addEventListener("click", () => {
    if (chatBox.style.display === "grid") {
        chatBox.style.display = "none";
        main.classList.add("chatClosed");
    } else {
        chatBox.style.display = "grid";
        main.classList.remove("chatClosed");
    }
});

async function cargarProductos() {
    try {
        const respuesta = await fetch("../back/products.json");
        const datos = await respuesta.json();
        productosGlobal = datos;
        generarTarjetas(datos);
        return datos;
    } catch (error) {
        console.log("Error cargando los datos ");
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
        console.log("Error saludando al usuario", error);
    }
}
function obtenerId() {
    const location = window.location.pathname.replace(path, "");
    const partes = location.split("/").filter(p => p);
    return partes.length > 0 ? partes[0] : null;
}

window.addEventListener("popstate", (event) => {
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
    contentIa.innerHTML = " ";
}

clearChatBtn.addEventListener("click", () => {
    resetChat();
    historialConversacion = [];
    generarMensaje("Chat reiniciado.", "Bot");
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
            <img src="/Tienda-Allegra-con-ia${producto.img}" alt="${producto.nombre}">
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
        if (productosCart.length > 0) {
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
        console.error("El backend envió el ID:", productId, "pero no se encontró en productosGlobal.");
        return;
    }

    const card = document.createElement("div");
    card.className = "chatMiniCard messageBot";

    card.innerHTML = `
        <img src="/Tienda-Allegra-con-ia${producto.img}" />
        <div class="chatMiniText">
            <span class="chatMiniTitle">${producto.nombre}</span>
            <span class="chatMiniPrice">$${producto.precio}</span>
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
    const p = document.createElement("p");
    p.className = "loadingDots";
    p.innerHTML = "......";
    contentIa.appendChild(p);

    try {
        const respuesta = await fetch("../back/chat.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ historial: historialConversacion })
        });
        if (!respuesta.ok) {
            const errorText = document.createElement("p");
            errorText.innerHTML = "Error en la peticion";
            contentIa.appendChild(errorText);
            throw new Error("Error en la peticion");
        };
        const text = await respuesta.text();
        console.log("datos " + text);
        const datos = JSON.parse(text);
        if (datos.agregar_al_carrito && datos.product_id) {
            const productoaAgregar = productosGlobal.find(p => p.id == datos.product_id);
            if (productoaAgregar) {
                productosCart.push(productoaAgregar);
                actualizarCarrito();
                mostrarNotificacion(`¡IA added the product ${productoaAgregar.nombre} to your cart!`);
            }
        }
        contentIa.removeChild(p);
        let mensajeIa = datos.respuesta || "No se pudo generar el mensaje";
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
        resetChat();
        console.log("Error completo " + error);
        contentIa.innerHTML = "No se pudo generar el mensaje";
    }
}


function generarMensaje(mensaje, sender) {
    let p = document.createElement("p");
    p.className = `message${sender}`;
    const id = Date.now();
    p.id = id;
    p.innerHTML = `${mensaje}`;
    contentIa.appendChild(p);
    contentIa.scrollTop = contentIa.scrollHeight;
    return id;
}

function renderProducto(id) {
    const producto = productosGlobal.find(p => p.id == id);
    document.title = producto ? producto.nombre : "Allegra - Tienda";

    if (!producto) return;

    const tallasHTML = producto.tallas.map(t => `<span class="tag-badge">${t}</span>`).join('');
    const coloresHTML = producto.colores.join(', ');
    const etiquetasHTML = producto.etiquetas.map(e => `<span class="tag-badge outline">#${e}</span>`).join('');

    const stockStatus = producto.stock ? `<span class="stock-status in-stock">In stock</span>` : `<span class="stock-status out-of-stock">Out of stock</span>`;

    const btnCarrito = producto.stock
        ? `<button class="addCart" id="btnSingleCart">Add to cart</button>`
        : `<button class="addCart disabled" disabled>Sold out</button>`;

    const rutaImagen = `/Tienda-Allegra-con-ia${producto.img.replace('..', '')}`;

    storeContent.innerHTML = `
        <div id="singleProductView" style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 20px;">
            
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
                        <p><strong>Care Intructions:</strong> ${producto.cuidados}</p>
                    </div>

                    <div class="tags-container" style="margin-top: 10px;">
                        ${etiquetasHTML}
                    </div>

                    ${btnCarrito}
                </div>
            </div>
            
        </div>
    `;
    const volverBtn = document.getElementById("volverBtn");
    volverBtn.addEventListener("click", (e) => {
        e.preventDefault();
        history.replaceState({}, "", path);
        renderTienda();
    });
    const btnSingleCart = document.getElementById("btnSingleCart");
    if (btnSingleCart) {
        btnSingleCart.addEventListener("click", () => {
            productosCart.push(producto);
            mostrarNotificacion(`¡${producto.nombre} added to your cart!`);
            actualizarCarrito();
        });
    }
}

function renderTienda() {
    document.title = "Allegra";
    generarTarjetas(productosGlobal);
}

function generarTarjetas(datos) {
    storeContent.innerHTML = "";
    for (let i = 0; i < datos.length; i++) {
        const producto = datos[i];

        const div = document.createElement("div");
        div.className = "productCart";
        div.dataset.id = producto.id;

        const img = document.createElement("img");
        img.src = `/Tienda-Allegra-con-ia` + producto.img;

        const h2 = document.createElement("h2");
        h2.innerHTML = producto.nombre;

        const p = document.createElement("p");
        p.textContent = "$" + producto.precio;

        const btn = document.createElement("button");
        btn.classList.add("addCart");
        btn.textContent = "Add to the cart";

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const yaExiste = productosCart.some(p => p.id === producto.id);
            if (!yaExiste) {
                productosCart.push(producto);
                mostrarNotificacion(`¡${producto.nombre} added to your cart!`);
                actualizarCarrito();
            }
        });

        div.appendChild(img);
        div.appendChild(h2);
        div.appendChild(p);
        div.appendChild(btn);
        div.addEventListener("click", (e) => {
            if (e.target.tagName !== "Button") {
                const nuevaUrl = path + producto.id;
                history.pushState({ id: producto.id }, "", nuevaUrl);
                renderProducto(producto.id);
            }
        });
        storeContent.appendChild(div);
    }
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
        const tarjetaDiv = btn.closest(".productCart");
        if (!tarjetaDiv) return;

        const productId = tarjetaDiv.dataset.id;

        const yaEnCarrito = productosCart.some(p => p.id === productId);

        if (yaEnCarrito) {
            btn.disabled = true;
            btn.classList.add("inCart");
            btn.textContent = "Added to cart";
        } else {
            btn.disabled = false;
            btn.classList.remove("inCart");
            btn.textContent = "Add to the cart";
        }
    });
}