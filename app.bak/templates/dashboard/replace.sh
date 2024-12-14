#!/bin/bash

# Check if exactly one argument is passed
if [ $# -ne 1 ]; then
 echo "Usage: $0 <file_name>"
 exit 1
fi

# Check if the file exists
if [ ! -f "$1" ]; then
 echo "File does not exist"
 exit 1
fi

# Perform the replacement
sed -i "s@public/fonts@fonts@g" "$1" || {
 echo "An error occurred while replacing text"
 exit 1
}

echo "Replacement complete"
