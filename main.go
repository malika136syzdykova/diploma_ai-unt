package main

import (
	"diploma-ent-mvp/internal/database"
	"diploma-ent-mvp/internal/routes"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.InitDB()

	// Setup Gin router
	r := gin.Default()

	// CORS — разрешаем фронтенду обращаться к бэкенду
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",                 // локальная разработка
			"https://diploma-frontend.onrender.com", // замени на свой URL фронтенда
		},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}))

	// Health check endpoint
	r.GET("/health", routes.HealthCheck)

	// API routes
	routes.SetupQuestionsRoutes(r)

	// Порт берём из переменной окружения (Render задаёт PORT сам)
	// Если переменной нет — используем 8080 для локальной разработки
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server starting on :" + port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
