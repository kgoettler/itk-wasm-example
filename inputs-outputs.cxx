#include "itkPipeline.h"
#include "itkInputImage.h"
#include "itkOutputImage.h"

#include "itkImage.h"
#include "itkMedianImageFilter.h"

int main(int argc, char * argv[]) {
  // Create the pipeline for parsing arguments. Provide a description.
  itk::wasm::Pipeline pipeline("median-filter", "Smooth an image with a median filter", argc, argv);

  constexpr unsigned int Dimension = 2;
  using PixelType = uint8_t;
  using ImageType = itk::Image<PixelType, Dimension>;

  // Add a flag to specify the radius of the median filter.
  unsigned int radius = 1;
  pipeline.add_option("-r,--radius", radius, "Kernel radius in pixels");

  // Add a input image argument.
  using InputImageType = itk::wasm::InputImage<ImageType>;
  InputImageType inputImage;
  pipeline.add_option("InputImage", inputImage,
    "The input image")->required()->type_name("INPUT_IMAGE");

  // Add an output image argument.
  using OutputImageType = itk::wasm::OutputImage<ImageType>;
  OutputImageType outputImage;
  pipeline.add_option("OutputImage", outputImage,
    "The output image")->required()->type_name("OUTPUT_IMAGE");

  ITK_WASM_PARSE(pipeline);

  //outputImage.Set(inputImage.Get());
  using FilterType = itk::MedianImageFilter< ImageType, ImageType >;
    auto filter = FilterType::New();
    filter->SetInput(inputImage.Get());
    filter->SetRadius(radius);
    filter->Update();
    outputImage.Set(filter->GetOutput());

  return EXIT_SUCCESS;
}