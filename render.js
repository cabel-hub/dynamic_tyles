import * as THREE from "./node_modules/three/build/three.module.js";

const _canvas = document.getElementById("canvas");
const _gl = _canvas.getContext("2d");

// Threshold for pixel density
const maxDepth = 6;

function divideCanvas(canvas, depth = 0, left = 0, top = 0) {
  const pixelDensity = getPixelDensity(canvas);
  // console.log("Pixel Density: ", pixelDensity);

  let threshold = calculateThreshold(pixelDensity, depth);

  console.log(threshold);

  if (pixelDensity >= threshold && depth < maxDepth) {
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;

    const scissors = [
      {
        left: left,
        top: top + halfHeight,
        width: halfWidth,
        height: halfHeight,
      },
      {
        left: left + halfWidth,
        top: top + halfHeight,
        width: halfWidth,
        height: halfHeight,
      },
      {
        left: left,
        top: top,
        width: halfWidth,
        height: halfHeight,
      },
      {
        left: left + halfWidth,
        top: top,
        width: halfWidth,
        height: halfHeight,
      },
    ];

    const renderer = new THREE.WebGLRenderer({
      context: canvas.getContext("webgl"),
    });

    scissors.forEach((scissor) => {
      renderer.setScissor(
        scissor.left,
        canvas.height - scissor.top - scissor.height,
        scissor.width,
        scissor.height
      );
      renderer.setScissorTest(true);

      const subCanvas = canvas.cloneNode(false);
      subCanvas.width = scissor.width;
      subCanvas.height = scissor.height;
      const subCtx = subCanvas.getContext("2d");

      subCtx.drawImage(
        canvas,
        scissor.left - left,
        scissor.top - top,
        scissor.width,
        scissor.height,
        0,
        0,
        scissor.width,
        scissor.height
      );
      _gl.drawImage(
        subCanvas,
        scissor.left,
        scissor.top,
        scissor.width,
        scissor.height
      );

      _gl.beginPath();
      _gl.strokeStyle = "yellow";
      _gl.rect(scissor.left, scissor.top, scissor.width, scissor.height);
      _gl.stroke();

      // console.log(subCanvas.width, subCanvas.height);
      renderer.setScissorTest(false);
      divideCanvas(subCanvas, depth + 1, scissor.left, scissor.top);
    });
  }
}

function getPixelDensity(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  let count = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Check if the pixel is not transparent and not white
    if (a !== 0 && !(r >= 10 && g >= 10 && b >= 10)) {
      count++;
    }
  }

  // Calculate the pixel density as a percentage
  const totalPixels = canvas.width * canvas.height;
  const pixelDensity = count / totalPixels;

  return pixelDensity;
}

const loader = new THREE.ImageLoader();

// load a image resource
async function loadBackground() {
  loader.load(
    // resource URL
    "flower.png",
    //"rover_clean.png",
    // onLoad callback
    function (image) {
      // use the image, e.g. draw part of it on a canvas

      const context = canvas.getContext("2d");

      context.drawImage(image, 30, 90);
      divideCanvas(_canvas);
    },

    // onProgress callback currently not supported
    undefined,

    // onError callback
    function () {
      console.error("An error happened.");
    }
  );
}

function calculateThreshold(pixelDensity, depth) {
  let threshold = pixelDensity / 2;

  for (let i = 1; i < depth; i++) {
    threshold += pixelDensity * 0.05;
  }

  threshold = Math.min(threshold, 1);

  return threshold <= 0.01 ? 0.01 : threshold;
}

await loadBackground();
