# Graph Report - C:\Users\poo\.gemini\antigravity\scratch\pdf_bookshelf_extension  (2026-06-15)

## Corpus Check
- 83 files · ~53,978 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1053 nodes · 1898 edges · 68 communities (31 shown, 37 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.93)
- Token cost: 15,000 input · 1,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_ach Group|ach Group]]
- [[_COMMUNITY_viewer Group|viewer Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_binarySearchFirstItem() Group|binarySearchFirstItem() Group]]
- [[_COMMUNITY_AltTextManager Group|AltTextManager Group]]
- [[_COMMUNITY_getCurrentHash() Group|getCurrentHash() Group]]
- [[_COMMUNITY_abort() Group|abort() Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_addLocalBtn Group|addLocalBtn Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_CachedSyncIterable Group|CachedSyncIterable Group]]
- [[_COMMUNITY_PDFFindController Group|PDFFindController Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_db Group|db Group]]
- [[_COMMUNITY_debugger Group|debugger Group]]
- [[_COMMUNITY_GenericScripting Group|GenericScripting Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_BasePreferences Group|BasePreferences Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_manifest Group|manifest Group]]
- [[_COMMUNITY_package Group|package Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_isValidScrollMode() Group|isValidScrollMode() Group]]
- [[_COMMUNITY_PDFSidebar Group|PDFSidebar Group]]
- [[_COMMUNITY_PDFThumbnailView Group|PDFThumbnailView Group]]
- [[_COMMUNITY_Background Service Worker Group|Background Service Worker Group]]
- [[_COMMUNITY_isValidRotation() Group|isValidRotation() Group]]
- [[_COMMUNITY_CaretBrowsingMode Group|CaretBrowsingMode Group]]
- [[_COMMUNITY_BaseExternalServices Group|BaseExternalServices Group]]
- [[_COMMUNITY_PDFRenderingQueue Group|PDFRenderingQueue Group]]
- [[_COMMUNITY_getCharacterType() Group|getCharacterType() Group]]
- [[_COMMUNITY_match() Group|match() Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_docProperties() Group|docProperties() Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_createSanitizedElement() Group|createSanitizedElement() Group]]
- [[_COMMUNITY_handleDownloadProgress() Group|handleDownloadProgress() Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_getXfaHtmlForPrinting() Group|getXfaHtmlForPrinting() Group]]
- [[_COMMUNITY_DATETIME() Group|DATETIME() Group]]
- [[_COMMUNITY_Group| Group]]
- [[_COMMUNITY_PDFDocumentProperties Group|PDFDocumentProperties Group]]
- [[_COMMUNITY_PDFLayerViewer Group|PDFLayerViewer Group]]
- [[_COMMUNITY_PDFAttachmentViewer Group|PDFAttachmentViewer Group]]
- [[_COMMUNITY_DownloadManager Group|DownloadManager Group]]
- [[_COMMUNITY_getMemoizerForLocale() Group|getMemoizerForLocale() Group]]
- [[_COMMUNITY_AnnotationEditorLayerBuilder Group|AnnotationEditorLayerBuilder Group]]
- [[_COMMUNITY_DrawLayerBuilder Group|DrawLayerBuilder Group]]
- [[_COMMUNITY_apiPageLayoutToViewerModes() Group|apiPageLayoutToViewerModes() Group]]
- [[_COMMUNITY_PDFPrintServiceFactory Group|PDFPrintServiceFactory Group]]
- [[_COMMUNITY_attachDragEvents() Group|attachDragEvents() Group]]
- [[_COMMUNITY_scanFolderAndAddBooks() Group|scanFolderAndAddBooks() Group]]
- [[_COMMUNITY_FluentNone Group|FluentNone Group]]
- [[_COMMUNITY_OutputScale Group|OutputScale Group]]
- [[_COMMUNITY_getNormalizeWithNFKC() Group|getNormalizeWithNFKC() Group]]
- [[_COMMUNITY_Preferences Group|Preferences Group]]
- [[_COMMUNITY_Indent Group|Indent Group]]
- [[_COMMUNITY_MLManager Group|MLManager Group]]
- [[_COMMUNITY_SimpleLinkService Group|SimpleLinkService Group]]
- [[_COMMUNITY_Package Configuration Group|Package Configuration Group]]
- [[_COMMUNITY_Vite Configuration Group|Vite Configuration Group]]
- [[_COMMUNITY_Counter Module Group|Counter Module Group]]
- [[_COMMUNITY_PDF Group|PDF Group]]
- [[_COMMUNITY_PDF Group|PDF Group]]
- [[_COMMUNITY_PDF Group|PDF Group]]
- [[_COMMUNITY_Sample PDF Document Group|Sample PDF Document Group]]

