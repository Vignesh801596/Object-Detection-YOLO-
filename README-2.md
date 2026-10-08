# Object Detection (YOLO)

A browser-based object detection project built with **Next.js, React, TypeScript, YOLOv8 Nano, and ONNX Runtime Web**.

The application allows users to upload an image and detect multiple objects directly in the browser. Detection is performed on the user's device using WebAssembly, so the uploaded image does not need to be sent to a backend server.

## ✨ Features

- Upload JPG, PNG, or WebP images
- Object detection using YOLOv8 Nano
- Runs detection directly in the browser
- Images remain on the user's device during detection
- Adjustable confidence threshold
- Enhanced detection mode for improved detection of smaller objects
- Supports 80 COCO object classes
- Displays detected objects, confidence scores, and bounding boxes
- Shows model loading and detection progress
- Responsive user interface
- Uses ONNX Runtime Web + WebAssembly

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Next.js | Web application framework |
| React | User interface |
| TypeScript | Application development |
| YOLOv8 Nano | Object detection model |
| ONNX | Model format |
| ONNX Runtime Web | Browser-based model inference |
| WebAssembly | Local model execution |
| Tailwind CSS | UI styling |
| Lucide React | Icons |
| pnpm | Package management |

## 🧠 How It Works

```text
User uploads an image
        ↓
Image is loaded in the browser
        ↓
YOLOv8 Nano ONNX model is loaded
        ↓
Image is resized / letterboxed to 640 × 640
        ↓
YOLO inference runs through ONNX Runtime Web
        ↓
Detected objects are filtered by confidence
        ↓
Bounding boxes are processed with IoU/NMS logic
        ↓
Detection results are displayed in the browser
```

## 📁 Project Structure

```text
Object-detection(YOLO)-project/
│
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── detection-canvas.tsx
│   ├── detection-results.tsx
│   ├── detection-settings.tsx
│   ├── object-detector.tsx
│   ├── supported-objects.tsx
│   └── ui/
│
├── lib/
│   ├── detection-config.ts
│   ├── utils.ts
│   └── yolo.ts
│
├── public/
│   ├── models/
│   │   ├── yolov8n.onnx
│   │   └── LICENSE.txt
│   │
│   └── onnx/
│       ├── ort-wasm-simd-threaded.mjs
│       ├── ort-wasm-simd-threaded.wasm
│       └── LICENSE.txt
│
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Object-detection-YOLO-project
```

### 2. Install dependencies

This project uses **pnpm**.

```bash
pnpm install
```

If pnpm is not installed:

```bash
npm install -g pnpm
```

### 3. Start the development server

```bash
pnpm dev
```

Open the local address shown in the terminal, usually:

```text
http://localhost:3000
```

### 4. Build for production

```bash
pnpm build
```

### 5. Start the production server

```bash
pnpm start
```

## 🖼️ Using the Application

1. Open the web application.
2. Upload a JPG, PNG, or WebP image.
3. Adjust the confidence threshold if required.
4. Enable or disable enhanced detection.
5. Run object detection.
6. View the detected objects and bounding boxes.
7. Review the confidence score and detection results.

### Image limits

The current application accepts:

- JPG / JPEG
- PNG
- WebP
- Maximum file size: **10 MB**
- Maximum image area: **40 megapixels**
- Maximum dimension: **16,000 pixels per side**

## 🎯 Supported Object Classes

The YOLOv8 Nano model is configured for the **80 COCO classes**, including:

`person`, `bicycle`, `car`, `motorcycle`, `airplane`, `bus`, `train`, `truck`, `boat`, `traffic light`, `stop sign`, `bird`, `cat`, `dog`, `horse`, `sheep`, `cow`, `elephant`, `bear`, `zebra`, `giraffe`, `backpack`, `umbrella`, `handbag`, `suitcase`, `sports ball`, `bottle`, `cup`, `fork`, `knife`, `banana`, `apple`, `sandwich`, `orange`, `broccoli`, `carrot`, `pizza`, `donut`, `cake`, `chair`, `couch`, `potted plant`, `bed`, `dining table`, `toilet`, `tv`, `laptop`, `mouse`, `keyboard`, `cell phone`, `microwave`, `oven`, `sink`, `refrigerator`, `book`, `clock`, `vase`, `scissors`, `teddy bear`, `hair drier`, `toothbrush`, and other COCO classes.

## 🔐 Privacy

Detection is designed to run **locally in the browser**.

The uploaded image is converted into a browser object URL and processed using the YOLO model through ONNX Runtime Web. The project does not include a backend image-upload service.

> Note: the browser still needs to load the YOLO model and ONNX Runtime Web assets from the application.

## ⚙️ Detection Settings

### Confidence Threshold

Controls the minimum confidence required for an object to be displayed.

A higher threshold generally produces fewer but more confident detections.

### Enhanced Detection

When enabled, the application performs additional detection passes on image regions. This can help detect smaller objects that may be difficult to identify in a single full-image pass.

## 📜 Licensing

This repository contains third-party components with their own licenses.

### YOLO Model

The bundled `yolov8n.onnx` model is accompanied by an **AGPL-3.0** license in:

```text
public/models/LICENSE.txt
```

### ONNX Runtime Web Assets

The bundled ONNX Runtime Web assets are accompanied by an **MIT License** in:

```text
public/onnx/LICENSE.txt
```

Please keep these license files when distributing the project.

The root `LICENSE` file applies the AGPL-3.0 license to the project source code. Third-party components remain subject to their respective licenses.

## ⚠️ Disclaimer

This project is intended for **learning, experimentation, and demonstration purposes**.

Object detection results can be inaccurate depending on image quality, object size, lighting, viewpoint, and other conditions. The application should not be relied upon as the sole basis for safety-critical or high-stakes decisions.

## 👨‍💻 Project

**Intern ID:** CITS9005  
**Organization:** CodeTech IT Solutions  

**Project:** Object Detection using YOLO  
**Model:** YOLOv8 Nano  
**Model format:** ONNX  
**Inference:** ONNX Runtime Web  
**Platform:** Web Browser

---

⭐ If you find this project useful, consider giving the repository a star on GitHub.
