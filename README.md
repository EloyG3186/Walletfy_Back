# Walletfy - Backend API

API REST para la aplicacion Walletfy de gestion de gastos personales. Esta API permite a los usuarios registrar, categorizar y analizar sus gastos e ingresos personales.

## Tecnologías utilizadas

- Node.js
- Express.js
- MongoDB
- Mongoose
- Joi (validaciones)

## Requisitos previos

- Node.js (v14 o superior)
- MongoDB (local o Atlas)

## Instalaciones

1. Clonar el repositorio
2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo `.env` en la raiz del proyecto con las siguientes variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/walletfy
NODE_ENV=development
```

4. Iniciar el servidor:

```bash
# Modo desarrollo
npm run dev

# Modo produccion
npm start
```

## Estructura del proyecto

```
/backend
  /src
    /config        # Configuracion de la aplicacion
    /controllers   # Controladores para manejar la logica de negocio
    /middlewares   # Middlewares personalizados
    /models        # Modelos de datos y esquemas de validacion
    /routes        # Definicion de rutas de la API
  .env             # Variables de entorno
  index.js         # Punto de entrada de la aplicaciu00f3n
  package.json     # Dependencias y scripts
```

## Endpoints de la API

### Eventos

| Mu00e9todo | Ruta | Descripciu00f3n |
|--------|------|-------------|
| GET | `/api/events` | Obtener todos los eventos |
| GET | `/api/events/:id` | Obtener un evento por ID |
| POST | `/api/events` | Crear un nuevo evento |
| PUT | `/api/events/:id` | Actualizar un evento existente |
| DELETE | `/api/events/:id` | Eliminar un evento |
| GET | `/api/events/summary/monthly` | Obtener resumen mensual de gastos |

## Modelo de datos

### Evento

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "date": "number",  // Timestamp en formato Unix
  "amount": "number",
  "type": "string",  // "income" o "expense"
  "attachment": "string"
}
```

## Integraciu00f3n con el Frontend

Para integrar esta API con el frontend existente, es necesario actualizar la implementación del datasource en el frontend para que utilice esta API en lugar del almacenamiento local. Esto implica modificar el archivo `LocalStorageDS.ts` para que realice peticiones HTTP a los endpoints de esta API.

## Contribuir

1. Hacer fork del repositorio
2. Crear una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request
