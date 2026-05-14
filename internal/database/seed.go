package database

import (
	"diploma-ent-mvp/internal/models"
	"encoding/json"
	"log"
	"os"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type QuestionJSON struct {
	Subject       string   `json:"subject"`
	Topic         string   `json:"topic"`
	QuestionText  string   `json:"questionText"`
	Options       []string `json:"options"`
	CorrectAnswer string   `json:"correctAnswer"`
	Explanation   string   `json:"explanation"`
}

func insertQuestionBatch(items []QuestionJSON) int {
	inserted := 0
	for _, qj := range items {
		optionsJSON, err := json.Marshal(qj.Options)
		if err != nil {
			log.Printf("Failed to marshal options for question: %v", err)
			continue
		}

		question := models.Question{
			Subject:       qj.Subject,
			Topic:         qj.Topic,
			QuestionText:  qj.QuestionText,
			Options:       string(optionsJSON),
			CorrectAnswer: qj.CorrectAnswer,
			Explanation:   qj.Explanation,
		}

		if err := DB.Create(&question).Error; err != nil {
			log.Printf("Failed to create question: %v", err)
			continue
		}
		inserted++
	}
	return inserted
}

func seedQuestionsFromFile(path string, max int) (int, error) {
	file, err := os.Open(path)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return 0, err
	}
	if fileInfo.Size() == 0 {
		log.Printf("%s is empty, skipping", path)
		return 0, nil
	}

	var questionsJSON []QuestionJSON
	if err := json.NewDecoder(file).Decode(&questionsJSON); err != nil {
		return 0, err
	}
	if len(questionsJSON) == 0 {
		return 0, nil
	}
	if max > 0 && len(questionsJSON) > max {
		questionsJSON = questionsJSON[:max]
	}

	n := insertQuestionBatch(questionsJSON)
	log.Printf("Seeded %d questions from %s", n, path)
	return n, nil
}

// SeedAllQuestions загружает вопросы в порядке, согласованном с *_kz.json:
// математика (id 1–50), чтение (51–100), история из questions.json (101–200).
func SeedAllQuestions() {
	var count int64
	DB.Model(&models.Question{}).Count(&count)
	if count > 0 {
		log.Println("Questions already exist in database, skipping seed")
		return
	}

	total := 0
	if n, err := seedQuestionsFromFile("internal/database/math_questions.json", 50); err != nil {
		log.Printf("Failed to seed math_questions.json: %v", err)
	} else {
		total += n
	}
	if n, err := seedQuestionsFromFile("internal/database/reading_questions.json", 0); err != nil {
		log.Printf("Failed to seed reading_questions.json: %v", err)
	} else {
		total += n
	}
	if n, err := seedQuestionsFromFile("internal/database/questions.json", 0); err != nil {
		log.Printf("Failed to seed questions.json: %v", err)
	} else {
		total += n
	}
	log.Printf("Total questions seeded: %d", total)
}

func SeedUsers() {
	// Check if user already exists
	var existingUser models.User
	if err := DB.Where("email = ?", "nurkhan@example.com").First(&existingUser).Error; err == nil {
		log.Println("User Nurkhan already exists, skipping seed")
		return
	}

	// Create user
	seedPassword := os.Getenv("SEED_USER_PASSWORD")
	if seedPassword == "" {
		seedPassword = "12345678"
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(seedPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash seed user password: %v", err)
		return
	}

	user := models.User{
		Name:         "Nurkhan",
		Email:        "nurkhan@example.com",
		TargetScore:  120,
		PasswordHash: string(passwordHash),
		Avatar:       "",
	}

	if err := DB.Create(&user).Error; err != nil {
		log.Printf("Failed to create user: %v", err)
		return
	}

	log.Println("Successfully seeded user: Nurkhan")
}

// SeedAdmin создаёт или помечает учётную запись администратора (email: ADMIN_EMAIL или admin@bilimai.local).
func SeedAdmin() {
	adminEmail := strings.TrimSpace(strings.ToLower(os.Getenv("ADMIN_EMAIL")))
	if adminEmail == "" {
		adminEmail = "admin@bilimai.local"
	}
	password := os.Getenv("ADMIN_PASSWORD")
	if password == "" {
		password = "adminadmin"
	}

	var u models.User
	err := DB.Where("email = ?", adminEmail).First(&u).Error
	if err == nil {
		if !u.IsAdmin {
			if err := DB.Model(&u).Update("is_admin", true).Error; err != nil {
				log.Printf("Failed to set admin flag: %v", err)
			} else {
				log.Printf("Admin flag set for existing user %s", adminEmail)
			}
		} else {
			log.Printf("Admin user already present: %s", adminEmail)
		}
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash admin password: %v", err)
		return
	}

	u = models.User{
		Name:         "Администратор",
		Email:        adminEmail,
		TargetScore:  0,
		PasswordHash: string(hash),
		Avatar:       "",
		IsAdmin:      true,
	}
	if err := DB.Create(&u).Error; err != nil {
		log.Printf("Failed to create admin: %v", err)
		return
	}
	log.Printf("Created admin: %s (password from ADMIN_PASSWORD or default; change in production)", adminEmail)
}
