package middleware

import (
	"diploma-ent-mvp/internal/database"
	"diploma-ent-mvp/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AdminRequired требует авторизованного пользователя с флагом is_admin (выполнять после AuthRequired).
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := GetUserID(c)
		if userID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		var u models.User
		if err := database.DB.First(&u, userID).Error; err != nil || !u.IsAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Доступ только для администратора"})
			c.Abort()
			return
		}
		c.Next()
	}
}
