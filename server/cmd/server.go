package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const (
	// number of logs to buffer before processing
	logsBufferSize    = 5000
	maxConcurrentLogs = 20
)

var topics = []string{"auth", "database", "email", "payment", "server", "services"}

type Log struct {
	Level      string                 `json:"level"`
	Message    string                 `json:"message"`
	ResourceID string                 `json:"resourceId"`
	Timestamp  time.Time              `json:"timestamp"`
	TraceID    string                 `json:"traceId"`
	SpanID     string                 `json:"spanId"`
	Commit     string                 `json:"commit"`
	Metadata   map[string]interface{} `json:"metadata"`
	Topic      string                 `json:"topic"`
}

type IngestionContext struct {
	esClient        *elasticsearch.Client
	indexName       string
	logChannel      chan Log
	workerWaitGroup sync.WaitGroup
}

// query routes
func routes(ingestionContext *IngestionContext) *gin.Engine {
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
	router.Use(cors.New(config))

	// number of logs
	router.GET("/logs-count", func(ctx *gin.Context) { CountLogs(ctx, ingestionContext) })

	return router
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

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ingestionContext := &IngestionContext{
		esClient:   esClient,
		indexName:  "ingestor",
		logChannel: make(chan Log, logsBufferSize),
	}

	for i := 1; i <= maxConcurrentLogs; i++ {
		ingestionContext.workerWaitGroup.Add(1)
		go SaveLogWorker(ctx, ingestionContext, i)
	}

	go KafkaConsumer(ctx, ingestionContext, topics)

	// start server
	router := routes(ingestionContext)
	fmt.Println("starting server on :3000...")
	if err := router.Run(":3000"); err != nil {
		fmt.Println("error starting server:", err)
	}

	// handle shutdown signals
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)
	<-signalChan

	fmt.Println("Shutting down...")
	cancel()
	gracefulShutdown(ingestionContext)
}

func gracefulShutdown(ingestionContext *IngestionContext) {
	// close the log channel and wait for workers to finish
	close(ingestionContext.logChannel)
	ingestionContext.workerWaitGroup.Wait()
	fmt.Println("Shutdown complete")
}
