process.env["WORLDCLIM_API_KEY"] ??= "test-key";

// * jsdom has no FontFaceSet: a target for the font events components listen to
if (typeof document !== "undefined" && !("fonts" in document)) {
  Object.defineProperty(document, "fonts", { value: new EventTarget() });
}
