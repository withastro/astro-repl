// import { editor as Editor, languages } from "monaco-editor";

import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
// import 'monaco-editor/esm/vs/language/css/monaco.contribution';
// import 'monaco-editor/esm/vs/language/json/monaco.contribution';
// import 'monaco-editor/esm/vs/language/html/monaco.contribution';

// import 'monaco-editor/esm/vs/basic-languages/monaco.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';

// export * from 'monaco-editor/esm/vs/editor/edcore.main';

// import '../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard';
// import '../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess';
// import '../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';

import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands';
// import '../../node_modules/monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/browser/widget/diffEditorWidget.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/browser/widget/diffNavigator.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/anchorSelect/anchorSelect.js';
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching';
import 'monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js';
import 'monaco-editor/esm/vs/editor/contrib/clipboard/clipboard';
import 'monaco-editor/esm/vs/editor/contrib/codeAction/codeActionContributions';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/codelens/codelensController.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/colorPicker/colorContributions.js';
import 'monaco-editor/esm/vs/editor/contrib/comment/comment';
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu';
import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo';
import 'monaco-editor/esm/vs/editor/contrib/dnd/dnd';
import 'monaco-editor/esm/vs/editor/contrib/find/findController';
import 'monaco-editor/esm/vs/editor/contrib/folding/folding';
import 'monaco-editor/esm/vs/editor/contrib/fontZoom/fontZoom';
import 'monaco-editor/esm/vs/editor/contrib/format/formatActions';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/documentSymbols/documentSymbols.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/inlineCompletions/ghostTextController.js';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/gotoSymbol/goToCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/gotoSymbol/link/goToDefinitionAtPosition';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/gotoError/gotoError.js';
import 'monaco-editor/esm/vs/editor/contrib/hover/hover';
import 'monaco-editor/esm/vs/editor/contrib/indentation/indentation';
import 'monaco-editor/esm/vs/editor/contrib/inlayHints/inlayHintsController';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/inPlaceReplace/inPlaceReplace.js';
import 'monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/linkedEditing/linkedEditing.js';
import 'monaco-editor/esm/vs/editor/contrib/links/links';
import 'monaco-editor/esm/vs/editor/contrib/multicursor/multicursor';
import 'monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints';
import 'monaco-editor/esm/vs/editor/contrib/rename/rename';
import 'monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect';
// import '../../node_modules/monaco-editor/esm/vs/editor/contrib/snippet/snippetController2.js';
import 'monaco-editor/esm/vs/editor/contrib/suggest/suggestController';
import 'monaco-editor/esm/vs/editor/contrib/tokenization/tokenization';
import 'monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode';
import 'monaco-editor/esm/vs/editor/contrib/unusualLineTerminators/unusualLineTerminators';
import 'monaco-editor/esm/vs/editor/contrib/viewportSemanticTokens/viewportSemanticTokens';
import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter';
import 'monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations';
import 'monaco-editor/esm/vs/editor/contrib/wordPartOperations/wordPartOperations';
// Load up these strings even in VSCode, even if they are not used
// in order to get them translated
// import '../../node_modules/monaco-editor/esm/vs/editor/common/standaloneStrings.js';
import 'monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles'; // The codicons are defined here and must be loaded

import { editor as Editor, languages, editor, Uri } from 'monaco-editor';
import { register } from './monaco-astro';

// import GithubLight from "../util/github-light";
import GithubDark from "../themes/github-dark";
// import { themeGet } from "../scripts/theme";

import TYPESCRIPT_WORKER_URL from "worker:../workers/typescript.ts";
import EDITOR_WORKER_URL from "worker:../workers/editor.ts";

export const initialValue = `---
const name = "world"
---

<!DOCTYPE html>
<html>
  <head>
    <title>Hello {name}</title>
  </head>
  <body>
    <main>
      <h1>Hello {name}</h1>
    </main>
  </body>
</html>
`;

export const build = (inputEl: HTMLElement) => {
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
        "target": languages.typescript.ScriptTarget.ES2020,
        "module": languages.typescript.ModuleKind.ES2015,
        "noEmit": true,
        "lib": [
            "esnext",
            "dom",
            "node"
        ],
        "exclude": ["node_modules"],
        "resolveJsonModule": true,
        "isolatedModules": true,
        "allowNonTsExtensions": true,
        "esModuleInterop": true,
        "noResolve": true
    });

    // Read this on adding autocomplete to monaco:
    // https://blog.expo.io/building-a-code-editor-with-monaco-f84b3a06deaf
    // and
    // https://mono.software/2017/04/11/custom-intellisense-with-monaco-editor/
    // languages.registerHoverProvider('typescript', {
    //     provideHover: function (model, position) {
    //         // return xhr('../playground.html').then(function (res) {
    //         //     return {
    //         //         range: new Range(1, 1, model.getLineCount(), model.getLineMaxColumn(model.getLineCount())),
    //         //         contents: [
    //         //             { value: '**SOURCE**' },
    //         //             { value: '```html\n' + res.responseText.substring(0, 200) + '\n```' }
    //         //         ]
    //         //     }
    //         // });
    //     }
    // });

    // Since packaging is done by you, you need
    // to instruct the editor how you named the
    // bundles that contain the web workers.
    (window as any).MonacoEnvironment = {
        getWorker: function (moduleId, label) {
            if (label === "typescript" || label === "javascript") {
                return new Worker(TYPESCRIPT_WORKER_URL, {
                    name: `${label}-worker`,
                    type: 'module'
                });
            }

            return new Worker(EDITOR_WORKER_URL, {
                name: "editor-worker",
                type: 'module'
            });
        },
    };

    // @ts-ignore
    Editor.defineTheme("dark", GithubDark);

    editorInstance = Editor.create(inputEl, {
        model: null,

        minimap: {
            enabled: false,
        },
        scrollbar: {
            // Subtle shadows to the left & top. Defaults to true.
            useShadows: false,
            vertical: "auto",
        },
        wordWrap: "on",
        "roundedSelection": true,
        "scrollBeyondLastLine": false,
        smoothScrolling: true,
        theme: "dark",
        automaticLayout: true,
        language: "astro",

        lineNumbers: "on"
    });

    const indexModel = Editor.createModel(initialValue, 'astro', Uri.parse("inmemory://model/src/pages/index.astro"))
    editorInstance.setModel(indexModel);

    return editorInstance;
};
