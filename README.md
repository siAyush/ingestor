<br />
<div align="center">
  <img src="./assets/logIcon.png" alt="Logo" width="80" height="80">

  <h3 align="center">Ingestor</h3>

  <p align="center">
  Log Ingestor and Query Interface, with real-time ingestion,  filtering, and a user interface.
    <br />
  </p>
</div>

## About The Project

<img src="./assets/design.png" alt="Logo" >

### Built With

- Python
- Typescript
- Go
- Kafka
- Elastic Search
- NextJs
- Docker

<!-- GETTING STARTED -->

## Getting Started

### Installation & usage

- Clone the repo

  ```sh
  git clone https://github.com/siAyush/ingestor.git
  ```

- Run ingestor server

  1. Go to `server` directory
     ```sh
       cd server
     ```
  2. Install golang dependencies
     ```sh
      go mod download
     ```
  3. Install Python dependencies
     ```sh
       pip install -r requirements.txt
     ```
  4. Start producing logs
     ```sh
      cd server/logProducers
      ./runProducers.sh
     ```
  5. Start the ingestor server
     ```sh
      cd server/cmd
      go run .
     ```
