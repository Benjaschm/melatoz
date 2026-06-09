// ============================================================
// MELATOZ — Catálogo de productos
// ============================================================
// Edita este archivo para gestionar tu tienda.
//
// CAMPOS POR PRODUCTO:
//   id          → número único, no cambiar una vez creado
//   nombre      → nombre completo del producto
//   marca       → marca del producto (ej: "Natrol")
//   dosis       → dosis activa por porción (ej: "10mg")
//   cantidad    → número total de gomitas en el envase
//   sabor       → sabor del producto
//   descripcion → texto corto para la card (1-2 oraciones)
//   precio      → precio en CLP como número entero (sin puntos ni símbolos)
//   imagen      → ruta a la imagen principal del producto
//   imagenes    → array de rutas a imágenes adicionales (opcional)
//   stock       → true si hay stock disponible, false si está agotado
//   disponible  → true para mostrar el producto, false para ocultarlo
//   etiqueta    → texto del badge de color (ej: "Más vendido", "Kids", "Nuevo")
//   categoria   → "adultos" o "kids"  (para el filtro de la tienda)
//   destacado   → true para mostrarlo primero en la grilla
//
// CÓMO CAMBIAR PRECIOS:
//   Cambia el campo "precio" al nuevo valor. Ejemplo: precio: 15990
//
// CÓMO MARCAR SIN STOCK:
//   Cambia "stock: true" a "stock: false"
//
// CÓMO OCULTAR UN PRODUCTO:
//   Cambia "disponible: true" a "disponible: false"
//
// CÓMO AGREGAR UN PRODUCTO NUEVO:
//   Copia un bloque completo, cambia el id (usa el siguiente número),
//   y rellena todos los campos.
//
// CÓMO CAMBIAR IMÁGENES:
//   Pon el archivo en assets/images/ y actualiza el campo "imagen".
//
// ============================================================

// Número de WhatsApp de la tienda (con código de país, sin + ni espacios)
const WHATSAPP_NUMBER = "56939060956";

// Horario de atención (se muestra en la sección de contacto)
const HORARIO_ATENCION = "Lunes a Viernes, 10:00 – 20:00 hrs";

// Instagram de la tienda (sin @, dejar vacío si no tienes)
const INSTAGRAM_HANDLE = "melatoz.cl";

const PRODUCTS = [
  {
    id: 1,
    nombre: "Melatonina Natrol Kids 1mg",
    marca: "Natrol",
    dosis: "1mg",
    cantidad: 90,
    sabor: "Frambuesa",
    descripcion: "Para niños desde los 4 años. Formato gummy suave con sabor a frambuesa, sin saborizantes artificiales.",
    precio: 12990,
    imagen: "assets/images/natrol-kids-1mg-90.png",
    imagenes: [
      "assets/images/natrol-kids-1mg-90.png",
      "assets/images/supplement-facts-kids-1mg.png"
    ],
    stock: true,
    disponible: true,
    etiqueta: "Kids",
    categoria: "kids",
    destacado: false
  },
  {
    id: 2,
    nombre: "Melatonina Natrol 10mg",
    marca: "Natrol",
    dosis: "10mg",
    cantidad: 90,
    sabor: "Frutilla",
    descripcion: "Para adultos. 45 porciones de 2 gomitas. Sabor frutilla natural. Sin saborizantes artificiales ni OGM.",
    precio: 14990,
    imagen: "assets/images/natrol-10mg-90.png",
    imagenes: [
      "assets/images/natrol-10mg-90.png",
      "assets/images/supplement-facts-10mg-90.png"
    ],
    stock: true,
    disponible: true,
    etiqueta: "Más vendido",
    categoria: "adultos",
    destacado: true
  },
  {
    id: 3,
    nombre: "Melatonina Natrol 10mg",
    marca: "Natrol",
    dosis: "10mg",
    cantidad: 140,
    sabor: "Frutilla",
    descripcion: "Para adultos. El formato con más gomitas: 70 porciones sabor frutilla. Ideal para stock prolongado.",
    precio: 19990,
    imagen: "assets/images/natrol-10mg-140.png",
    imagenes: [
      "assets/images/natrol-10mg-140.png",
      "assets/images/supplement-facts-10mg-140.png"
    ],
    stock: true,
    disponible: true,
    etiqueta: "Mejor valor",
    categoria: "adultos",
    destacado: false
  }
];
