package services

import (
	"diploma-ent-mvp/internal/database"
	"diploma-ent-mvp/internal/models"
	"math/rand"
	"strings"
	"sync"
	"time"
)

const (
	repeatErrorProbability  = 0.70
	weakPickProbability     = 0.60
	mediumPickProbability   = 0.30
	strongPickProbability   = 0.10
	repeatAfterNQuestions   = 3
)

var seedOnce sync.Once
var randomFloat64 = rand.Float64
var randomIntn = rand.Intn

func seedRand() {
	seedOnce.Do(func() {
		rand.Seed(time.Now().UnixNano())
	})
}

type QuestionSelectionMeta struct {
	Reason               string
	SelectedSubtopicName string
	SubtopicMastery      float64
	QuestionsSinceLast   *int
}

type subtopicStats struct {
	Subtopic  models.Subtopic
	Questions []models.Question // уже без исключённых id (для выбора)
	Mastery   float64
}

func questionNotInExclude(id uint, exclude []uint) bool {
	for _, x := range exclude {
		if x == id {
			return false
		}
	}
	return true
}

func filterQuestionsExcluded(questions []models.Question, exclude []uint) []models.Question {
	if len(exclude) == 0 {
		return questions
	}
	out := make([]models.Question, 0, len(questions))
	for _, q := range questions {
		if questionNotInExclude(q.ID, exclude) {
			out = append(out, q)
		}
	}
	return out
}

func filterIDsExcluded(ids []uint, exclude []uint) []uint {
	if len(exclude) == 0 {
		return ids
	}
	out := make([]uint, 0, len(ids))
	for _, id := range ids {
		if questionNotInExclude(id, exclude) {
			out = append(out, id)
		}
	}
	return out
}

// GetAdaptiveQuestion subject — пустая строка: все предметы; exclude — id вопросов, которые нельзя выдать в этой сессии.
func GetAdaptiveQuestion(userID uint, subject string, exclude []uint) (models.Question, QuestionSelectionMeta, error) {
	seedRand()
	subject = strings.TrimSpace(subject)

	latestAttemptsByQuestionID, questionsSinceLastByQuestionID, err := getLatestAttempts(userID)
	if err != nil {
		return models.Question{}, QuestionSelectionMeta{}, err
	}

	readyRepeatQuestionIDs := getReadyRepeatQuestionIDs(latestAttemptsByQuestionID, questionsSinceLastByQuestionID, repeatAfterNQuestions)
	readyRepeatQuestionIDs = filterQuestionIDsBySubject(readyRepeatQuestionIDs, subject)
	readyRepeatQuestionIDs = filterIDsExcluded(readyRepeatQuestionIDs, exclude)

	if len(readyRepeatQuestionIDs) > 0 && randomFloat64() < repeatErrorProbability {
		repeatQuestionID := readyRepeatQuestionIDs[randomIntn(len(readyRepeatQuestionIDs))]
		var question models.Question
		if err := database.DB.First(&question, repeatQuestionID).Error; err != nil {
			return models.Question{}, QuestionSelectionMeta{}, err
		}
		if subject != "" && question.Subject != subject {
			// не тот предмет
		} else if !questionNotInExclude(question.ID, exclude) {
			// на всякий случай
		} else {
			questionsSinceLast := questionsSinceLastByQuestionID[repeatQuestionID]
			return question, QuestionSelectionMeta{
				Reason:             "repeat_error",
				QuestionsSinceLast: &questionsSinceLast,
			}, nil
		}
	}

	question, meta, err := getAdaptiveQuestionByMastery(latestAttemptsByQuestionID, subject, exclude)
	if err != nil {
		return models.Question{}, QuestionSelectionMeta{}, err
	}
	return question, meta, nil
}

func filterQuestionIDsBySubject(ids []uint, subject string) []uint {
	if subject == "" || len(ids) == 0 {
		return ids
	}
	var qs []models.Question
	if err := database.DB.Select("id", "subject").Where("id IN ?", ids).Find(&qs).Error; err != nil {
		return ids
	}
	byID := make(map[uint]string, len(qs))
	for _, q := range qs {
		byID[q.ID] = q.Subject
	}
	out := make([]uint, 0, len(ids))
	for _, id := range ids {
		if byID[id] == subject {
			out = append(out, id)
		}
	}
	return out
}

func getLatestAttempts(userID uint) (map[uint]models.Attempt, map[uint]int, error) {
	var attempts []models.Attempt
	if err := database.DB.
		Where("user_id = ?", userID).
		Order("created_at DESC, id DESC").
		Find(&attempts).Error; err != nil {
		return nil, nil, err
	}

	latestAttemptsByQuestionID := make(map[uint]models.Attempt)
	questionsSinceLastByQuestionID := make(map[uint]int)
	for idx, attempt := range attempts {
		if _, exists := latestAttemptsByQuestionID[attempt.QuestionID]; exists {
			continue
		}
		latestAttemptsByQuestionID[attempt.QuestionID] = attempt
		questionsSinceLastByQuestionID[attempt.QuestionID] = idx
	}

	return latestAttemptsByQuestionID, questionsSinceLastByQuestionID, nil
}

func getReadyRepeatQuestionIDs(latestAttemptsByQuestionID map[uint]models.Attempt, questionsSinceLastByQuestionID map[uint]int, cooldown int) []uint {
	ready := make([]uint, 0)
	for questionID, attempt := range latestAttemptsByQuestionID {
		if attempt.Correct {
			continue
		}
		if questionsSinceLastByQuestionID[questionID] >= cooldown {
			ready = append(ready, questionID)
		}
	}
	return ready
}

