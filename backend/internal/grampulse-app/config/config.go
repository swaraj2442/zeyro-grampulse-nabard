package config

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	DatabaseURL  string
	GroqAPIKey   string
	SarvamAPIKey string
	JWTSecret    string
}

func Load() *Config {
	_ = godotenv.Load() // Ignore error if .env file does not exist
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbURL := os.Getenv("DATABASE_URL")
	jwtSecret := os.Getenv("JWT_SECRET")

	masterKeyB64 := os.Getenv("MASTER_KEY")
	groqKeyEnc := os.Getenv("GROQ_API_KEY_ENC")
	sarvamKeyEnc := os.Getenv("SARVAM_API_KEY_ENC")

	var groqKey, sarvamKey string
	if masterKeyB64 != "" {
		masterKey, err := base64.StdEncoding.DecodeString(masterKeyB64)
		if err == nil && len(masterKey) == 32 {
			if groqKeyEnc != "" {
				groqKey = decrypt(masterKey, groqKeyEnc)
			}
			if sarvamKeyEnc != "" {
				sarvamKey = decrypt(masterKey, sarvamKeyEnc)
			}
		} else {
			log.Println("WARNING: Invalid MASTER_KEY format")
		}
	} else {
		// Fallback to unencrypted for local dev if desired
		groqKey = os.Getenv("GROQ_API_KEY")
		sarvamKey = os.Getenv("SARVAM_API_KEY")
	}

	if groqKey == "" {
		log.Println("WARNING: GROQ_API_KEY is not set. Chat calls will fail.")
	}
	if sarvamKey == "" {
		log.Println("WARNING: SARVAM_API_KEY is not set. Voice calls will fail.")
	}

	return &Config{
		Port:         port,
		DatabaseURL:  dbURL,
		GroqAPIKey:   groqKey,
		SarvamAPIKey: sarvamKey,
		JWTSecret:    jwtSecret,
	}
}

func decrypt(key []byte, cryptoText string) string {
	ciphertext, _ := base64.StdEncoding.DecodeString(cryptoText)
	if len(ciphertext) < 12 {
		return ""
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return ""
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return ""
	}
	nonce := ciphertext[:12]
	ciphertext = ciphertext[12:]
	plaintext, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return ""
	}
	return string(plaintext)
}
