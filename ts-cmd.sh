#!/bin/bash

# Ensure script exits on error
set -e

# Check if arguments are provided
if [ $# -eq 0 ]; then
  echo "No arguments supplied"
  exit 1
fi

# Check if the first argument is --path
if [ "$1" != "--path" ]; then
  echo "--path argument is required"
  echo "Usage: ts-cmd.sh --path <path-to-custom-ts-config> --cmd <command>"
  exit 1
fi

# Check if the --path value is provided
if [ -z "$2" ]; then
  echo "--path value is required"
  echo "Usage: ts-cmd.sh --path <path-to-custom-ts-config> --cmd <command>"
  exit 1
fi

# Check if the third argument is --cmd
if [ "$3" != "--cmd" ]; then
  echo "--cmd argument is required"
  echo "Usage: ts-cmd.sh --path <path-to-custom-ts-config> --cmd <command>"
  exit 1
fi

# Check if the --cmd value is provided
if [ -z "$4" ]; then
  echo "--cmd value is required"
  echo "Usage: ts-cmd.sh --path <path-to-custom-ts-config> --cmd <command>"
  exit 1
fi

# Extract the path to the custom tsconfig and the command
CUSTOM_TS_CONFIG="$2"
shift 3 # Shift the first three arguments, so $@ now contains the command
CMD="$@"

echo "Path to custom tsconfig: $CUSTOM_TS_CONFIG"
echo "Command: $CMD"

# Function to restore the original tsconfig.json
restore_tsconfig() {
  if [ -f "./tsconfig.json.bak" ]; then
    mv ./tsconfig.json.bak ./tsconfig.json
    echo "tsconfig.json restored"
  fi
}

# Set a trap to restore tsconfig.json on exit, regardless of whether the script succeeds or fails
trap restore_tsconfig EXIT

# Backup the existing tsconfig.json
if [ -f "./tsconfig.json" ]; then
  mv ./tsconfig.json ./tsconfig.json.bak
fi

# Copy the custom tsconfig to tsconfig.json
cp "$CUSTOM_TS_CONFIG" ./tsconfig.json

# Run the specified command
echo "Running command: $CMD"
$CMD
