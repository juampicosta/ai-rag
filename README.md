# AI RAG Application

Bienvenido a la documentación de **AI RAG**, una aplicación de Generación Aumentada por Recuperación (Retrival-Augmented Generation) diseñada para responder preguntas basándose en documentos procesados.

## 🚀 ¿Qué es RAG?

**RAG (Retrieval-Augmented Generation)** es una técnica que mejora la precisión y fiabilidad de los modelos de lenguaje (LLMs) proporcionándoles datos externos relevantes. En lugar de confiar únicamente en el conocimiento pre-entrenado del modelo, el sistema busca información específica en una base de conocimientos antes de generar una respuesta.

### El Flujo de RAG en este Proyecto

El flujo se divide en dos etapas principales: **Ingestión (Preparación)** y **Generación (Consulta)**.

#### 1. Ingestión de Datos (`lib/ai/embedding`)

Esta etapa ocurre "offline" o antes de que el usuario haga preguntas. Su objetivo es convertir documentos en un formato que la IA pueda entender y buscar eficientemente.

1.  **Carga (Load):** Se leen archivos (actualmente PDFs) desde el sistema de archivos.
2.  **División (Chunking):** El texto completo se divide en fragmentos más pequeños y manejables ("chunks") utilizando `RecursiveCharacterTextSplitter` de LangChain.
    - _Tamaño de chunk:_ 1000 caracteres.
    - _Superposición (Overlap):_ 200 caracteres (para mantener el contexto entre cortes).
3.  **Incrustación (Embedding):** Cada chunk se convierte en un vector numérico (una lista de números) utilizando un modelo de embedding (`nomic-embed-text` vía Ollama). Estos vectores representan el significado semántico del texto.
4.  **Almacenamiento (Indexing):** Los chunks de texto y sus vectores correspondientes se guardan en **MongoDB Atlas**.

#### 2. Generación de Respuesta (`lib/ai/retrieval.ts` y `generation.ts`)

Esta etapa ocurre cuando el usuario hace una pregunta.

1.  **Consulta (Query):** El usuario envía una pregunta.
2.  **Vectorización:** La pregunta se convierte en un vector usando el mismo modelo de embedding (`nomic-embed-text`).
3.  **Recuperación (Retrieval):** Se realiza una **Búsqueda Vectorial (Vector Search)** en MongoDB Atlas para encontrar los fragmentos de texto más similares semánticamente a la pregunta.
4.  **Prompting:** Se construye un "System Prompt" que incluye:
    - Instrucciones para la IA (actuar como asistente, hablar en español, etc.).
    - El **Contexto Recuperado** (los fragmentos de texto encontrados).
5.  **Generación:** El LLM (`llama3.2` vía Ollama) recibe el prompt y genera una respuesta basada en la información proporcionada.

---

## 🛠️ Stack Tecnológico

- **Runtime:** Node.js & TypeScript
- **Base de Datos:** MongoDB Atlas (con Vector Search)
- **ODM:** Mongoose
- **AI SDK:** Vercel AI SDK (`ai`)
- **Proveedor AI:** Ollama (Local)
  - _Modelo de Chat:_ `llama3.2`
  - _Modelo de Embedding:_ `nomic-embed-text`
- **Procesamiento de Texto:** LangChain (`@langchain/textsplitters`), `pdf-parse`

---

## ⚙️ Configuración e Instalación

### Prerrequisitos

1.  **Node.js** (v18 o superior)
2.  **Ollama** instalado y corriendo localmente.
    - Descarga los modelos necesarios:
      ```bash
      ollama pull llama3.2
      ollama pull nomic-embed-text
      ```
3.  **MongoDB Atlas Cluster**: Debes tener una cuenta en MongoDB Atlas y un cluster configurado. Además de setear la variable de entorno `DB_URL` en el archivo `.env`.

### Configuración de Base de Datos (MongoDB Atlas)

Para que la búsqueda vectorial funcione, debes crear un **Indice de Búsqueda Vectorial** en tu colección `documents`.

1.  Ve a tu colección en Atlas.
2.  Pestaña "Atlas Search" -> "Create Search Index".
3.  Selecciona "JSON Editor" y usa la siguiente configuración:

```json
{
  "fields": [
    {
      "numDimensions": 768,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_URL="mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<nombre-db>?retryWrites=true&w=majority"
NODE_ENV="development"
PORT=3000
```

### Instalación y Ejecución

1.  **Instalar dependencias:**

    ```bash
    npm install
    # o
    pnpm install
    ```

2.  **Ingestar Documentos:**
    Coloca tus archivos PDF en la carpeta apropiada y ejecuta:

    ```bash
    npm run ingest
    ```

3.  **Iniciar Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```

---

## 📂 Estructura del Proyecto

```
/
├── lib/
│   └── ai/
│       ├── embedding/
│       │   ├── ingest.ts       # Lógica de procesamiento y vectorización
│       │   └── run-ingest.ts   # Script de ejecución de ingestión
│       ├── generation.ts       # Lógica de generación de respuesta con LLM
│       └── retrieval.ts        # Lógica de búsqueda vectorial en MongoDB
├── models/
│   └── Document.ts             # Esquema de Mongoose para documentos
├── index.ts                    # Punto de entrada de la aplicación
└── package.json
```

## 📝 Notas Adicionales

- **Manejo de Errores:** Si el contexto no contiene información suficiente, el modelo está instruido para indicarlo en lugar de alucinar una respuesta.
- **Temperatura:** Se usa una temperatura baja (0.1) para maximizar la consistencia factual.
