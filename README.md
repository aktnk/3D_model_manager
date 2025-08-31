# 3D Model Manager

A simple web application for uploading, managing, and viewing 3D models, built with Node.js, Express, and Three.js. This project was bootstrapped and developed with the assistance of Google's Gemini.

## Features

- **Model Upload**: Upload 3D models in `.glb` and `.gltf` formats.
- **Cross-Platform AR**: View your models in Augmented Reality directly in the browser on both Android (WebXR) and iOS (AR Quick Look). Requires a compatible mobile device.
- **USDZ Support**: Upload a `.usdz` file for each model to ensure a stable and high-quality AR experience on iOS devices.
- **Interactive 3D Viewer**: View models in an interactive WebGL canvas powered by Three.js. Rotate, pan, and zoom with mouse controls.
- **Full CRUD Operations**: Create, Read, Update, and Delete models.
  - **Granular Updates**: Independently update the main model file (`.glb`), the AR model file (`.usdz`), and the title.
  - **Soft Deletes**: Models are marked as deleted without being permanently removed from the database.
- **Title Search**: Quickly find models by searching for their titles.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **File Uploads**: Multer
- **3D Rendering**: Three.js, `<model-viewer>`

## Getting Started with Docker

This project is configured to run in a Docker container, providing a consistent and isolated development environment.

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup and Running the Application

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/aktnk/3D_model_manager.git
    cd 3D_model_manager
    ```

2.  **Generate SSL Certificate for HTTPS:**
    To test the AR functionality, a secure (HTTPS) connection is required. Generate a self-signed certificate by running the following command in the project root.

    ```bash
    openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/server.key -out certs/server.crt -days 365 -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Dev/CN=localhost"
    ```

    **Note:** If you need to test from a mobile device, replace `CN=localhost` with your computer's local IP address (e.g., `CN=192.168.1.10`).

3.  **Build and start the container:**

    ```bash
    docker compose up -d --build
    ```

4.  **Open the application:**
    Navigate to [https://localhost:3000](https://localhost:3000). Your browser will show a privacy warning; you must accept it to proceed.

    ![image of index.html](sample/index.png)
    ![image of viewer.html](sample/viewer.png)

### Development

- **Live Reloading**: Changes to the source code are immediately reflected in the container.
- **Viewing Logs**: `docker compose logs -f`
- **Stopping the Application**: `docker compose down`

## Troubleshooting

### AR feature is not working or the icon doesn't appear

If you have trouble viewing a model in AR, please check the following:

1.  **Are you using HTTPS?** The AR feature will not work over an insecure HTTP connection.
2.  **Is your device compatible?** Your phone must support ARCore (Android) or ARKit (iOS).
3.  **Is the model file size optimized?** For best performance on mobile devices, model files should ideally be under 5MB. Very large models may fail to load in AR.
4.  **(For iOS) Is there a `.usdz` file?** While not always required, providing a `.usdz` version of your model is the most reliable way to ensure AR works on iPhones and iPads.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

### Third-Party Libraries

The following third-party libraries are used in this project. They are all licensed under the MIT License.

- [Express.js](https://expressjs.com/)
- [Multer](https://github.com/expressjs/multer)
- [SQLite3](https://github.com/TryGhost/node-sqlite3)
- [Three.js](https://threejs.org/)
- [\<model-viewer\>](https://modelviewer.dev/)
