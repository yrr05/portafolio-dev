# El Consejo de Atlas

Aplicación web de gestión de gimnasios multi-sede, con vistas diferenciadas según el rol de cada usuario. Proyecto de fin de curso — Grado Superior en Desarrollo de Aplicaciones Web (DAW).

> 🔗 [Demo interactiva](https://claude.ai/artifact/L4RnwDFTL7y1WjynJbUmbn) — datos de ejemplo, pruébala sin instalar nada

## Funcionalidades

- **Tres roles de usuario**: cliente, admin de gimnasio y superadmin, cada uno con su propia vista y permisos
- **Gestión multi-gimnasio**: varios centros con administración independiente (clases, eventos, socios)
- **Rutinas**: catálogo de ejercicios y rutinas personales, además de rutinas compartidas por la comunidad
- **Clases y eventos**: inscripción con control de plazas disponibles
- **Panel de superadmin**: alta de gimnasios, administradores y gestión global de usuarios

## Stack

| Capa      | Tecnología |
|-----------|------------|
| Frontend  | React 19 + Vite, React Router |
| API       | 5 instancias de `json-server` (usuarios, rutinas, ejercicios, clases, eventos) |
| Sesión    | `sessionStorage` en el navegador |

Durante el desarrollo, cada recurso se sirve desde su propio `json-server` en un puerto distinto, simulando una API REST real sin necesidad de un backend propio.

## Cómo arrancarlo en local

```bash
git clone <url-de-este-repo>
cd el-consejo-de-atlas
npm install
```

El proyecto incluye un script que instala dependencias si faltan y levanta los 5 `json-server` junto con Vite en paralelo:

```bash
bash ARRANCAR.sh
```

O manualmente:

```bash
npm run start   # json-servers + vite dev en paralelo
```

La app queda disponible en `http://localhost:5173`.

## Estructura

```
el-consejo-de-atlas/
├── data/          # datos de ejemplo (usuarios, gimnasios, clases, eventos, rutinas)
├── public/        # logo e iconos
├── scripts/       # servidor de arranque de los json-server
├── src/           # código React (componentes, páginas, contexto de auth)
└── ARRANCAR.sh    # levanta todo el entorno con un solo comando
```

## Autor

Yeremi Rodríguez Rodríguez — [LinkedIn](https://www.linkedin.com/in/yeremi-rodríguez-rodríguez-582943311)
