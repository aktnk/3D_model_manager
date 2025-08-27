# 3D Model Manager

A simple web application for uploading, managing, and viewing 3D models, built with Node.js, Express, and Three.js.

This project was bootstrapped and developed with the assistance of Google's Gemini.

## Features

- **Model Upload**: Upload 3D models in `.glb` and `.gltf` formats.
- **List View**: Displays all registered models in a clean, sortable table with details like title, filename, and timestamps.
- **Interactive 3D Viewer**: View models in an interactive WebGL canvas. Rotate, pan, and zoom with mouse controls.
- **CRUD Operations**: Full Create, Read, Update, and Delete functionality for models.
  - **Granular Updates**: Update the 3D model file and its title independently.
  - **Soft Deletes**: Models are marked as deleted without being permanently removed from the database.
- **Title Search**: Quickly find models by searching for their titles.
- **Timestamp Tracking**: Automatically records and displays creation (`Created At`) and modification (`Updated At`) times in JST.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **File Uploads**: Multer
- **3D Rendering**: Three.js

## Getting Started with Docker

This project is configured to run in a Docker container, which provides a consistent and isolated development environment.

### Prerequisites

*   [Docker](https://www.docker.com/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/aktnk/3D_model_manager.git
    cd 3D_model_manager
    ```

2.  **Build and start the container:**
    Run the following command from the project's root directory. This will build the Docker image and start the application in the background.
    ```bash
    docker compose up -d --build
    ```

3.  **Open the application:**
    Once the container is running, open your web browser and navigate to:
    [http://localhost:3000](http://localhost:3000)

    You should now see the application's main page.

    ![image of index.html](sample/index.png)
    ![image of viewer.html](sample/viewer.png)

### Development

*   **Live Reloading**: Thanks to the volume mount configured in `compose.yml`, any changes you make to the source code on your local machine will be immediately reflected in the container.
*   **Viewing Logs**: To see the application logs in real-time, use the command:
    ```bash
    docker compose logs -f
    ```
*   **Stopping the Application**: To stop and remove the containers, run:
    ```bash
    docker compose down
    ```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

### Third-Party Libraries

The following third-party libraries are used in this project. They are all licensed under the MIT License.

- [Express.js](https://expressjs.com/)
- [Multer](https://github.com/expressjs/multer)
- [SQLite3](https://github.com/TryGhost/node-sqlite3)
- [Three.js](https://threejs.org/)
