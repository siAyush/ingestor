from kafka import KafkaProducer
import json
import time
import argparse


LOGS_PATH = 'logs'
LOGS_TIME_INTERVAL = 1  # generate logs at one second intervals
LOG_TOPICS = [
    "auth",
    "database",
    "email",
    "payment",
    "server",
    "services",
]

# kafka
producer = KafkaProducer(bootstrap_servers='localhost:9092')


# cli
parser = argparse.ArgumentParser(
    description='Kafka log producer with user specified topic')
parser.add_argument('--topic', required=True,
                    help='Kafka topic to produce logs to')
args = parser.parse_args()
topic = args.topic
file_path = f"{LOGS_PATH}/{topic}.json"

# file read
print(f"Producing logs to topic - {topic} ...\n")
with open(file_path, "r") as file:
    data = json.load(file)
    for json_object in data:
        message = json.dumps(json_object)
        producer.send(topic, message.encode("utf-8"))
        producer.flush()
        print(f"Produced ({topic}): {message}\n")
        time.sleep(LOGS_TIME_INTERVAL)
