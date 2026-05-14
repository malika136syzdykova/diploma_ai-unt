package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Email        string    `gorm:"not null;uniqueIndex" json:"email"`
	TargetScore  int       `json:"target_score"`
	PasswordHash string    `gorm:"type:text" json:"-"`
	Avatar       string    `gorm:"type:text" json:"avatar"`
	IsAdmin      bool      `gorm:"default:false;index" json:"is_admin"`
	CreatedAt    time.Time `json:"created_at"`
}
