#!/bin/bash

# Import all JSON fixtures from the mounted seed directory.
cd /seed || exit 1

dir=$(ls *.json)
for file in $dir; do
  echo "${file}:"
  mongosh -u "$MONGO_DATABASE_USERNAME" -p "$MONGO_DATABASE_PASSWORD" "$MONGO_DATABASE_NAME" --authenticationDatabase "$MONGO_DATABASE_NAME" --eval "db.${file%.*}.deleteMany({})"
  if [ -s "$file" ]; then
    mongoimport -u "$MONGO_DATABASE_USERNAME" -p "$MONGO_DATABASE_PASSWORD" --authenticationDatabase "$MONGO_DATABASE_NAME" --collection "${file%.*}" --db "$MONGO_DATABASE_NAME" --file "/seed/$file" --jsonArray
  fi
  echo
done
