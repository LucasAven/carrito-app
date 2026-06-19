// Next types `*.module.css` but not plain global stylesheets, so the editor
// flags side-effect imports like `import "@/styles/globals.css"`. This silences
// that; the Next compiler resolves the actual import at build time.
declare module "*.css";