func getAdaptiveQuestionByMastery(latestAttemptsByQuestionID map[uint]models.Attempt, subject string, exclude []uint) (models.Question, QuestionSelectionMeta, error) {
	var subtopics []models.Subtopic
	q := database.DB.Model(&models.Subtopic{})
	if subject != "" {
		q = q.Where(`
			id IN (
				SELECT DISTINCT q2.subtopic_id FROM questions q2
				JOIN subtopics st ON q2.subtopic_id = st.id
				JOIN sections sec ON st.section_id = sec.id
				JOIN subjects sub ON sec.subject_id = sub.id
				WHERE q2.subtopic_id IS NOT NULL AND sub.name = ?
			)`, subject)
	} else {
		q = q.Where("id IN (SELECT DISTINCT subtopic_id FROM questions WHERE subtopic_id IS NOT NULL)")
	}
	if err := q.Find(&subtopics).Error; err != nil {
		return models.Question{}, QuestionSelectionMeta{}, err
	}

	if len(subtopics) == 0 {
		question, err := getRandomQuestion(subject, exclude)
		if err != nil {
			return models.Question{}, QuestionSelectionMeta{}, err
		}
		return question, QuestionSelectionMeta{}, nil
	}

	statsBySubtopicID := make(map[uint]subtopicStats, len(subtopics))
	weak := make([]uint, 0)
	medium := make([]uint, 0)
	strong := make([]uint, 0)

	for _, subtopic := range subtopics {
		var questions []models.Question
		dbq := database.DB.Where("subtopic_id = ?", subtopic.ID)
		if subject != "" {
			dbq = dbq.Where("subject = ?", subject)
		}
		if err := dbq.Find(&questions).Error; err != nil {
			return models.Question{}, QuestionSelectionMeta{}, err
		}
		pool := filterQuestionsExcluded(questions, exclude)
		if len(pool) == 0 {
			continue
		}

		correctCount := 0
		for _, question := range questions {
			latestAttempt, exists := latestAttemptsByQuestionID[question.ID]
			if exists && latestAttempt.Correct {
				correctCount++
			}
		}

		mastery := float64(correctCount) / float64(len(questions))
		statsBySubtopicID[subtopic.ID] = subtopicStats{
			Subtopic:  subtopic,
			Questions: pool,
			Mastery:   mastery,
		}

		if mastery < 0.4 {
			weak = append(weak, subtopic.ID)
		} else if mastery <= 0.7 {
			medium = append(medium, subtopic.ID)
		} else {
			strong = append(strong, subtopic.ID)
		}
	}

	selectedReason, selectedSubtopicID := pickSubtopicWithFallback(weak, medium, strong)
	if selectedSubtopicID == 0 {
		question, err := getRandomQuestion(subject, exclude)
		if err != nil {
			return models.Question{}, QuestionSelectionMeta{}, err
		}
		return question, QuestionSelectionMeta{}, nil
	}

	stats := statsBySubtopicID[selectedSubtopicID]
	if len(stats.Questions) == 0 {
		question, err := getRandomQuestion(subject, exclude)
		if err != nil {
			return models.Question{}, QuestionSelectionMeta{}, err
		}
		return question, QuestionSelectionMeta{}, nil
	}
	question := stats.Questions[randomIntn(len(stats.Questions))]
	return question, QuestionSelectionMeta{
		Reason:               selectedReason,
		SelectedSubtopicName: stats.Subtopic.Name,
		SubtopicMastery:      stats.Mastery,
	}, nil
}

func pickSubtopicWithFallback(weak, medium, strong []uint) (string, uint) {
	candidates := make([]struct {
		reason string
		weight float64
		items  []uint
	}, 0, 3)

	if len(weak) > 0 {
		candidates = append(candidates, struct {
			reason string
			weight float64
			items  []uint
		}{reason: "weak_topic", weight: weakPickProbability, items: weak})
	}
	if len(medium) > 0 {
		candidates = append(candidates, struct {
			reason string
			weight float64
			items  []uint
		}{reason: "medium_topic", weight: mediumPickProbability, items: medium})
	}
	if len(strong) > 0 {
		candidates = append(candidates, struct {
			reason string
			weight float64
			items  []uint
		}{reason: "strong_topic", weight: strongPickProbability, items: strong})
	}

	if len(candidates) == 0 {
		return "", 0
	}

	totalWeight := 0.0
	for _, candidate := range candidates {
		totalWeight += candidate.weight
	}

	r := randomFloat64() * totalWeight
	running := 0.0
	for _, candidate := range candidates {
		running += candidate.weight
		if r <= running {
			return candidate.reason, candidate.items[randomIntn(len(candidate.items))]
		}
	}

	last := candidates[len(candidates)-1]
	return last.reason, last.items[randomIntn(len(last.items))]
}

func getRandomQuestion(subject string, exclude []uint) (models.Question, error) {
	var question models.Question
	q := database.DB.Order("RANDOM()")
	if strings.TrimSpace(subject) != "" {
		q = q.Where("subject = ?", subject)
	}
	if len(exclude) > 0 {
		q = q.Where("id NOT IN ?", exclude)
	}
	if err := q.First(&question).Error; err != nil {
		return models.Question{}, err
	}
	return question, nil
}
