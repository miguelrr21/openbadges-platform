# Open Badges Platform (GDG on Campus)

Sistema integral de credenciales digitales verificables basado en el estándar internacional **Open Badges v2.0** con verificación alojada (**Hosted Badge**).

## 🚀 Características

1. **Backend Open Badges v2.0 estándar**:
   - `GET /api/badges/issuer` - Devuelve el perfil del emisor oficial (organización).
   - `GET /api/badges/class/:id` - Devuelve la especificación del evento/insignia (BadgeClass).
   - `GET /api/badges/assertion/:id` - Devuelve la asignación criptográfica (hash SHA-256 + salt del correo del destinatario y verificación `HostedBadge`).
2. **Interfaz Web de Certificados (`/cert/:id`)**:
   - Visualización responsiva y estilizada:
     - **Estilo Original GDG**: Minimalista con cabecera de 4 colores Google, rol y firmas.
     - **Estilo Hackathon / Achievement**: Badge de competición, medallas/puesto y asignación de grupo.
   - Botón directo **"Añadir a LinkedIn"** con los parámetros oficiales de certificación (`CERTIFICATION_NAME`, `organizationName`, `certUrl`, `certId`).
   - Modal **"Cartera Open Badges"** con enlace a mochilas digitales (Badgr / Canvas Badges), validador oficial **BadgeCheck.io** y descarga del archivo JSON de la Assertion.
   - Código QR de verificación para escaneo con móvil.
   - Formato optimizado para impresión o guardado en PDF (`@media print`).
3. **Panel del Asistente (`/my-badges`)**:
   - Permite consultar todos los certificados emitidos a un correo y gestionarlos en un único lugar.
4. **Panel de Emisión (`/admin`)**:
   - Creación de nuevas insignias (`BadgeClass`).
   - Emisión instantánea de certificados a participantes individuales o por lotes.

## 🛠️ Cómo ejecutar el proyecto

```bash
cd C:\Users\migue\Projects\openbadges-platform

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

## 🌐 Variables de entorno (Opcional en despliegue)

En `.env.local` o en la plataforma de despliegue (Vercel, VPS, etc.):
```env
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```
Si no se define, el backend autodetecta la cabecera `Host` de las peticiones para emitir las URLs canónicas correctas.
