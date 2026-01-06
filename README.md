# NextScorm

A modern **Next.js + TypeScript SCORM course shell** with:

-   SCORM 1.2 & 2004 runtime support
-   Route and component-based internationalisation (i18n)

---

## 🧠 Architectural Principles

### 1. Progressive language delivery (local → API)

The language system is designed to support **multiple delivery strategies**, depending on the needs of the project and its future evolution.

Out of the box, it supports:

-   **Local JSON**  
    Languages are bundled with the app for fast startup, zero network dependency, and simple development.

-   **Per-language API (`apiSingle`)**  
    Each language is fetched independently (e.g. `/api/lang/en-GB`), allowing:

    -   incremental loading
    -   smaller payloads
    -   easier cache control
    -   CMS-backed languages without shipping all content up front

-   **All-languages API (`apiAll`)**  
    All languages are fetched from a single endpoint (e.g. `/api/langs`), which can be preferable when:
    -   languages are small
    -   switching languages frequently
    -   the backend already aggregates translations centrally

The active mode is controlled via configuration, not refactors, so the UI and consuming code remain unchanged.

#### Trade-offs

-   **Local JSON** is simplest and fastest, but requires a redeploy for content changes.
-   **Per-language APIs** scale well for CMS-driven content, but introduce more network requests.
-   **All-languages APIs** reduce request count, but can increase initial payload size.

The store abstracts these differences so that the application logic does not need to care _where_ language data comes from - only that it arrives in a consistent shape.

### 2. Route-scoped language

The majority of language fields are grouped by **route**, rather than being tied directly to individual components.

Why?

-   **Content ownership is clearer** – pages own their copy, not components
-   **CMS-friendly structure** – non-developers think in terms of pages, not React components
-   **Translation process** – human translators prefer to see the language in the order it appears to ascertain context in real time
-   **Avoids key collisions** as the course grows

Global UI copy (e.g. language selector labels) lives separately from route-scoped content.
