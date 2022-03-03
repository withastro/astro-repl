// import type { editor as Editor } from "monaco-editor";
import "../../../node_modules/monaco-editor/esm/vs/language/typescript/monaco.contribution.js";

import "../../../node_modules/monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js";

import "../../../node_modules/monaco-editor/esm/vs/editor/browser/controller/coreCommands.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/clipboard/clipboard.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/codeAction/codeActionContributions.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/comment/comment.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/dnd/dnd.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/find/findController.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/folding/folding.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/fontZoom/fontZoom.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/format/formatActions.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/gotoSymbol/link/goToDefinitionAtPosition.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/hover/hover.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/indentation/indentation.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/inlayHints/inlayHintsController.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/links/links.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/multicursor/multicursor.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/rename/rename.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/tokenization/tokenization.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/unusualLineTerminators/unusualLineTerminators.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/viewportSemanticTokens/viewportSemanticTokens.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js";
import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/wordPartOperations/wordPartOperations.js";

// Load up these strings even in VSCode, even if they are not used
// in order to get them translated
import "../../../node_modules/monaco-editor/esm/vs/editor/common/standaloneStrings.js";
import "../../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js"; // The codicons are defined here and must be loaded

// import { editor as Editor, languages } from "monaco-editor";
// import 'monaco-editor/esm/vs/language/css/monaco.contribution';
// import 'monaco-editor/esm/vs/language/json/monaco.contribution';
// import 'monaco-editor/esm/vs/language/html/monaco.contribution';
// import 'monaco-editor/esm/vs/basic-languages/monaco.contribution.js';

// export * from 'monaco-editor/esm/vs/editor/edcore.main';
// import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/browser/widget/diffEditorWidget.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/browser/widget/diffNavigator.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/anchorSelect/anchorSelect.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/codelens/codelensController.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/colorPicker/colorContributions.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/documentSymbols/documentSymbols.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/inlineCompletions/ghostTextController.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/gotoSymbol/goToCommands.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/gotoError/gotoError.js";
// import "../../../node_modules/monaco-editor/esm/vs/editor/contrib/inPlaceReplace/inPlaceReplace.js";

import { editor as Editor, languages, editor, Uri } from 'monaco-editor';
import { register } from './monaco-astro';

// import GithubLight from "../util/github-light";
import GithubDark from "../themes/github-dark";
// import { themeGet } from "../scripts/theme";

import TYPESCRIPT_WORKER_URL from "worker:../workers/typescript.ts";
import EDITOR_WORKER_URL from "worker:../workers/editor.ts";

import { WebWorker } from "../../utils/WebWorker";

export const initialValue = `---
import {format} from 'date-fns'; 

// Welcome to Astro!
// Write JavaScript & TypeScript here, in the "component script."
// This will run during the build, but never in the final output.
// Use these variables in the HTML template below.
//
// Full Syntax:
// https://docs.astro.build/core-concepts/astro-components/

const builtAt: Date = new Date();
const builtAtFormatted = format(builtAt, 'MMMM dd, yyyy -- H:mm:ss.SSS');
---
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Astro Playground</title>
    <style>
      header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-top: 15vh;
        font-family: Arial;
      }
      .note {
        margin: 0;
        padding: 1rem;
        border-radius: 8px;
        background: #E4E5E6;
        border: 1px solid #BBB;
      }
    </style>
  </head>
  <body>
    <header>
      <img width="60" height="80" src="https://bestofjs.org/logos/astro.svg" alt="Astro logo">
      <h1>Hello, Astro!</h1>
      <p class="note">
        <strong>RENDERED AT:</strong><br/>
        {builtAtFormatted}
      </p>
    </header>
  </body>
</html>
`;