## God Nodes (most connected - your core abstractions)
1. `PDFViewer` - 69 edges
2. `PDFFindController` - 29 edges
3. `PDFPageView` - 28 edges
4. `PDFHistory` - 23 edges
5. `PDFLinkService` - 18 edges
6. `PDFPresentationMode` - 18 edges
7. `PDFScriptingManager` - 17 edges
8. `PDFSidebar` - 17 edges
9. `DOMLocalization` - 16 edges
10. `PDFThumbnailView` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Main UI Logic` --references--> `Reader Page`  [EXTRACTED]
  src/main.js → reader.html
- `Index Page` --references--> `Main UI Logic`  [EXTRACTED]
  index.html → src/main.js
- `Background Service Worker` --references--> `Index Page`  [EXTRACTED]
  src/background.js → index.html
- `Reader Logic` --references--> `PDF.js Viewer Page`  [EXTRACTED]
  src/reader.js → public/pdfjs/web/viewer.html
- `Reader Page` --references--> `Reader Logic`  [EXTRACTED]
  reader.html → src/reader.js

## Hyperedges (group relationships)
- **Core Data Flow** — main_ui_logic, reader_logic, db_module, sync_module [INFERRED 0.85]

## Communities (68 total, 37 thin omitted)

### Community 0 - "ach Group"
Cohesion: 0.02
Nodes (111): ach, af, an, ar, ast, az, be, bg (+103 more)

### Community 1 - "viewer Group"
Cohesion: 0.03
Nodes (43): animationStarted, AppConstants, backtrackBeforeAllVisibleElements(), cache, CHARACTERS_TO_NORMALIZE, CharacterType, CursorTool, DATETIME_ALLOWED (+35 more)

### Community 2 - " Group"
Cohesion: 0.07
Nodes (9): approximateFraction(), AutomationEventBus, PDFPageView, renderPage(), roundToDivide(), TextHighlighter, TextLayerBuilder, webViewerFindFromUrlHash() (+1 more)

### Community 3 - "binarySearchFirstItem() Group"
Cohesion: 0.06
Nodes (10): binarySearchFirstItem(), CachedAsyncIterable, CachedIterable, DOMLocalization, getOriginalIndex(), hasAttribute(), keysFromBundle(), L10n (+2 more)

### Community 4 - "AltTextManager Group"
Cohesion: 0.05
Nodes (7): AltTextManager, AppOptions, BaseTreeViewer, clamp(), download(), GrabToPan, ProgressBar

### Community 5 - "getCurrentHash() Group"
Cohesion: 0.09
Nodes (7): getCurrentHash(), isDestArraysEqual(), isDestHashesEqual(), parseQueryString(), PDFHistory, PDFLinkService, webViewerHashchange()

### Community 6 - "abort() Group"
Cohesion: 0.07
Nodes (12): abort(), AnnotationEditorParams, AnnotationLayerBuilder, dispatchEvent(), getActiveOrFocusedElement(), getViewerConfiguration(), PDFPresentationMode, webViewerClick() (+4 more)

### Community 8 - "addLocalBtn Group"
Cohesion: 0.06
Nodes (27): addLocalBtn, addSingleBookBtn, authStatus, bookshelfGrid, breadcrumbCurrent, breadcrumbHome, breadcrumbs, btnClearDb (+19 more)

### Community 9 - " Group"
Cohesion: 0.10
Nodes (9): SecondaryToolbar, toggleCheckedBtn(), Toolbar, webViewerNamedAction(), webViewerPageChanging(), webViewerPageNumberChanged(), webViewerPageRender(), webViewerPageRendered() (+1 more)

### Community 10 - "CachedSyncIterable Group"
Cohesion: 0.10
Nodes (7): CachedSyncIterable, createBundle(), EventBus, FluentBundle, FluentResource, genericl10n_GenericL10n, PDFPageViewBuffer

### Community 12 - " Group"
Cohesion: 0.15
Nodes (15): FluentDateTime, FluentNumber, getArguments(), getDefault(), messageFromBundle(), resolveComplexPattern(), resolveExpression(), resolveFunctionReference() (+7 more)

### Community 13 - "db Group"
Cohesion: 0.16
Nodes (17): db, backBtn, bookId, iframe, init(), loadingOverlay, permissionOverlay, saveCurrentProgress() (+9 more)

### Community 14 - "debugger Group"
Cohesion: 0.14
Nodes (6): FontInspector, opMap, PDFBug, Stats, Stepper, StepperManager

### Community 16 - " Group"
Cohesion: 0.16
Nodes (3): ensureOverlay(), OverlayManager, PasswordPrompt

### Community 17 - "BasePreferences Group"
Cohesion: 0.16
Nodes (3): BasePreferences, ViewHistory, webViewerUpdateViewarea()

### Community 19 - "manifest Group"
Cohesion: 0.13
Nodes (13): action, default_title, background, service_worker, type, description, manifest_version, name (+5 more)

### Community 20 - "package Group"
Cohesion: 0.13
Nodes (14): dependencies, dexie, pdfjs-dist, devDependencies, @crxjs/vite-plugin, vite, name, private (+6 more)

### Community 25 - "Background Service Worker Group"
Cohesion: 0.21
Nodes (13): Background Service Worker, Database Module, Google Drive Sync Mechanism, Index Page, IndexedDB Local Storage, Main UI Logic, Extension Manifest, PDF Rendering Engine (+5 more)

### Community 26 - "isValidRotation() Group"
Cohesion: 0.19
Nodes (3): isValidRotation(), webViewerResize(), webViewerResolutionChange()

### Community 28 - "BaseExternalServices Group"
Cohesion: 0.17
Nodes (4): BaseExternalServices, webViewerAnnotationEditorStatesChanged(), webViewerReportTelemetry(), webViewerUpdateFindControlState()

### Community 30 - "getCharacterType() Group"
Cohesion: 0.18
Nodes (11): getCharacterType(), isAlphabeticalScript(), isAscii(), isAsciiAlpha(), isAsciiDigit(), isAsciiSpace(), isHalfwidthKatakana(), isHan() (+3 more)

### Community 31 - "match() Group"
Cohesion: 0.24
Nodes (3): match(), removeNullCharacters(), StructTreeLayerBuilder

### Community 33 - "docProperties() Group"
Cohesion: 0.22
Nodes (4): docProperties(), ExternalServices, getPageName(), isPortraitOrientation()

### Community 35 - "createSanitizedElement() Group"
Cohesion: 0.31
Nodes (9): createSanitizedElement(), createTextNodeFromTextContent(), getNodeForNamedElement(), isAttrNameLocalizable(), isElementAllowed(), overlayAttributes(), overlayChildNodes(), shallowPopulateUsing() (+1 more)

### Community 36 - "handleDownloadProgress() Group"
Cohesion: 0.28
Nodes (9): handleDownloadProgress(), hideLoading(), init(), loadBooks(), setAuthState(), setSyncMode(), setupDragAndDrop(), syncDriveProgressToLocal() (+1 more)

### Community 39 - "DATETIME() Group"
Cohesion: 0.32
Nodes (5): DATETIME(), FluentType, isValidAnnotationEditorMode(), NUMBER(), values()

### Community 45 - "getMemoizerForLocale() Group"
Cohesion: 0.40
Nodes (4): getMemoizerForLocale(), webViewerScrollModeChanged(), webViewerSidebarViewChanged(), webViewerSpreadModeChanged()

### Community 50 - "attachDragEvents() Group"
Cohesion: 0.67
Nodes (4): attachDragEvents(), createActionIcons(), createBookCard(), createFolderCard()

### Community 51 - "scanFolderAndAddBooks() Group"
Cohesion: 0.50
Nodes (3): scanFolderAndAddBooks(), showLoading(), generateThumbnail()

## Knowledge Gaps
- **215 isolated node(s):** `manifest_version`, `name`, `version`, `description`, `default_title` (+210 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PDFViewer` connect ` Group` to ` Group`, `viewer Group`, ` Group`, `getCurrentHash() Group`, `abort() Group`, `DATETIME() Group`, ` Group`, `apiPageLayoutToViewerModes() Group`, ` Group`, `isValidScrollMode() Group`, `isValidRotation() Group`, `PDFRenderingQueue Group`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `PDFScriptingManager` connect `GenericScripting Group` to `apiPageLayoutToViewerModes() Group`, `viewer Group`, `docProperties() Group`, ` Group`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `PDFHistory` connect `getCurrentHash() Group` to `viewer Group`, ` Group`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `manifest_version`, `name`, `version` to the rest of the system?**
  _215 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ach Group` be split into smaller, more focused modules?**
  _Cohesion score 0.017857142857142856 - nodes in this community are weakly interconnected._
- **Should `viewer Group` be split into smaller, more focused modules?**
  _Cohesion score 0.030227743271221533 - nodes in this community are weakly interconnected._
- **Should ` Group` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._