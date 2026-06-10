# Melatoz — Tienda de Melatoninas Natrol

Landing page + tienda simple para vender melatoninas Natrol a través de WhatsApp.
Catálogo, carrito, promociones y stock gestionados desde un panel admin con
autenticación real (Supabase Auth) y base de datos en la nube (Supabase/PostgreSQL).

---

## Arquitectura y seguridad (resumen)

| Componente | Tecnología | Notas de seguridad |
|------------|-----------|--------------------|
| Sitio público | HTML/CSS/JS estático | Se puede alojar en GitHub Pages / Netlify / Vercel |
| Base de datos | Supabase (PostgreSQL) | Protegida con Row Level Security (RLS) |
| Login admin | Supabase Auth | Autenticación real con sesión; **no hay contraseñas en el código** |
| Clave en el frontend | `anon` public key | Pública por diseño: sin permisos de escritura sin sesión |

**Modelo de seguridad:**
- El visitante anónimo (clave `anon`) **solo puede leer** productos con `disponible = true`.
- Crear, editar y eliminar productos **requiere un usuario autenticado** (RLS lo exige a nivel de base de datos, no del navegador).
- La `service_role` key (acceso total que salta RLS) **nunca** está en el frontend ni en el repositorio. Solo se usa, si acaso, en el panel de Supabase.

> ℹ️ Es normal y seguro que la `anon` key esté visible en `supabase-config.js`. Está diseñada para ser pública. Quien la inspeccione **no** puede escribir en la base de datos porque RLS lo bloquea.

---

## Estructura de archivos

```
/
├── index.html              → Página principal de la tienda
├── styles.css              → Estilos visuales
├── script.js               → Carrito, WhatsApp, render de productos
├── products.js             → Catálogo de respaldo (si Supabase no responde)
├── supabase-config.js      → URL + anon key públicas (seguro exponer)
├── admin.html              → Panel de administración (requiere login)
├── admin.js                → Lógica del admin (Supabase Auth + CRUD)
├── SETUP-SUPABASE.sql      → Script para crear tabla + políticas RLS
├── README.md               → Este archivo
└── assets/images/          → Imágenes de productos
```

> `node_modules/`, `screenshots/`, `package.json` y `screenshot.mjs` son herramientas de
> desarrollo (Playwright para capturas). No son necesarias para que la tienda funcione
> y están ignoradas en `.gitignore`.

---

## Configurar Supabase (una sola vez)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor → New query**, pega el contenido de `SETUP-SUPABASE.sql` y ejecútalo.
   Esto crea la tabla `products`, las políticas RLS y los productos iniciales.
3. Ve a **Project Settings → API** y copia:
   - **Project URL** → pégala en `supabase-config.js` como `SUPABASE_URL`.
   - **anon public key** → pégala en `supabase-config.js` como `SUPABASE_ANON`.
   - **No copies la `service_role` key a ningún archivo del proyecto.**

### Crear el usuario admin

1. En Supabase ve a **Authentication → Users → Add user**.
2. Crea un usuario con tu correo y una contraseña fuerte (mínimo 12 caracteres, única).
3. Ese correo y contraseña son los que usarás para entrar en `admin.html`.

> El usuario admin vive en Supabase, no en el código. Para cambiar la contraseña,
> hazlo desde **Authentication → Users** en el panel de Supabase.

---

## Verificar que RLS está activo (importante antes de publicar)

En Supabase → **Authentication → Policies**, confirma que la tabla `products` tiene RLS
**activado** y estas políticas:

- `anon_read_available` → SELECT, solo `disponible = true` (visitantes).
- `admin_read_all` → SELECT para `authenticated`.
- `admin_insert` / `admin_update` / `admin_delete` → solo `authenticated`.

Si RLS aparece **desactivado**, cualquiera con la anon key podría escribir en tu base de datos.
El script `SETUP-SUPABASE.sql` ya lo deja activado; solo verifica que no se haya apagado.

---

## Gestionar la tienda (panel admin)

1. Abre `admin.html` (en tu deploy o localmente).
2. Inicia sesión con el usuario que creaste en Supabase.
3. Desde ahí puedes:
   - Agregar, editar y eliminar productos.
   - Marcar con/sin stock y definir cantidad exacta de stock.
   - Mostrar/ocultar productos.
   - Configurar promociones (precio oferta, fechas, etiqueta).
   - Reordenar productos arrastrándolos.

Todos los cambios se guardan en Supabase y se reflejan en la tienda al instante.

---

## Editar el catálogo de respaldo (`products.js`)

`products.js` solo se usa si Supabase no responde (modo de respaldo). Si quieres que ese
respaldo coincida con tu tienda real, edita el array `PRODUCTS` manualmente. En operación
normal, **gestiona todo desde el admin**, no desde este archivo.

Datos de contacto editables al inicio de `products.js`:

| Qué cambiar | Variable |
|-------------|----------|
| Número de WhatsApp | `WHATSAPP_NUMBER` |
| Horario de atención | `HORARIO_ATENCION` |
| Instagram | `INSTAGRAM_HANDLE` |

---

## Publicar la página en internet

### GitHub Pages
1. Sube el proyecto a un repositorio de GitHub.
2. **Settings → Pages → Source: main branch**.
3. Tu tienda queda en `tuusuario.github.io/melatoz`.

> El `admin.html` queda accesible en la URL pública, pero **está protegido por login real**.
> Sin las credenciales de Supabase no se puede entrar ni modificar nada. Además lleva
> `noindex` para que no aparezca en buscadores.

También funciona igual en **Netlify** (arrastra la carpeta) o **Vercel** (importa el repo).

---

## ¿Necesito servidor, backend, Terraform o puerto 22?

**No.** Esta tienda es un sitio estático + Supabase como backend gestionado:

- **Backend propio:** no. Supabase cumple ese rol (base de datos + auth + API).
- **Servidor / VPS:** no. GitHub Pages/Netlify/Vercel sirven los archivos por ti.
- **Puerto 22 (SSH):** no aplica. No administras ningún servidor propio.
- **Terraform:** no aplica. No hay infraestructura que aprovisionar como código.

Solo necesitarías esas cosas si en el futuro montaras un backend propio en un servidor/VPS.

---

## Checklist de seguridad antes de publicar

- [ ] RLS activado en la tabla `products` (verificado en Supabase).
- [ ] `supabase-config.js` contiene **solo** la anon key (nunca la service_role).
- [ ] Usuario admin creado en Supabase con contraseña fuerte y única.
- [ ] La contraseña del admin **no** está escrita en ningún archivo del repo.
- [ ] `.env` y `node_modules/` ignorados en `.gitignore`.
- [ ] `admin.html` tiene `noindex`.

---

## Créditos

- Diseño y código: generado con Claude Code.
- Fuentes: Google Fonts (Nunito, Playfair Display).
- Producto: Natrol Melatonin (marca registrada de sus respectivos dueños).
