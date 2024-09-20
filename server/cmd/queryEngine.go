package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/elastic/go-elasticsearch/v8/esapi"
	"github.com/gin-gonic/gin"
)

func CountLogs(ctx *gin.Context, ingestionContext *IngestionContext) {
	countReq := esapi.CountRequest{
		Index: []string{ingestionContext.indexName},
	}

	res, err := countReq.Do(context.Background(), ingestionContext.esClient)
	if err != nil {
		fmt.Println("error querying logs count from elasticsearch:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	defer res.Body.Close()

	if res.IsError() {
		fmt.Printf("failed to get logs count from elasticsearch: %s\n", res.String())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	var countResponse map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&countResponse); err != nil {
		fmt.Println("Error decoding Elasticsearch count response:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// extract the count from the response
	count, ok := countResponse["count"].(float64)
	if !ok {
		fmt.Println("error extracting count from Elasticsearch response")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"count": int(count)})
}
