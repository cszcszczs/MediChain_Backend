# MediChain Backend

Backend REST para gestión de pacientes, profesionales médicos, historial clínico y autorizaciones de acceso. La API está construida con Node.js, TypeScript, Express y Prisma, y expone una capa de autenticación basada en JWT.

## Tabla de contenido

- [Descripción general](#descripción-general)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
- [Notas adicionales](#notas-adicionales)

## Descripción general

MediChain Backend centraliza la lógica de negocio para:

- Registro e inicio de sesión de usuarios y profesionales.
- Gestión de pacientes.
- Gestión de profesionales médicos.
- Registro de historiales clínicos con diagnósticos, tratamiento y medicamentos.
- Subida de archivos adjuntos al historial médico.
- Control de permisos de acceso entre profesionales y pacientes.

La API se sirve bajo el prefijo principal:

```bash
/v1
```

Ejemplo base:

```bash
http://localhost:3000/v1
```

## Tecnologías

- Node.js
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- Supabase Storage
- JWT con `jose`
- Zod para validación
- Multer para carga de archivos

## Requisitos

Antes de iniciar el proyecto debes tener instalado:

- Node.js 18 o superior
- npm o pnpm
- PostgreSQL
- Cuenta de Supabase (si vas a usar almacenamiento para historiales)

## Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd MediChain_Backend
```

2. Instala dependencias:

```bash
npm install
```

3. Configura tus variables de entorno.

4. Genera el cliente de Prisma y sincroniza la base de datos:

```bash
npx prisma generate
npx prisma migrate deploy
```

Si estás trabajando en local con migraciones de desarrollo:

```bash
npx prisma migrate dev
```

## Variables de entorno

Crea un archivo `.env` basado en `.env.example` y completa los valores reales.

```env
PORT=3000
JWT_SECRET=tu_secreto_super_seguro_con_mas_de_32_bytes
DATABASE_URL=postgresql://usuario:password@host:puerto/base_de_datos
DIRECT_URL=postgresql://usuario:password@host:puerto/base_de_datos
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_HISTORY_BUCKET=medical-history
```

Nota importante:

- `JWT_SECRET` es obligatorio y debe tener al menos 32 bytes.
- El backend usa `DATABASE_URL` o `DIRECT_URL` para conectarse con Prisma.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_HISTORY_BUCKET` son requeridos si vas a subir archivos al historial médico.

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm run build
npm start
```

El proyecto también expone una ruta de salud:

```bash
GET /health
```

Respuesta esperada:

```json
{
  "message": "Server Running..."
}
```

## Autenticación

La API usa JWT en cabeceras HTTP.

Formato:

```http
Authorization: Bearer <token>
```

Los endpoints protegidos requieren una cabecera válida. Si el token no existe o es inválido, la API responde con `401`.

Ejemplo:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

A continuación se listan todos los endpoints disponibles en el backend.

### 1) Health check

#### GET /health

Verifica que el servidor esté activo.

**No requiere autenticación.**

Respuesta:

```json
{
  "message": "Server Running..."
}
```

---

### 2) Auth

#### POST /v1/auth/login

Autentica a un usuario con email y contraseña.

**No requiere autenticación.**

**Body**:

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta esperada**:

```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com"
  }
}
```

---

### 3) Pacientes

#### GET /v1/patient

Lista pacientes activos.

**Requiere autenticación.**

**Headers**:

```http
Authorization: Bearer <token>
```

**Respuesta**: retorna la colección de pacientes activos.

#### POST /v1/patient

Crea un nuevo paciente.

**Requiere autenticación.**

**Body**:

```json
{
  "firstName": "Ana",
  "lastName": "García",
  "documentType": "CEDULA",
  "documentNumber": "1234567890",
  "birthDate": "1995-02-15",
  "gender": "FEMENINO",
  "email": "ana.garcia@ejemplo.com",
  "phone": "3001234567",
  "city": "Bogotá",
  "address": "Calle 123 #45-67",
  "password": "password123"
}
```

**Campos importantes**:

- `documentType` acepta valores del enum `DocumentType`:
  - `CEDULA`
  - `TARJETA_IDENTIDAD`
  - `PASAPORTE`
  - `CEDULA_EXTRANJERIA`
- `gender` acepta:
  - `MASCULINO`
  - `FEMENINO`
  - `OTRO`
- `password` debe tener mínimo 8 caracteres.

---

### 4) Profesionales

#### GET /v1/professional

Lista profesionales activos.

**Requiere autenticación.**

#### POST /v1/professional

Registra un nuevo profesional médico.

**Requiere autenticación.**

**Body**:

```json
{
  "firstName": "Carlos",
  "lastName": "Mendoza",
  "documentType": "CEDULA",
  "documentNumber": "987654321",
  "phone": "3007654321",
  "email": "carlos@ejemplo.com",
  "specialty": "CARDIOLOGY",
  "medicalLicense": "MED-4567",
  "institution": "Clínica Central",
  "password": "password123"
}
```

**Campos importantes**:

- `specialty` acepta valores del enum `Specialty`:
  - `GENERAL_MEDICINE`
  - `PEDIATRICS`
  - `CARDIOLOGY`
  - `GENERAL_SURGERY`
  - `GYNECOLOGY`
  - `DERMATOLOGY`
  - `NEUROLOGY`
  - `PSYCHIATRY`
  - `ORTHOPEDICS`
  - `OPHTHALMOLOGY`

---

### 5) Historial médico

#### POST /v1/history

Crea un historial clínico para un paciente.

**Requiere autenticación.**

**Content-Type**: `multipart/form-data`

La API espera un campo JSON llamado `data` y opcionalmente archivos adjuntos con nombre `attachments`.

**Ejemplo de request con FormData**:

```javascript
const form = new FormData();

