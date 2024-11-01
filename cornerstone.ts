import * as cornerstone from "@cornerstonejs/core";
import { Image } from "itk-wasm";

export var IMAGE_CACHE: Record<string, Image> = {};

function getImage(
  imageId: string,
  options?: any
): {
  promise: Promise<Record<string, any>>;
  cancelFn?: () => void | undefined;
  decache?: () => void | undefined;
} {
  const itkImage = IMAGE_CACHE[imageId];
  const rowIdx = 0;
  const colIdx = 1;
  return {
    promise: Promise.resolve({
      imageId: imageId,
      minPixelValue: 0,
      maxPixelValue: 255,
      slope: 1,
      intercept: 0,
      windowCenter: 128,
      windowWidth: 255,
      getPixelData: () => {
        return IMAGE_CACHE[imageId].data;
      },
      getCanvas: undefined,
      rows: itkImage.size[rowIdx],
      columns: itkImage.size[colIdx],
      height: itkImage.size[rowIdx],
      width: itkImage.size[colIdx],
      color: false,
      rgba: false,
      numComps: 1,
      columnPixelSpacing: itkImage.spacing[colIdx],
      rowPixelSpacing: itkImage.spacing[rowIdx],
      sliceThickness: 1,
      invert: false,
      sizeInBytes: itkImage.data.byteLength,
    }),
  };
}

function getMetadata(type, imageId) {
  const image = IMAGE_CACHE[imageId];

  if (type === "imagePixelModule") {
    const imagePixelModule = {
      pixelRepresentation: 0,
      bitsAllocated: 8,
      bitsStored: 8,
      highBit: 8,
      photometricInterpretation: "MONOCHROME",
      samplesPerPixel: 1,
    };

    return imagePixelModule;
  } else if (type === "generalSeriesModule") {
    const generalSeriesModule = {
      modality: "SC",
      seriesNumber: 1,
      seriesDescription: "Color",
      seriesDate: "20190201",
      seriesTime: "120000",
      seriesInstanceUID: "1.2.276.0.7230010.3.1.4.83233.20190201120000.1",
    };

    return generalSeriesModule;
  } else if (type === "imagePlaneModule") {
    // console.warn(index);
    const imagePlaneModule = {
      imageOrientationPatient: [1, 0, 0, 0, 1, 0],
      imagePositionPatient: [0, 0, 5],
      pixelSpacing: [1, 1],
      columnPixelSpacing: 1,
      rowPixelSpacing: 1,
      frameOfReferenceUID: "FORUID",
      columns: image.size[1],
      rows: image.size[0],
      rowCosines: [1, 0, 0],
      columnCosines: [0, 1, 0],
    };

    return imagePlaneModule;
  } else if (type === "voiLutModule") {
    return {
      // According to the DICOM standard, the width is the number of samples
      // in the input, so 256 samples.
      windowWidth: [256],
      // The center is offset by 0.5 to allow for an integer value for even
      // sample counts
      windowCenter: [128],
    };
  } else if (type === "modalityLutModule") {
    return {
      rescaleSlope: 1,
      rescaleIntercept: 0,
    };
  } else {
    return undefined;
  }
}

export async function initCornerstone() {
  await cornerstone.init();
  cornerstone.imageLoader.registerImageLoader("local", getImage);
  cornerstone.metaData.addProvider(getMetadata, 100_000);
}

export class ImageViewer {
  renderingEngine: cornerstone.RenderingEngine;
  elements: Record<string, HTMLDivElement>;

  constructor(viewportIds: Array<string>) {
    this.elements = {};
    viewportIds.forEach((id) => {
      this.elements[id] = document.getElementById(id) as HTMLDivElement;
    }, this);
    this.renderingEngine = new cornerstone.RenderingEngine("myRenderingEngine");

    // Create viewports
    var viewportInputs = [];
    for (const [key, value] of Object.entries(this.elements)) {
      viewportInputs.push({
        viewportId: key,
        type: cornerstone.Enums.ViewportType.STACK,
        element: value,
        defaultOptions: {
          background: <cornerstone.Types.Point3>[0, 0, 0],
        },
      });
    }
    this.renderingEngine.setViewports(viewportInputs);
  }

  async renderImage(imageId: string, viewportId: string) {
    if (!Object.keys(this.elements).includes(viewportId)) {
      throw new Error("No viewport found with id " + viewportId);
    }
    const viewport = this.renderingEngine.getViewport(
      viewportId
    ) as cornerstone.Types.IStackViewport;
    viewport.setStack([imageId], 0);
    this.renderingEngine.render();
  }
}
