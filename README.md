# Melatoz — Tienda de Melatoninas Natrol

Landing page + e-commerce simple para vender melatoninas Natrol a través de WhatsApp.

---

## Cómo abrir la página

1. Abre la carpeta del proyecto en tu computador.
2. Haz doble clic en `index.html` — se abre en tu navegador.
3. Listo. No necesitas servidor, ni instalar nada.

> Para subir la página a internet, ve a la sección "Cómo publicar" más abajo.

---

## Estructura de archivos

```
/
├── index.html              → Página principal de la tienda
├── styles.css              → Todos los estilos visuales
├── script.js               → Lógica del carrito, WhatsApp, UI
├── products.js             → CATÁLOGO DE PRODUCTOS (edita aquí)
├── admin.html              → Panel de administración local
├── admin.js                → Lógica del panel admin
├── README.md               → Este archivo
└── assets/
    └── images/
        ├── INSTRUCCIONES.txt   → Guía de imágenes
        └── (tus imágenes aquí)
```

---

## Cómo cambiar el número de WhatsApp

1. Abre `products.js`
2. Busca la línea: `const WHATSAPP_NUMBER = "56939060956";`
3. Cambia el número (con código de país, sin `+` ni espacios)
4. Guarda el archivo

---

## Cómo editar productos en `products.js`

Abre `products.js` y modifica el array `PRODUCTS`. Cada producto tiene estos campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | número | Identificador único. No cambiar una vez creado |
| `nombre` | texto | Nombre completo del producto |
| `marca` | texto | Marca (ej: "Natrol") |
| `dosis` | texto | Dosis por porción (ej: "10mg") |
| `cantidad` | número | Gomitas totales en el envase |
| `sabor` | texto | Sabor del producto |
| `descripcion` | texto | Texto corto para la card de producto |
| `precio` | número | Precio en CLP, sin puntos (ej: `14990`) |
| `imagen` | texto | Ruta relativa de la imagen principal |
| `imagenes` | array | Rutas de imágenes adicionales |
| `stock` | true/false | `true` = con stock, `false` = agotado |
| `disponible` | true/false | `true` = se muestra, `false` = oculto |
| `etiqueta` | texto | Badge de color en la card (ej: "Más vendido") |
| `categoria` | texto | `"adultos"` o `"kids"` |
| `destacado` | true/false | `true` = aparece primero en la grilla |

### Cambiar precio de un producto

```js
precio: 15990,   // ← cambia este número
```

### Marcar un producto como sin stock

```js
stock: false,   // ← cambia a false
```

El botón "Agregar al carrito" cambiará automáticamente a "Consultar disponibilidad".

### Ocultar un producto sin eliminarlo

```js
disponible: false,   // ← cambia a false
```

El producto no aparecerá en la tienda hasta que vuelvas a `true`.

### Agregar un producto nuevo

Copia este bloque al final del array `PRODUCTS` (antes del `]`) y rellena los datos:

```js
{
  id: 4,                    // ← número nuevo (el siguiente disponible)
  nombre: "Nombre del producto",
  marca: "Natrol",
  dosis: "5mg",
  cantidad: 60,
  sabor: "Frambuesa",
  descripcion: "Descripción corta del producto.",
  precio: 11990,
  imagen: "assets/images/mi-producto.jpg",
  imagenes: ["assets/images/mi-producto.jpg"],
  stock: true,
  disponible: true,
  etiqueta: "Nuevo",
  categoria: "adultos",
  destacado: false
}
```

### Eliminar un producto

Borra el bloque completo del producto en `products.js`, desde `{` hasta `}` (incluida la coma final si no es el último).

---

## Cómo cambiar imágenes

1. Guarda el nuevo archivo en `assets/images/`
2. Abre `products.js` y cambia el campo `imagen` del producto:
   ```js
   imagen: "assets/images/mi-nueva-imagen.jpg",
   ```
3. Recarga `index.html`

Nombres de archivo sugeridos para los productos actuales:
- `natrol-kids-1mg-90.jpg`
- `natrol-10mg-90.jpg`
- `natrol-10mg-140.jpg`

