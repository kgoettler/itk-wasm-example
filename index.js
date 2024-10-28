import {
  InterfaceTypes,
  runPipeline
} from 'itk-wasm'
import {
  readImage,
} from '@itk-wasm/image-io'

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');

  // Prevent default behaviors for drag events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => e.preventDefault());
    dropZone.addEventListener(eventName, (e) => e.stopPropagation());
  });

  // Highlight the drop zone when a file is dragged over
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = '#000';
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = '#ccc';
    });
  });

  // Handle the file drop
  dropZone.addEventListener('drop', (event) => {
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];  // Assuming the first file is a PNG file
      run(file)
    }
  });
});

async function run(file) {
  const inputImage = await readImage(file, {componentType: "uint8"})
  const inputs = [
    { type: InterfaceTypes.Image, data: inputImage.image }
  ]
  const desiredOutputs = [
    { type: InterfaceTypes.Image }
  ]
  let args = ['0', '0', '--memory-io'];
  // Path to the Emscripten WebAssembly module without extensions
  const pipelinePath = new URL('emscripten-build/inputs-outputs', document.location)
  try {
    const res = await runPipeline(pipelinePath, args, desiredOutputs, inputs)
  } catch (error) {
    console.error(error);
    return
  }
  console.log("Done")
  return
}