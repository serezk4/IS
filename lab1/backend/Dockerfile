FROM bellsoft/liberica-openjdk-alpine:21 AS builder
WORKDIR /application
COPY . .
RUN --mount=type=cache,target=/root/.gradle  chmod +x gradlew && ./gradlew clean build -x test

FROM bellsoft/liberica-openjre-alpine:21 AS layers
WORKDIR /application
COPY --from=builder /application/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM bellsoft/liberica-openjre-alpine:21
VOLUME /tmp
RUN adduser -S spring-user
USER spring-user
COPY --from=layers /application/dependencies/ ./
COPY --from=layers /application/spring-boot-loader/ ./
COPY --from=layers /application/snapshot-dependencies/ ./
COPY --from=layers /application/application/ ./

RUN mkdir -p /app/logs && chmod 777 /app/logs
RUN touch /app/logs/app.log && chmod 777 1000:1000 /app/logs/app.log

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]