import * as THREE from "./node_modules/three/build/three.module.js";

const _canvas = document.getElementById("canvas");
const _gl = _canvas.getContext("webgl2");

const renderer = new THREE.WebGLRenderer({ context: _gl });

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera();

// Threshold for pixel density
const maxDepth = 6;

function divideCanvas(canvas, depth = 0, left = 0, top = 0) {
  const pixelDensity = getPixelDensity(canvas);
  console.log(pixelDensity);
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
      context: canvas.getContext("webgl2"),
    });

    const _ogScissor = new THREE.Vector4();
    const _ogViewport = new THREE.Vector4();

    const ogRenderTarget = renderer.getRenderTarget();
    const ogAutoClear = renderer.autoClear;
    const ogScissorTest = renderer.getScissorTest();
    renderer.getScissor(_ogScissor);
    renderer.getViewport(_ogViewport);

    scissors.forEach((scissor) => {
      renderer.setScissorTest(true);
      renderer.setScissor(
        scissor.left,
        canvas.height - scissor.top - scissor.height,
        scissor.width,
        scissor.height
      );

      renderer.setViewport(
        scissor.left,
        canvas.height - scissor.top - scissor.height,
        scissor.width,
        scissor.height
      );

      const subCanvas = canvas.cloneNode(true);
      subCanvas.width = scissor.width;
      subCanvas.height = scissor.height;

      const subCtx = subCanvas.getContext("webgl2");

      renderer.

      // subCtx.drawImage(
      //   canvas,
      //   scissor.left - left,
      //   scissor.top - top,
      //   scissor.width,
      //   scissor.height,
      //   0,
      //   0,
      //   scissor.width,
      //   scissor.height
      // );
      // _gl.drawImage(
      //   subCanvas,
      //   scissor.left,
      //   scissor.top,
      //   scissor.width,
      //   scissor.height
      // );

      // _gl.beginPath();
      // _gl.strokeStyle = "yellow";
      // _gl.rect(scissor.left, scissor.top, scissor.width, scissor.height);
      // _gl.stroke();

      // console.log(subCanvas.width, subCanvas.height);
      //renderer.setScissorTest(false);

      // renderer.setViewport(_ogViewport);
      // renderer.setScissor(_ogScissor);
      // renderer.setScissorTest(ogScissorTest);
      // renderer.setRenderTarget(ogRenderTarget);
      // renderer.autoClear = ogAutoClear;

      //divideCanvas(subCanvas, depth + 1, scissor.left, scissor.top);
    });
  }
}

function getPixelDensity(canvas) {
  console.log(_gl);

  const pixels = new Uint8Array(_canvas.width * _canvas.height * 4);
  _gl.readPixels(
    0,
    0,
    _canvas.width,
    _canvas.height,
    _gl.RGBA,
    _gl.UNSIGNED_BYTE,
    pixels
  );

  // Calculate the pixel density
  let numPixels = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (
      pixels[i] != 0 ||
      pixels[i + 1] >= 10 ||
      pixels[i + 2] >= 10 ||
      pixels[i + 3] >= 10
    ) {
      numPixels++;
    }
  }

  const pixelDensity = numPixels / (canvas.width * canvas.height);
  console.log(pixelDensity);
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

// await loadBackground();

function setup3D() {
  // Get the WebGL context

  camera.position.set(0, 0, 10);
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshBasicMaterial();
  material.color = new THREE.Color("green");
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  renderer.render(scene, camera);

  divideCanvas(_canvas);
}
setup3D();
