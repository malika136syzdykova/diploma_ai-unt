package handlers

import (
	"diploma-ent-mvp/internal/database"
	"diploma-ent-mvp/internal/models"
	"diploma-ent-mvp/internal/services"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type QuestionResponse struct {
	ID                   uint     `json:"id"`
	Subject              string   `json:"subject"`
	Topic                string   `json:"topic"`
	QuestionText         string   `json:"question_text"`
	Options              string   `json:"options"`
	SelectedSubtopicName string   `json:"selected_subtopic_name,omitempty"`
	SubtopicMastery      *float64 `json:"subtopic_mastery,omitempty"`
	QuestionsSinceLast   *int     `json:"questions_since_last,omitempty"`
	Reason               string   `json:"reason,omitempty"`
}

func parseExcludeQuestionIDs(query string) []uint {
	var out []uint
	for _, p := range strings.Split(query, ",") {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		id64, err := strconv.ParseUint(p, 10, 32)
		if err != nil {
			continue
		}
		out = append(out, uint(id64))
	}
	return out
}

func GetRandomQuestion(c *gin.Context) {
	userIDStr := c.Query("user_id")
	subject := strings.TrimSpace(c.Query("subject"))
	exclude := parseExcludeQuestionIDs(c.Query("exclude_ids"))

	var question models.Question
	var meta services.QuestionSelectionMeta
	var err error

	// If user_id not passed -> random question (опционально по предмету).
	if userIDStr == "" {
		q := database.DB.Order("RANDOM()")
		if subject != "" {
			q = q.Where("subject = ?", subject)
		}
		if len(exclude) > 0 {
			q = q.Where("id NOT IN ?", exclude)
		}
		err = q.First(&question).Error
		if err != nil {
			c.JSON(http.StatusOK, []QuestionResponse{})
			return
		}
	} else {
		userID64, parseErr := strconv.ParseUint(userIDStr, 10, 32)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
			return
		}

		question, meta, err = services.GetAdaptiveQuestion(uint(userID64), subject, exclude)
		if err != nil {
			c.JSON(http.StatusOK, []QuestionResponse{})
			return
		}
	}

	// Return question without correct_answer and explanation
	response := QuestionResponse{
		ID:                   question.ID,
		Subject:              question.Subject,
		Topic:                question.Topic,
		QuestionText:         question.QuestionText,
		Options:              question.Options,
		SelectedSubtopicName: meta.SelectedSubtopicName,
		QuestionsSinceLast:   meta.QuestionsSinceLast,
		Reason:               meta.Reason,
	}
	if meta.SelectedSubtopicName != "" {
		mastery := meta.SubtopicMastery
		response.SubtopicMastery = &mastery
	}

	c.JSON(http.StatusOK, []QuestionResponse{response})
}
