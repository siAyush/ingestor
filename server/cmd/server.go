package main

import (
	"fmt"
	"time"

	"github.com/elastic/go-elasticsearch/v8"
)

// kafka configuration
const kafkaBrokerHost = "localhost:9092"

var topics = []string{"auth", "database", "email", "payment", "server", "services"}

// log structure
type Log struct {
	Level      string                 `json:"level"`
	Message    string                 `json:"message"`
	ResourceID string                 `json:"resourceId"`
	Timestamp  time.Time              `json:"timestamp"`
	TraceID    string                 `json:"traceId"`
	SpanID     string                 `json:"spanId"`
	Commit     string                 `json:"commit"`
	Metadata   map[string]interface{} `json:"metadata"`
}

func main() {
	esConfig := elasticsearch.Config{
		Addresses: []string{"http://localhost:9200"},
	}

	esClient, err := elasticsearch.NewClient(esConfig)
	if err != nil {
		fmt.Println("Error creating Elasticsearch client:", err)
		return
	}

	fmt.Println("esClient:", esClient)

}
