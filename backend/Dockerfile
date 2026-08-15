FROM golang:1.25.0-alpine AS builder

# Set the working directory outside $GOPATH to enable the support for modules.
WORKDIR /app

# Copy the go.mod and go.sum file to the workspace
COPY go.mod go.sum ./

# Fetch dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Argument to select which service to build
ARG SERVICE_NAME=auth-service
ENV SERVICE_NAME=${SERVICE_NAME}

# Build the specific microservice
RUN go build -o main ./cmd/${SERVICE_NAME}

# Build the migration script
RUN go build -o migrate scripts/migrate.go

# Final lightweight stage
FROM alpine:latest

WORKDIR /app

# Copy the compiled binaries from the builder
COPY --from=builder /app/main .
COPY --from=builder /app/migrate .

# Copy the migrations directory so the script can find the .sql files
COPY --from=builder /app/migrations ./migrations

# Expose generic port (Railway uses PORT env variable)
EXPOSE 8080

# Run migrations then start the server
CMD ["sh", "-c", "./migrate && ./main"]
