FROM amazoncorretto:17-alpine
WORKDIR /app
# Copy everything from the CURRENT folder (the inner ExamBackend)
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew bootJar --no-daemon

# Verify the jar name in your build/libs folder after a local build!
ENTRYPOINT ["java", "-jar", "build/libs/ExamBackend-0.0.1-SNAPSHOT.jar"]