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

let historialConversacion = [];
let productosGlobal = [];
let productosCart = [];

const path = "/Tienda-Allegra-con-ia/front/";

profile.addEventListener("click", () => {
    modal.showModal();
});

cartModalBtn.addEventListener("click", () => {
    modalCart.showModal();
});
modalClose.addEventListener("click", () => {
    modal.close();
});
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
        contentIa.removeChild(p);
        let mensajeIa = datos.respuesta || "No se pudo generar el mensaje";
        generarMensaje(mensajeIa, "Bot");

        const pid = (datos.product_id !== null && datos.product_id !== undefined && datos.product_id !== "") ? datos.product_id : null;

        if (pid) {
            generarTarjetaChat(pid);
            const nuevaUrl = path + pid;
            history.pushState({ id: pid }, "", nuevaUrl);
            renderProducto(pid);
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
            alert("Producto añadido al carrito: " + producto.nombre);
        });
    }
}

function renderTienda() {
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
            productosCart.push(producto);
            alert("Product added to the cart ", producto.nombre);
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
