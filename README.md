# ElegancIA Fashion Store

Tienda de ropa online con asistente de ventas impulsado por IA. Permite explorar productos, filtrarlos, añadirlos al carrito y consultar dudas directamente al chatbot.


## Estructura del proyecto

```
/
├── front/
│   ├── index.html
│   ├── script.js
│   ├── .htaccess
│   ├── styles.css
│   └── assets/
│       ├── logo.png
│       ├── bot.png
│       ├── whats.png
│       ├── ig.png
│       └── x.png
└── back/
    ├── chat.php
    ├── products.json
    └── img/
        ├── hoodie.png
        ├── printHoddie.png
        ├── beigeHoodie.png
        ├── zipHoodie.png
        ├── vintageHoodie.png
        ├── heavyHoodie.png
        ├── windbreaker.png
        ├── jeanJacket.png
        ├── vest.png
        ├── trench.png
        ├── bomber.png
        ├── overcoat.png
        ├── cap.png
        ├── bag.png
        ├── belt.png
        ├── beanie.png
        ├── socks.png
        ├── snikers.png
        ├── dadShoes.png
        ├── leather.png
        ├── running.png
        └── whiteSneakers.png
```


## Tecnologías

| Tipo | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript vanilla |
| Backend | PHP |
| IA | Groq API — modelo `llama-3.3-70b-versatile` |
| Autenticación | localStorage (sesión en cliente) |


## Requisitos

- Servidor con soporte PHP
- Acceso a internet desde el servidor (para llamadas a la API de Groq)
- API key de [Groq](https://console.groq.com)
- XAMP como servidor local



## Instalación

1. Clonar o descargar el repositorio en tu servidor

2. Configurar la API key de Groq, puedes generar una API key iniciando sesion en la pagina oficial de GROQ  (https://console.groq.com)

Y editar directamente despues de la línea 10 añadiendo la API KEY en `back/chat.php`:

3. Tener instalado XAMP como servidor local

4. Añadir la carpeta del proyecto en htdocs y abrir en el navegador `locahost/ElegancIA/front` 




## Funcionalidades

**Tienda**
- Catálogo de 22 productos en 4 categorías: Hoodies, Outerwear, Footwear y Accessories
- Vista de detalle de producto con tallas, colores, material y cuidados
- Navegación mediante URL (pushState) para compartir productos directamente
- Búsqueda en tiempo real por nombre, categoría o etiquetas

**Filtros**
- Filtrar por categoría, precio máximo, disponibilidad de stock y ordenación
- Panel de filtros accesible desde barra lateral y desde el modal de filtros

**Carrito**
- Añadir y eliminar productos
- Control de cantidad por producto
- Cálculo de subtotal, IVA (16%) y total
- Los productos sin stock no se pueden añadir

**Autenticación**
- Registro e inicio de sesión con validación de campos
- Contraseñas hasheadas antes de guardarse en localStorage
- Perfil del usuario accesible desde el navbar

**Asistente IA**
- Chat flotante de Groq (LLaMA 3.3 70B)
- Recomienda productos del inventario real, muestra tarjetas de producto en el chat
- Puede añadir productos al carrito directamente desde la conversación
- Historial de conversación de hasta 20 mensajes

## Añadir o modificar productos

Si se desea modificar o añadir productos, editar el archivo `back/products.json`. 
Cada producto sigue esta estructura:

```json
{
    "id": "H01",
    "nombre": "Nombre del producto",
    "precio": 45.00,
    "img": "../back/img/nombre-imagen.png",
    "categoria": "Hoodies",
    "descripcion": "Descripción corta.",
    "stock": true,
    "tallas": ["S", "M", "L", "XL"],
    "colores": ["Black"],
    "material": "100% Cotton",
    "cuidados": "Wash cold.",
    "etiquetas": ["basic", "winter"]
}
```

**Categorías disponibles:** `Hoodies`, `Outerwear`, `Footwear`, `Accessories`

El ID debe ser único. El campo `stock` acepta `true` o `false`. La IA utilizará automáticamente el inventario actualizado sin necesidad de ningún cambio adicional.
