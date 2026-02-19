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

const path = "/Tienda-Allegra-con-ia/front/";

profile.addEventListener("click", () => {
    modal.showModal();
});
modalClose.addEventListener("click", () => {
    modal.close();
});

sendBtnAi.addEventListener("click", enviarMensaje);

document.addEventListener("DOMContentLoaded", async () => {
    await cargarProductos();
    mostrarMensajeBienvenida();

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

function renderProducto(id) {
    const producto = productosGlobal.find(p => p.id == id);
    document.title = producto ? producto.nombre : "Allegra - Tienda";

    if (!producto) return;

    storeContent.innerHTML = `
        <button id="volverBtn">Volver</button>
        <div class="productCart">
            <img src="${producto.img}"/>
            <h2>${producto.nombre}</h2>
            <p>${producto.descripcion || ""}</p>
            <p>$${producto.precio}</p>
            <button class="addCart">Agregar al carrito</button>
        </div>
    `;
    const volverBtn = document.getElementById("volverBtn");
    volverBtn.addEventListener("click", (e) => {
        e.preventDefault();
        history.replaceState({}, "", path);
        renderTienda();
    });
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
        p.innerHTML = "$" + producto.precio;

        const btn = document.createElement("button");
        btn.classList.add("addCart");
        btn.textContent = "Agregar al carrito";

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            productosCart.push(producto);
            alert("Producto añadido al carrito ", producto.nombre);
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