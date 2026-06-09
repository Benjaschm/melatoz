// ============================================================
// MELATOZ — Catálogo de productos
// ============================================================
// Edita este archivo para gestionar tu tienda.
//
// CAMPOS POR PRODUCTO:
//   id             → número único, no cambiar una vez creado
//   nombre         → nombre completo del producto
//   marca          → marca del producto (ej: "Natrol")
//   dosis          → dosis activa por porción (ej: "10mg")
//   cantidad       → número total de gomitas en el envase
//   sabor          → sabor del producto
//   descripcion    → texto corto para la card (1-2 oraciones)
//   precio         → precio NORMAL en CLP (número entero, sin puntos)
//   imagen         → ruta a la imagen principal del producto
//   imagenes       → array de rutas a imágenes adicionales (opcional)
//   stock          → true si hay stock disponible, false si está agotado
//   disponible     → true para mostrar el producto, false para ocultarlo
//   etiqueta       → texto del badge de color (ej: "Más vendido", "Kids", "Nuevo")
//   categoria      → "adultos" o "kids"  (para el filtro de la tienda)
//   destacado      → true para mostrarlo primero en la grilla
//
// CAMPOS DE PROMOCIÓN:
//   promo_activa   → true activa la oferta, false la desactiva
//   precio_oferta  → precio con descuento en CLP (debe ser menor que precio)
//                    Si es null o mayor/igual al precio normal, la promo no se muestra.
//   texto_promo    → etiqueta visible (ej: "Oferta", "Cyber", "Promo limitada")
//   promo_inicio   → fecha de inicio ISO (ej: "2025-11-27T00:00:00")
//                    null = sin restricción de fecha de inicio
//   promo_fin      → fecha de término ISO (ej: "2025-11-29T23:59:59")
//                    null = sin fecha de vencimiento
//
//   El % de descuento se calcula automáticamente desde precio y precio_oferta.
//   El carrito y WhatsApp siempre usarán precio_oferta cuando la promo está activa.
//   Si promo_activa: false → se muestra solo el precio normal.
//   Si promo_activa: true pero precio_oferta es null o inválido → precio normal.
//
// CÓMO ACTIVAR UNA PROMO:
//   promo_activa: true, precio_oferta: 11990
//
// CÓMO DESACTIVARLA:
//   promo_activa: false  (precio_oferta puede quedar guardado para reactivar después)
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
    destacado: false,
    promo_activa: false,
    precio_oferta: null,
    texto_promo: "Oferta",
    promo_inicio: null,
    promo_fin: null
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
    destacado: true,
    promo_activa: false,
    precio_oferta: null,
    texto_promo: "Oferta",
    promo_inicio: null,
    promo_fin: null
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
    destacado: false,
    promo_activa: false,
    precio_oferta: null,
    texto_promo: "Oferta",
    promo_inicio: null,
    promo_fin: null
  }
];
