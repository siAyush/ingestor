package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/segmentio/kafka-go"
)

const kafkaBrokerHost = "localhost:9092"

func KafkaConsumer(ctx context.Context, ingestionContext *IngestionContext, topics []string) {
	for _, topic := range topics {
		go func(topic string) {
			reader := kafka.NewReader(kafka.ReaderConfig{
				Brokers:  []string{kafkaBrokerHost},
				Topic:    topic,
				GroupID:  "ingestor-group",
				MaxBytes: 10e6,
			})

			defer reader.Close()

			for {
				select {
				case <-ctx.Done():
					return
				default:
					message, err := reader.FetchMessage(ctx)
					if err != nil {
						if err == context.Canceled {
							return
						}
						fmt.Printf("Error fetching message from Kafka for topic %s: %v\n", topic, err)
						time.Sleep(1 * time.Second)
						continue
					}

					var log Log
					err = json.Unmarshal(message.Value, &log)
					if err != nil {
						fmt.Printf("Error decoding log from Kafka message for topic %s: %v\n", topic, err)
						continue
					}
					log.Topic = topic

					select {
					case ingestionContext.logChannel <- log:
						reader.CommitMessages(ctx, message)
					case <-ctx.Done():
						return
					}
				}
			}
		}(topic)
	}
}
