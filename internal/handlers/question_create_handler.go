package handlers

import (
	"diploma-ent-mvp/internal/database"
	"diploma-ent-mvp/internal/models"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type CreateQuestionRequest struct {
	Subject       string   `json:"subject" binding:"required"`
	Topic         string   `json:"topic" binding:"required"`
	QuestionText  string   `json:"question_text" binding:"required"`
	Options       []string `json:"options" binding:"required"`
	CorrectAnswer string   `json:"correct_answer" binding:"required"`
	Explanation   string   `json:"explanation"`
}

func CreateQuestion(c *gin.Context) {
	var req CreateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Subject = strings.TrimSpace(req.Subject)
	req.Topic = strings.TrimSpace(req.Topic)
	req.QuestionText = strings.TrimSpace(req.QuestionText)
	req.CorrectAnswer = strings.TrimSpace(req.CorrectAnswer)
	req.Explanation = strings.TrimSpace(req.Explanation)

	if len(req.Options) < 2 || len(req.Options) > 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Нужно от 2 до 6 вариантов ответа"})
		return
	}

	opts := make([]string, 0, len(req.Options))
	for _, o := range req.Options {
		t := strings.TrimSpace(o)
		if t != "" {
			opts = append(opts, t)
		}
	}
	if len(opts) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Слишком мало непустых вариантов"})
		return
	}

	found := false
	for _, o := range opts {
		if o == req.CorrectAnswer {
			found = true
			break
		}
	}
	if !found {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Правильный ответ должен совпадать с одним из вариантов"})
		return
	}

	optionsJSON, err := json.Marshal(opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось подготовить варианты"})
		return
	}

	q := models.Question{
		Subject:       req.Subject,
		Topic:         req.Topic,
		QuestionText:  req.QuestionText,
		Options:       string(optionsJSON),
		CorrectAnswer: req.CorrectAnswer,
		Explanation:   req.Explanation,
	}
	if err := database.DB.Create(&q).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить вопрос"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": q.ID, "message": "Вопрос добавлен"})
}
