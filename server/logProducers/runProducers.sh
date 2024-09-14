#!/bin/bash

topics=("auth" "database" "email" "payment" "server" "services") 

for topic in "${topics[@]}"; do
    python3 producer.py --topic "$topic" &
done

wait  