form.append(
  "data",
  JSON.stringify({
    "patientId": "f9d4b4f7-4ca2-4a3d-857a-9417fd9462a7",
    "consultationDate": "2026-10-12T10:30:00.000Z",
    "diagnosis": "Hipertensión leve",
    "treatment": "Control con dieta y ejercicio, seguimiento semanal",
    "symptoms": "Dolor de cabeza ocasional",
    "bloodPressure": "120/80",
    "heartRate": 72,
    "temperature": 36.8,
    "weight": 68.5,
    "medications": [
      {
        "name": "Aspirina",
        "dose": "100 mg",
        "frequency": "Cada 12 horas"
      }
    ],
    "exams": [
      {
        "name": "Hemograma",
        "performedAt": "2026-10-12T09:00:00.000Z",
        "status": "COMPLETED",
        "result": "Sin alteraciones relevantes"
      }
    ],
    "notes": "Paciente estable en consulta"
  })
);

form.append("attachments", file1, "resultado.pdf");
form.append("attachments", file2, "analisis.png");
```

**Restricciones de archivos**:

- Máximo 5 archivos por historial
- Máximo 10 MB por archivo
- Tipos permitidos:
  - `application/pdf`
  - `image/jpeg`
  - `image/png`

**Respuesta esperada**: se devuelve el historial creado con diagnóstico, tratamiento, medicamentos, exámenes y adjuntos.

---

### 6) Access Grants (autorizaciones)

Estas rutas permiten gestionar permisos de acceso a la información del paciente.

#### POST /v1/access-grants

Crea una autorización de acceso.

**Requiere autenticación.**

**Body**:

```json
{
  "professionalId": "cm2d1t5g70000abc123xyz",
  "patientId": "f9d4b4f7-4ca2-4a3d-857a-9417fd9462a7",
  "actions": ["READ", "UPDATE"],
  "expiresAt": "2027-01-01T00:00:00.000Z"
}
```

**Campos importantes**:

- `actions` acepta un arreglo con permisos del enum `PermissionAction`:
  - `READ`
  - `UPDATE`
  - `CREATE`
  - `DELETE`
  - `AUTHORIZE_ACCESS`
- `expiresAt` es opcional y debe ser una fecha futura.

#### GET /v1/access-grants

Lista autorizaciones.

**Requiere autenticación.**

**Query params opcionales**:

- `status`: filtra por estado
- `search`: busca por texto relacionado

Ejemplo:

```http
GET /v1/access-grants?status=PENDING&search=cardiologia
```

#### PATCH /v1/access-grants/:id/accept

Acepta una autorización de acceso.

**Requiere autenticación.**

#### PATCH /v1/access-grants/:id/revoke

Revoca una autorización de acceso.

**Requiere autenticación.**

---

## Códigos de estado HTTP

La API usa los siguientes códigos principales:

- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `413` Payload Too Large
- `500` Internal Server Error

## Ejemplo de flujo completo

1. El usuario o profesional inicia sesión con `POST /v1/auth/login`.
2. Guarda el valor de `accessToken`.
3. Añade la cabecera `Authorization: Bearer <token>` a todas las peticiones protegidas.
4. Crea o consulta pacientes y profesionales.
5. Genera historial médico con `POST /v1/history`.
6. Si es necesario, crea permisos con `POST /v1/access-grants`.

## Estructura del proyecto

```text
.
├── prisma/
│   ├── auth.prisma
│   ├── access-grant.prisma
│   ├── patient.prisma
│   ├── professional.prisma
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── dto/
│   ├── exceptions/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── main.ts
│   └── server.ts
├── tests/
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

## Notas adicionales

- Los endpoints de pacientes y profesionales están protegidos con `authenticate`.
- La carga de historiales médicos usa `multipart/form-data` con validación de JSON en el campo `data`.
- El historial permite adjuntar archivos en formato PDF o imágenes JPG/PNG.
- Las validaciones y mensajes de error están centralizadas con `zod`.

Si quieres, en un siguiente paso puedo dejarte también un README más orientado a frontend/mobile con ejemplos de consumo en curl, Postman o JavaScript, o incluso generar una colección de Postman para esta API.
