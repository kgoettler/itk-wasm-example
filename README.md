# ITK-Wasm Example

My attempt at compiling + running the [Inputs-Outputs ITK-WASM example code](https://wasm.itk.org/en/latest/cxx/tutorial/inputs_outputs.html) in a web
browser.

## Running

To compile the C++ code to WebAssembly and start the example application:

```bash
npm run build:cpp
npm run start     
```

Open your browser and navigate to http://localhost:8686 and drag a PNG file into the dropzone.