---

## Panel de administración (admin.html)

### Cómo abrir el admin

1. Abre `admin.html` en el navegador (doble clic)
2. Usa las credenciales:
   - **Usuario:** `admin`
   - **Contraseña:** `melatoz2024`

### Cómo cambiar las credenciales del admin

Abre `admin.js` y cambia estas dos líneas al inicio:

```js
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'melatoz2024';
```

> ⚠️ **IMPORTANTE:** Esto no es seguridad real. Las credenciales están en texto plano en el código JavaScript. Cualquiera que inspeccione el código del navegador puede verlas. El panel admin es solo para **uso local** o prototipo.

### Qué puedes hacer en el admin

- Ver todos los productos
- Editar nombre, precio, descripción, imagen, sabor, dosis, etc.
- Marcar con/sin stock (toggle rápido)
- Mostrar/ocultar producto
- Agregar producto nuevo
- Eliminar producto

> **Nota:** Los cambios hechos en el admin se guardan en `localStorage` del navegador. Si abres `index.html` en otro navegador o dispositivo, seguirá mostrando los productos de `products.js`, no los del admin. Para que los cambios del admin afecten la tienda real, tendrías que copiar los datos manualmente a `products.js`.

---

## ⚠️ Limitaciones del panel admin sin backend

El panel admin actual:
- Solo funciona en el navegador donde lo abras (datos en localStorage)
- No sincroniza con la tienda real automáticamente
- No tiene seguridad real (las credenciales son visibles en el código)
- Si borras el historial del navegador, pierdes los cambios del admin

**Para un admin seguro en producción necesitas:**
- Un backend real: Firebase, Supabase, Airtable, Strapi, Sanity, etc.
- Autenticación real con tokens y sesiones del servidor
- Base de datos en la nube que sincronice con la tienda

---

## Cómo publicar la página en internet

### Opción 1: Netlify (gratis, recomendado)
1. Crea cuenta en [netlify.com](https://netlify.com)
2. Arrastra la carpeta del proyecto al dashboard
3. Listo, tu tienda tiene URL pública

### Opción 2: GitHub Pages (gratis)
1. Sube el proyecto a un repositorio de GitHub
2. Ve a Settings → Pages → Source: main branch
3. Tu tienda queda en `tuusuario.github.io/melatoz`

### Opción 3: Vercel (gratis)
1. Crea cuenta en [vercel.com](https://vercel.com)
2. Importa desde GitHub o sube la carpeta
3. Deploy automático

---

## Cómo revisar que la página se vea bien en celular

### Opción 1: DevTools del navegador
1. Abre `index.html` en Chrome o Firefox
2. Presiona `F12` → ícono de celular (Toggle device toolbar)
3. Selecciona iPhone, Pixel, u otro dispositivo

### Opción 2: Red local con tu celular real
1. Abre `index.html` en Chrome
2. En la URL verás algo como `file:///...` — esto no funciona en el celular
3. Necesitas un servidor local: abre Terminal y ejecuta:
   ```bash
   cd /ruta/a/tu/proyecto
   python3 -m http.server 8080
   ```
4. En tu celular (misma red Wi-Fi), abre: `http://IP-DE-TU-MAC:8080`
5. Tu IP de Mac la ves en Ajustes del sistema → Wi-Fi → detalles

---

## Personalización rápida

| Qué cambiar | Dónde |
|-------------|-------|
| Número WhatsApp | `products.js` → `WHATSAPP_NUMBER` |
| Horario de atención | `products.js` → `HORARIO_ATENCION` |
| Instagram | `products.js` → `INSTAGRAM_HANDLE` |
| Colores | `styles.css` → variables `:root` |
| Fuentes | `index.html` → Google Fonts link |
| Logo / nombre | `index.html` → `.brand-text` |

---

## Créditos

- Diseño y código: generado con Claude Code
- Fuentes: Google Fonts (Nunito, Playfair Display)
- Producto: Natrol Melatonin (marca registrada de sus respectivos dueños)
