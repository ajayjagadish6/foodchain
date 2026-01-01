# ---------- Frontend build ----------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
# Build with Vite; output goes to /app/frontend/dist
RUN npm run build

# ---------- Backend build ----------
FROM maven:3.9.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
# download deps (layered)
RUN mvn -f backend/pom.xml -q -DskipTests dependency:go-offline
COPY backend/ backend/
# copy built UI into Spring Boot static folder
RUN rm -rf backend/src/main/resources/static && mkdir -p backend/src/main/resources/static
COPY --from=frontend-build /app/frontend/dist/ backend/src/main/resources/static/
RUN mvn -f backend/pom.xml -q -DskipTests package

# ---------- Runtime ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ENV JAVA_OPTS=""
# Cloud Run provides PORT
ENV PORT=8080
COPY --from=backend-build /app/backend/target/foodchain.jar /app/foodchain.jar
EXPOSE 8080
CMD ["sh","-c","java $JAVA_OPTS -jar /app/foodchain.jar"]
