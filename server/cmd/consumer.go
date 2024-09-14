package main

import (
	"context"
	"fmt"
	"log"

	"github.com/segmentio/kafka-go"
)

const kafkaBrokerHost = "localhost:9092"

func KafkaConsumer(topics []string) {
	for _, topic := range topics {
		reader := kafka.NewReader(kafka.ReaderConfig{
			Brokers:  []string{kafkaBrokerHost},
			Topic:    topic,
			GroupID:  "log-consumer-group",
			MaxBytes: 10e6,
		})
		defer reader.Close()

		for {
			ctx := context.Background()
			m, err := reader.ReadMessage(ctx)
			if err != nil {
				log.Fatal("Error while reading message: ", err)
			}

			fmt.Printf("Message at offset %d: %s = %s\n", m.Offset, string(m.Key), string(m.Value))
		}
	}
}
