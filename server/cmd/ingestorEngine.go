package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/elastic/go-elasticsearch/v8/esapi"
	"github.com/gin-gonic/gin"
)

const batchSize = 10

func SaveLogWorker(ctx context.Context, ingestionContext *IngestionContext, workerID int) {
	defer ingestionContext.workerWaitGroup.Done()
	var logsToInsert []Log

	for {
		select {
		case log, ok := <-ingestionContext.logChannel:
			if !ok {
				// Channel closed, process remaining logs and exit
				if len(logsToInsert) > 0 {
					processLogs(ctx, ingestionContext, logsToInsert, workerID)
				}
				return
			}
			logsToInsert = append(logsToInsert, log)
			if len(logsToInsert) >= batchSize {
				processLogs(ctx, ingestionContext, logsToInsert, workerID)
				logsToInsert = nil
			}
		case <-ctx.Done():
			// Context cancelled, process remaining logs and exit
			if len(logsToInsert) > 0 {
				processLogs(ctx, ingestionContext, logsToInsert, workerID)
			}
			return
		case <-time.After(5 * time.Second):
			// Timeout, process any remaining logs
			if len(logsToInsert) > 0 {
				processLogs(ctx, ingestionContext, logsToInsert, workerID)
				logsToInsert = nil
			}
		}
	}
}

func processLogs(ctx context.Context, ingestionContext *IngestionContext, logs []Log, workerID int) {
	fmt.Printf("Worker %d processing logs: %+v\n\n", workerID, logs)

	var bulkRequestBody strings.Builder
	for _, log := range logs {
		indexMetadata := fmt.Sprintf(`{"index": {"_index": "%s"}}`, ingestionContext.indexName)
		logJSON, err := json.Marshal(log)
		if err != nil {
			fmt.Printf("Worker %d: Error encoding log to json: %v\n", workerID, err)
			continue
		}
		bulkRequestBody.WriteString(indexMetadata + "\n")
		bulkRequestBody.Write(logJSON)
		bulkRequestBody.WriteString("\n")
	}

	req := esapi.BulkRequest{
		Body:    strings.NewReader(bulkRequestBody.String()),
		Refresh: "true",
	}

	res, err := req.Do(ctx, ingestionContext.esClient)
	if err != nil {
		fmt.Printf("Worker %d: Error indexing logs into elasticsearch: %v\n", workerID, err)
		return
	}
	defer res.Body.Close()

	if res.IsError() {
		fmt.Printf("Worker %d: Failed to index logs into elasticsearch: %s\n", workerID, res.String())
	}
}

func AddLog(ctx *gin.Context, ingestionContext *IngestionContext) {
	var log Log
	if err := ctx.BindJSON(&log); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Bad Request"})
		return
	}

	ingestionContext.logChannel <- log

	response := gin.H{
		"status": "success",
	}

	ctx.JSON(http.StatusAccepted, response)
}
