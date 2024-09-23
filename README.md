<br />
<div align="center">
  <img src="./assets/logIcon.png" alt="Logo" width="80" height="80">

  <h3 align="center">Ingestor</h3>

  <p align="center">
  Log Ingestor and Query Interface, with real-time ingestion,  filtering, and a user interface.
    <br />
  </p>
</div>

### Features

- Filters on specific fields
- Search in given time range
- HTTP endpoint for posting logs
- Kafka queue for streamlined Log processing
- Ingestion Buffer & Batch processing
- Efficient search queries leveraging Elastic DB
- Export logs in json
- Add new logs via http

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
- Kibana

<!-- GETTING STARTED -->

## Getting Started

### Installation & usage

- Clone the repo

  ```sh
  git clone https://github.com/siAyush/ingestor.git
  ```

- Run nextjs app

  1. Go to `web` directory

     ```sh
       cd web
     ```

  2. Install golang dependencies
     ```sh
      pnpm i
      pnpm run dev
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

## API Documentation

### Ingestion Routes

#### 1. New Log Ingestion

- **Endpoint:** `POST /add-log`
- **Description:** Ingests a new log entry into the system.

  **Request Example:**

  ```json
  {
    "level": "error",
    "message": "Failed to connect to DB",
    "resourceId": "server-1234",
    "timestamp": "2023-09-15T08:00:00Z",
    "traceId": "abc-xyz-123",
    "spanId": "span-456",
    "commit": "5e5342f",
    "topic": "auth",
    "metadata": {
      "parentResourceId": "server-0987"
    }
  }
  ```

  **Response Example:**

  ```json
  {
    "status": "success"
  }
  ```

#### 2. Count Logs

- **Endpoint:** `GET /logs-count`
- **Description:** Retrieves the count of logs stored in Elasticsearch.

  **Response Example:**

  ```json
  {
    "count": 5286
  }
  ```

#### 3. Search Logs

- **Endpoint:** `POST /all-logs`
- **Description:** Searches for logs based on log level log topic and dates.

  **Request Example:**

  ```json
  {
    "logLevel": "info",
    "topic": "auth",
    "startTime": "2024-11-19T00:00:00Z",
    "endTime": "2024-11-19T23:59:59Z"
  }
  ```

  **Response Example:**

  ```json
  {
    "logs": [
      {
        "_id": "iIG-HpIBzyeB8mG4657K",
        "_index": "ingestor",
        "_score": 2.352951,
        "_source": {
          "commit": "7a91bc3",
          "level": "info",
          "message": "User authentication successful",
          "metadata": {
            "authType": "basic",
            "parentResourceId": "server-1234",
            "username": "john_doe"
          },
          "resourceId": "user-5678",
          "spanId": "span-789",
          "timestamp": "2023-09-15T08:15:00Z",
          "topic": "auth",
          "traceId": "def-uvw-456"
        }
      }
    ]
  }
  ```
