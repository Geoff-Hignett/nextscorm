# NextScorm

A modern **Next.js + TypeScript SCORM course shell** with:

-   SCORM 1.2 & 2004 runtime support
-   Route and component-based internationalisation (i18n)

---

## 🧠 Architectural Principles

### 1. Progressive language delivery (local → API)

The language system is designed to support **multiple delivery strategies**, depending on both product requirements and **LMS constraints**.

Out of the box, it supports:

-   **Local JSON**  
    Languages are bundled with the app for fast startup and zero network dependency. This suits development-stage apps, static courses, and pre-CMS stage builds.

-   **Per-language API (`apiSingle`)**  
    Each language is fetched independently (e.g. `/api/lang/en-GB`), allowing:

    -   incremental loading
    -   smaller payloads
    -   easier cache control
    -   CMS-backed language updates without rebuilding the application

-   **All-languages API (`apiAll`)**  
    All languages are fetched from a single endpoint (e.g. `/api/langs`), which can be preferable when:
    -   runtime language switching is allowed
    -   languages are small
    -   the backend already aggregates translations centrally

In many LMS environments, multi-language SCORM packages are **not supported**. Platforms often require **one SCORM package per language**, with language selection handled externally. In these cases, the LangSelector component can be removed, and there is more reason to serve translation on a per-language API. Despite this, the system is designed to scale when the LMS allows it, or when the same codebase is reused outside of strict SCORM contexts.

The active delivery mode is controlled via configuration, not refactors, so the UI and consuming code remain unchanged.

#### Trade-offs

-   **Local JSON** is simplest and fastest, but requires a redeploy for content changes.
-   **Per-language APIs** scale well for CMS-driven content, but introduce more network requests.
-   **All-languages APIs** reduce request count, but can increase initial payload size.

The store abstracts these differences so that the application logic does not need to care _where_ language data comes from - only that it arrives in a consistent shape.

### 2. Route-scoped language

The majority of language fields are grouped by **route**, rather than being tied directly to individual components because:

-   **Content ownership is clearer** – pages own their copy, not components
-   **CMS-friendly structure** – non-developers think in terms of pages, not React components
-   **Translation process** – human translators prefer to see the language in the order it appears to ascertain context in real time
-   **Readability** – many courses reuse components across pages, which would otherwise require verbose, deeply nested keys to avoid collisions. A key like `s1_p1` can exist on every page without issue, but cannot be reused within the same component without additional structure.

Global UI copy (e.g. language selector labels) lives separately from route-scoped content.

### 3. Global SCORM lifecycle management

The SCORM runtime is treated as a **global concern**, rather than being tied to individual pages or components.

The SCORM connection:

-   initialises once at application load
-   persists across route changes
-   terminates cleanly on unload

This mirrors how LMS platforms expect SCORM content to behave and avoids repeated or invalid initialise / terminate calls during SPA navigation.

### 3.1 Runtime hydration and persistence precedence

On application startup, the course must restore learner progress before it knows
whether a SCORM LMS is available.

The runtime follows a **progressive hydration strategy**:

1. **Initial hydration from browser storage**

    - Used during local development and preview
    - Provides immediate state after refresh
    - Safe no-op for LMS-only users with no local data

2. **Authoritative hydration from the LMS**
    - Triggered after a successful SCORM initialise
    - Overrides any locally hydrated state
    - Ensures LMS data is always the final source of truth

This approach guarantees that:

-   local development works without an LMS
-   LMS-only learners always resume correctly
-   state is never lost due to timing or environment differences

Hydration is idempotent and may occur more than once during startup.
The store always hydrates from the best source available at that moment.

#### Why global?

SCORM APIs are stateful and fragile. Re-initialising the connection on every route change can lead to:

-   duplicate `Initialize()` calls
-   lost suspend data
-   invalid session states in stricter LMS implementations

By mounting the SCORM lifecycle once at the root layout level, the application behaves more like a traditional SCORM course while still benefiting from client-side routing.

#### Implementation

A dedicated `ScormWrapper` component is mounted at the application root. This is responsible for:

-   establishing the SCORM connection on first render
-   exposing SCORM state and actions via a global store
-   ensuring `Terminate()` is called exactly once on teardown

All SCORM reads and writes (location, suspend data, score, objectives, interactions) flow through a single store, keeping side effects predictable and auditable.

This design ensures that:

-   page components remain focused on UI and learning logic
-   SCORM concerns are isolated and testable
-   the course behaves consistently across SCORM 1.2 and 2004 LMSs

### 4. Suspend data strategy and encoding

SCORM suspend data is used as the **single source of truth** for learner progress that must survive page reloads, browser restarts, and LMS session boundaries.

However, suspend data comes with **strict constraints**, especially in SCORM 1.2:

-   maximum length limits (commonly 4096 characters)
-   LMS-specific character restrictions
-   inconsistent handling of quotes and special characters

To address this, suspend data is:

-   serialised as JSON
-   encoded to avoid problematic characters
-   validated against SCORM 1.2 length limits before writing

This allows complex course state to be stored safely without relying on LMS-specific behaviour.

#### Design goals

-   predictable encoding and decoding
-   no silent truncation
-   graceful failure when limits are exceeded
-   compatibility across SCORM 1.2 and 2004

All suspend data writes flow through a single store action, ensuring encoding rules and length checks are applied consistently.

---

### 5. SCORM version abstraction (1.2 vs 2004)

The application supports both **SCORM 1.2** and **SCORM 2004** without branching logic leaking into components.

Key differences between versions include:

-   different API data model paths
-   different status fields (`lesson_status` vs `completion_status`)
-   additional capabilities in 2004 (progress measures, richer interaction data)

These differences are abstracted behind store actions such as:

-   setting completion state
-   reading and writing location
-   recording scores, objectives, and interactions

Components and pages do not need to know which SCORM version is active. They interact with a stable API, while the store resolves the correct SCORM calls internally.

This keeps learning logic clean and prevents version-specific edge cases from spreading throughout the codebase.

---

### 6. Debug tooling and local development support

Working with SCORM often involves **slow feedback loops**, opaque LMS errors, and limited debugging tools.

To mitigate this, the project includes a dedicated SCORM debug interface that allows developers to:

-   inspect the detected SCORM version
-   manually trigger get and set operations
-   test objectives, scores, and completion behaviour
-   validate suspend data writes outside of an LMS

When no SCORM API is available (for example during local development), the system gracefully falls back to browser storage. This allows:

-   development without an LMS
-   rapid iteration on learning logic
-   easier debugging of state transitions

This dual-mode behaviour ensures that developers can build and test confidently, while the production build remains fully LMS-compliant.
