# Build and runtime in single stage
FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

# Copy all files
COPY . .

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Set environment variable for Spring Boot
ENV JAVA_OPTS="-Dspring.config.location=classpath:/application.properties"

# Run the application with explicit env variable passing
CMD ["java", "-jar", "target/portfolio-ai-backend-0.0.1-SNAPSHOT.jar"]
