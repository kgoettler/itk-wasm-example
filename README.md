# ITK-Wasm Example

Demonstration of using ITK-Wasm to compile an ITK algorithm to WebAssembly, and executing it within a web browser. The algorithm here is extracted from the [Inputs-Outputs ITK-WASM example](https://wasm.itk.org/en/latest/cxx/tutorial/inputs_outputs.html).

Input + output images are rendered using Cornerstone3D.

## Running

To compile the C++ code to WebAssembly and start the example application:

```bash
npm run build:cpp
npm run start     
```

Open your browser and navigate to http://localhost:8686 and drag the supplied PNG file into the dropzone.

## Debugging

To debug in the browser, follow the [Debugging](https://wasm.itk.org/en/latest/cxx/tutorial/debugging.html) instructions from the ITK-Wasm documentation for Chromium-based browsers. Note that you no longer have to enable DWARF support in the Experiments tab, as this is enabled by default in all recent versions of Chrome.

## Notes

- Assumes the input PNG file is an 8-bit monochrome image.
