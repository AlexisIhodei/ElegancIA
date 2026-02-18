let cartBtn = document.getElementsByClassName("addCart");
let filtersBtn = document.getElementById("btnFilters");
let inputPromt = document.getElementById("promtInp");
let sendBtnAi = document.getElementById("sendBtn");
let btnAi = document.getElementById("btnIa");
let profile = document.getElementById("profileIcon");

let allProducts = document.getElementById("allProducts");
let hoodieBtn = document.getElementById("hoodieBtn");
let outerBtn = document.getElementById("outerBtn");
let accesoriesBtn = document.getElementById("accesoriesBtn");
let footwearBtn = document.getElementById("footwearBtn");


let storeContent = document.getElementById("storeContent");
let contentIa = document.getElementById("contentIa");
const main = document.getElementById("main");

main.classList.add("chatClosed");
let modal = document.getElementById("modal");
let modalClose = document.getElementById("modalClose");

let historialConversacion = [];

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

cartBtn.addEventListener("click", () => {
    console.log("Producto agregado");
});

document.addEventListener("DOMContentLoaded", cargarProductos);

async function cargarProductos() {
    try {
        const respuesta = await fetch("productos,json");
        const datos = await respuesta.json;
        generarTarjetas(datos);
    } catch (error) {
        console.log("Error cargando los datos ");
    }
}

function resetChat() {
    contentIa.innerHTML = " ";
}

async function enviarMensaje() {
    resetChat();
    let mensaje = inputPromt.value.trim();

    if (!mensaje) {
        return
    }

    generarMensaje(mensaje, "User");
    historialConversacion.push({
        role: "user",
        context: mensaje
    });
    const p = document.createElement("p");
    p.innerHTML = "Loading............";
    contentIa.appendChild(p);

    try {
        const respuesta = await fetch("index.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ historial: historialConversacion })
        });
        if (!respuesta.ok) {
            const errorText = document.createElement("p");
            errorText.innerHTML = "Error en la peticion";
            contentIa.appendChild(errorText);
            throw new Error("Error en la peticion");
        };
        const datos = await respuesta.json();
        generarMensaje(datos, "Bot");

        historialConversacion.push({
            role: "assistant",
            context: datos.respuesta
        });
    } catch (error) {
        resetChat();
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
    toreContent.innerHTML = "";
    for (let i = 0; i < datos.length; i++) {
        const producto = datos[i];

        const div = document.createElement("div");
        div.className = "productCart";

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

        storeContent.appendChild(div);
    }
}