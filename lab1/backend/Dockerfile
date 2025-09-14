FROM bellsoft/liberica-openjdk-alpine:21 AS builder
WORKDIR /application
COPY . .
RUN --mount=type=cache,target=/root/.gradle chmod +x gradlew && ./gradlew clean build -x test

FROM bellsoft/liberica-openjre-alpine:21 AS layers
WORKDIR /application
COPY --from=builder /application/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM bellsoft/liberica-openjre-alpine:21
RUN addgroup -S spring && adduser -S -G spring spring
ARG APP_DIR=/app
RUN mkdir -p ${APP_DIR}/logs \
 && chown -R spring:spring ${APP_DIR} \
 && chmod 755 ${APP_DIR} \
 && chmod 750 ${APP_DIR}/logs
USER spring:spring
WORKDIR ${APP_DIR}
COPY --from=layers /application/dependencies/ ./
COPY --from=layers /application/spring-boot-loader/ ./
COPY --from=layers /application/snapshot-dependencies/ ./
COPY --from=layers /application/application/ ./
RUN touch ${APP_DIR}/logs/app.log
ENV LOG_DIR=${APP_DIR}/logs
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]