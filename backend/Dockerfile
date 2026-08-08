# Build stage
FROM maven:3.9.4-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-slim

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /app/target/portfolio-ai-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