export const build = (inputEl: HTMLElement, initialModels: Record<string, string> = {}) => {
  let editorInstance: Editor.IStandaloneCodeEditor;

  register();
  languages.typescript.javascriptDefaults.setEagerModelSync(true);
  languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false
  });

  // Compiler options
  languages.typescript.typescriptDefaults.setCompilerOptions({
    "moduleResolution": languages.typescript.ModuleResolutionKind.NodeJs,
    "target": languages.typescript.ScriptTarget.Latest,
    "module": languages.typescript.ModuleKind.ES2015,
    "noEmit": true,
    "lib": ["es2021", "dom", "dom.iterable", "webworker", "esnext", "node"],
    "exclude": ["node_modules"],
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowNonTsExtensions": true,
    "esModuleInterop": true,
    "noResolve": true,
    "allowSyntheticDefaultImports": true
  });

  const parseInput = (value: string) => {
      const host = "https://api.npms.io";
      let urlScheme = `${host}/v2/search?q=${encodeURIComponent(
          value
      )}&size=30`;
      let version = "";

      let exec = /([\S]+)@([\S]+)/g.exec(value);
      if (exec) {
          let [, pkg, ver] = exec;
          version = ver;
          urlScheme = `${host}/v2/search?q=${encodeURIComponent(
              pkg
          )}&size=30`;
      }

      return { url: urlScheme, version };
  };

  const IMPORTS_REXPORTS_REQUIRE_REGEX =
      /(?:(?:import|export|require)(?:.)*?(?:from\s+|\((?:\s+)?)["']([^"']+)["'])\)?/g;
  const FetchCache = new Map();

  languages.registerHoverProvider("astro", {
      provideHover(model, position) {
          let content = model.getLineContent(position.lineNumber);
          let matches =
              Array.from(content.matchAll(IMPORTS_REXPORTS_REQUIRE_REGEX)) ??
              [];
          if (matches.length <= 0) return;

          let matchArr = matches.map(([, pkg]) => pkg);
          let pkg = matchArr[0];

          if (/\.|http(s)?\:/.test(pkg)) return;
          else if (
              /^(skypack|unpkg|jsdelivr|esm|esm\.run|esm\.sh)\:/.test(pkg)
          ) {
              pkg = pkg.replace(
                  /^(skypack|unpkg|jsdelivr|esm|esm\.run|esm\.sh)\:/,
                  ""
              );
          }

          return (async () => {
              let { url } = parseInput(pkg);
              let response: Response, result: any;

              try {
                  if (!FetchCache.has(url)) {
                      response = await fetch(url);
                      result = await response.json();
                      FetchCache.set(url, result);
                  } else {
                      result = FetchCache.get(url);
                  }
              } catch (e) {
                  console.warn(e);
                  return;
              }

              if (result?.results.length <= 0) return;

              const { name, description, version, date, publisher, links } =
                  result?.results?.[0]?.package ?? {};
              let author = publisher?.username;
              let _date = new Date(date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              });

              return {
                  contents: [].concat({
                      value: `## [${name}](${
                          links?.npm
                      }) v${version}\n${description}\n\n\nPublished on ${_date} ${
                          author
                              ? `by [@${author}](https://www.npmjs.com/~${author})`
                              : ""
                      }\n\n${
                          links?.repository
                              ? `[GitHub](${links?.repository})  |`
                              : ""
                      }  [Skypack](https://skypack.dev/view/${name})  |  [Unpkg](https://unpkg.com/browse/${name}/)  | [Openbase](https://openbase.com/js/${name})`,
                  }),
              };
          })();
      },
  });

  // Since packaging is done by you, you need
  // to instruct the editor how you named the
  // bundles that contain the web workers.
  (window as any).MonacoEnvironment = {
    getWorker: function (moduleId, label) {
      if (label === "typescript" || label === "javascript") {
        let WorkerArgs = { name: `${label}-worker` };
        let NewWorker = new WebWorker(TYPESCRIPT_WORKER_URL, WorkerArgs);
        NewWorker.start();
        return NewWorker;
      }

      return (() => {
        let WorkerArgs = { name: `editor-worker` };
        let EditorWorker = new WebWorker(EDITOR_WORKER_URL, WorkerArgs);
        EditorWorker.start();
        return EditorWorker;
      })();
    },
  };

  // @ts-ignore
  Editor.defineTheme("dark", GithubDark);

  editorInstance = Editor.create(inputEl, {
    model: null,

    // @ts-ignore
    bracketPairColorization: {
        enabled: true,
    },
    parameterHints: {
        enabled: true,
    },
    minimap: {
      enabled: true,
    },
    scrollbar: {
      // Subtle shadows to the left & top. Defaults to true.
      useShadows: false,
      vertical: "auto",
    },
    wordWrap: "off",
    "roundedSelection": true,
    "scrollBeyondLastLine": false,
    smoothScrolling: true,
    theme: "dark",
    automaticLayout: true,
    language: "astro",
    lineNumbers: "on"
  });

  let models: Editor.IModel[] = [];
  for (const [uri, value] of Object.entries(initialModels)) {
    models.push(Editor.createModel(value, 'astro', Uri.parse(uri)));
  }
  if (Object.keys(initialModels).length === 0) {
    models.push(Editor.createModel(initialValue, 'astro', Uri.parse("inmemory://model/src/pages/Page.astro")))
  }
  editorInstance.setModel(models[0]);

  return { editor: editorInstance, models };
};
