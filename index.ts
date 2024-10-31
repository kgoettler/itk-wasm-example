import { InterfaceTypes, runPipeline, Image } from "itk-wasm";
import { readImage } from "@itk-wasm/image-io";
import { IMAGE_CACHE, initCornerstone, ImageViewer } from "./cornerstone";

function setupDropZone(viewer: ImageViewer) {
  const dropZone = document.getElementById("drop-zone") as HTMLDivElement;

  // Prevent default behaviors for drag events
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => e.preventDefault());
    dropZone.addEventListener(eventName, (e) => e.stopPropagation());
  });

  // Highlight the drop zone when a file is dragged over
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#000";
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#ccc";
    });
  });

  // Handle the file drop
  dropZone.addEventListener("drop", (event) => {
    // @ts-ignore
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0]; // Assuming the first file is a PNG file
      run(file, viewer);
    }
  });
}

async function run(file: File, viewer: ImageViewer) {
  const inputViewportId = "source-image";
  const inputImageId = "local://" + inputViewportId;
  const inputImage = await readImage(file, { componentType: "uint8" });
  const inputs = [
    {
      type: InterfaceTypes.Image,
      data: inputImage.image,
    },
  ];
  IMAGE_CACHE["local://source-image"] = inputImage.image;
  viewer.renderImage(inputImageId, inputViewportId);
  const desiredOutputs = [
    {
      type: InterfaceTypes.Image,
    },
  ];
  let args = ["0", "0", "--memory-io", "--radius", "10"];
  const pipelinePath = new URL(
    "emscripten-build/inputs-outputs",
    document.location.toString()
  );

  // Run pipeline
  try {
    const outputViewportId = "output-image";
    const outputImageId = "local://" + outputViewportId;

    // Execute pipeline
    performance.mark("pipeline");
    const res = await runPipeline(pipelinePath, args, desiredOutputs, inputs);
    const pipelinePerf = performance.measure("pipeline", "pipeline");
    console.log("Pipeline runtime: " + pipelinePerf.duration + "ms");

    // Cache image + update viewer
    IMAGE_CACHE[outputImageId] = res.outputs[0].data as Image;
    viewer.renderImage(outputImageId, outputViewportId);
  } catch (error) {
    console.error(error);
    return;
  }
  console.log("Done");
  return;
}

async function main() {
  await initCornerstone();
  const viewer = new ImageViewer(["source-image", "output-image"]);
  setupDropZone(viewer);
}

main();
