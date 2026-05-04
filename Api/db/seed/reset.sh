#!/bin/bash
cd /seed || exit 1

dir=$(ls *.json)
for file in $dir; do
  echo "$file":
  mongosh -u "$MONGO_DATABASE_USERNAME" -p "$MONGO_DATABASE_PASSWORD" "$MONGO_DATABASE_NAME" --authenticationDatabase "$MONGO_DATABASE_NAME" --eval "db.${file%.*}.deleteMany({})"
done
