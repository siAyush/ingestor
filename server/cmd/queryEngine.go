package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

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

func FetchAllLogs(ctx *gin.Context, ingestionContext *IngestionContext) {
	// Extract query parameters
	page := ctx.DefaultQuery("page", "1")        // Get current page
	size := ctx.DefaultQuery("size", "20")       // Get size per page
	logLevel := ctx.DefaultQuery("logLevel", "") // Get logLevel, default is empty (i.e., no filter)
	topic := ctx.DefaultQuery("topic", "")       // Get topic, default is empty (i.e., no filter)
	startDate := ctx.Query("startDate")          // Optionally get startDate filter
	endDate := ctx.Query("endDate")              // Optionally get endDate filter

	// Convert page and size to integers
	pageInt, err := strconv.Atoi(page)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page value"})
		return
	}

	sizeInt, err := strconv.Atoi(size)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid size value"})
		return
	}

	// Prepare Elasticsearch query with optional filters
	query := map[string]interface{}{
		"from": (pageInt - 1) * sizeInt,
		"size": sizeInt,
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": []interface{}{},
			},
		},
	}

	// Add logLevel filter if provided
	if logLevel != "" && logLevel != "all" {
		query["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"] = append(
			query["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"].([]interface{}),
			map[string]interface{}{
				"match": map[string]interface{}{
					"level": logLevel,
				},
			},
		)
	}

	// Add topic filter if provided
	if topic != "" && topic != "all" {
		query["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"] = append(
			query["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"].([]interface{}),
			map[string]interface{}{
				"match": map[string]interface{}{
					"topic": topic,
				},
			},
		)
	}

	// Add startDate and endDate filters if provided
	if startDate != "" {
		query["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"] = append(
			query["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"].([]interface{}),
			map[string]interface{}{
				"range": map[string]interface{}{
					"timestamp": map[string]interface{}{
						"gte": startDate,
					},
				},
			},
		)
	}
	if endDate != "" {
		query["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"] = append(
			query["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"].([]interface{}),
			map[string]interface{}{
				"range": map[string]interface{}{
					"timestamp": map[string]interface{}{
						"lte": endDate,
					},
				},
			},
		)
	}

	// Marshal the query into JSON
	queryBytes, err := json.Marshal(query)
	if err != nil {
		fmt.Println("Error marshalling Elasticsearch query:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Create a search request with the JSON body
	searchReq := esapi.SearchRequest{
		Index: []string{ingestionContext.indexName},
		Body:  bytes.NewReader(queryBytes),
	}

	// Execute the search request
	res, err := searchReq.Do(context.Background(), ingestionContext.esClient)
	if err != nil {
		fmt.Println("error querying logs from Elasticsearch:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	defer res.Body.Close()

	if res.IsError() {
		fmt.Printf("failed to get logs from Elasticsearch: %s\n", res.String())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Decode the response body
	var logsResponse map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&logsResponse); err != nil {
		fmt.Println("Error decoding Elasticsearch logs response:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Return the logs (hits) in the response
	hits, ok := logsResponse["hits"].(map[string]interface{})
	if !ok {
		fmt.Println("error extracting hits from Elasticsearch response")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	logs, ok := hits["hits"].([]interface{})
	if !ok {
		fmt.Println("error extracting logs from Elasticsearch hits")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"logs": logs})
}
