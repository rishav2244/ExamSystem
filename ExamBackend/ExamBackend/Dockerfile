# Stage 1: Build
FROM amazoncorretto:17-alpine AS build
WORKDIR /app

# Copy wrapper and configs
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle settings.gradle ./

# Cache dependencies
RUN ./gradlew build -x test --no-daemon > /dev/null 2>&1 || true

# Build JAR
COPY src ./src
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Runtime
FROM amazoncorretto:17-alpine
WORKDIR /app

# Ensure the snapshot directory exists
RUN mkdir -p /app/data/snapshots && chmod 777 /app/data/snapshots

# Copy the JAR from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Spring will use the SERVER_PORT env var automatically
ENTRYPOINT ["java", "-jar", "app.jar"]