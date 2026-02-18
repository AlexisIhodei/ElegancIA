let cartBtn = document.getElementsByClassName("addCart");
let filtersBtn = document.getElementById("btnFilters");
let inputPromt = document.getElementById("promtInp");
let sendBtnAi = document.getElementById("sendBtn");
let btnAi = document.getElementById("btnIa");
let profile = document.getElementById("profileIcon");
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
let modal = document.getElementById("modal");
let modalClose = document.getElementById("modalClose");

let historialConversacion = [];
let productosGlobal = [];
let productosCart = [];

btnIa.addEventListener("click", () => {
    if (chatBox.style.display === "grid") {
        chatBox.style.display = "none";
        main.classList.add("chatClosed");
    } else {
        chatBox.style.display = "grid";
        main.classList.remove("chatClosed");
    }
});

profile.addEventListener("click", () => {
    modal.showModal();
});
modalClose.addEventListener("click", () => {
    modal.close();
});

sendBtnAi.addEventListener("click", enviarMensaje);

window.addEventListener("popstate", router);

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

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    mostrarMensajeBienvenida();
    generarTarjetas(productosGlobal);
});

inputPromt.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enviarMensaje();
    }
});

function mostrarMensajeBienvenida() {
    const bienvenida = "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?";
    generarMensaje(bienvenida, "Bot");
    historialConversacion.push({ role: "assistant", content: bienvenida });
}

function resetChat() {
    contentIa.innerHTML = " ";
}

clearChatBtn.addEventListener("click", () => {
    resetChat();
    historialConversacion = [];
    generarMensaje("Chat reiniciado.", "Bot");
});
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
        if (datos.product_id !== null) {
            navegar(`/producto/${datos.product_id}`);
        }
        generarMensaje(mensajeIa, "Bot");

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
    contentIa.scrollTop = chatBox.scrollHeight;
    return id;
}

function generarTarjetas(datos) {
    storeContent.innerHTML = "";
    for (let i = 0; i < datos.length; i++) {
        const producto = datos[i];

        const div = document.createElement("div");
        div.className = "productCart";
        div.dataset = producto.id;

        const img = document.createElement("img");
        img.src = producto.img;

        const h2 = document.createElement("h2");
        h2.innerHTML = producto.nombre;

        const p = document.createElement("p");
        p.innerHTML = "$" + producto.precio;

        const btn = document.createElement("button");
        btn.classList.add("addCart");
        btn.textContent = "Agregar al carrito";

        div.appendChild(img);
        div.appendChild(h2);
        div.appendChild(p);
        div.appendChild(btn);

        div.addEventListener("click", () => {
            navegar(`/producto/${producto.id}`);
        });
        storeContent.appendChild(div);
    }
}

function navegar(path) {
    history.pushState({}, "", path);
    router();
}

function router() {
    const path = window.location.pathname;
    if (path.startsWith("/producto/")) {
        const id = parseInt(path.split("/")[2]);
        renderProducto(id);
    } else {
        renderTienda();
    }
}

function renderProducto(id) {
    const producto = productosGlobal.find(p => p.id == id);

    if (!producto) return;

    storeContent.innerHTML = `
        <button id="volverBtn">← Volver</button>
        <div class="detalleProducto">
            <img src="${producto.img}" width="300"/>
            <h2>${producto.nombre}</h2>
            <p>${producto.descripcion || ""}</p>
            <p>$${producto.precio}</p>
            <button class="addCart">Agregar al carrito</button>
        </div>
    `;

    document.getElementById("volverBtn").addEventListener("click", () => {
        navegar("/");
    });
}


function renderTienda() {
    generarTarjetas(productosGlobal);
}