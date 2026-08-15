package grampulse

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const groqAPIURL = "https://api.groq.com/openai/v1/chat/completions"

func detectLanguageCode(text string) string {
	for _, r := range text {
		switch {
		case r >= 0x0900 && r <= 0x097F:
			return "hi-IN" // Devanagari (Hindi/Marathi)
		case r >= 0x0A80 && r <= 0x0AFF:
			return "gu-IN" // Gujarati
		case r >= 0x0980 && r <= 0x09FF:
			return "bn-IN" // Bengali
		case r >= 0x0B80 && r <= 0x0BFF:
			return "ta-IN" // Tamil
		case r >= 0x0C00 && r <= 0x0C7F:
			return "te-IN" // Telugu
		case r >= 0x0C80 && r <= 0x0CFF:
			return "kn-IN" // Kannada
		case r >= 0x0D00 && r <= 0x0D7F:
			return "ml-IN" // Malayalam
		case r >= 0x0A00 && r <= 0x0A7F:
			return "pa-IN" // Punjabi (Gurmukhi)
		case r >= 0x0B00 && r <= 0x0B7F:
			return "or-IN" // Odia
		}
	}
	return "en-IN" // Default
}

type AIService interface {
	GetChatCompletion(ctx context.Context, userID uuid.UUID, messages []map[string]interface{}) ([]byte, int, error)
	GetTextToSpeech(ctx context.Context, text string, languageCode string) ([]byte, int, error)
	GetSpeechToText(ctx context.Context, audioData []byte, filename string, languageCode string) ([]byte, int, error)
	GetSpeechToTextStream(ctx context.Context, clientConn *websocket.Conn, lang string) error
}

type GroqAIService struct {
	groqAPIKey   string
	sarvamAPIKey string 
	client       *http.Client
	chatRepo     ChatRepository
}

func NewGroqAIService(groqAPIKey, sarvamAPIKey string, chatRepo ChatRepository) *GroqAIService {
	return &GroqAIService{
		groqAPIKey:   groqAPIKey,
		sarvamAPIKey: sarvamAPIKey,
		client:       &http.Client{},
		chatRepo:     chatRepo,
	}
}

func (s *GroqAIService) GetChatCompletion(ctx context.Context, userID uuid.UUID, messages []map[string]interface{}) ([]byte, int, error) {
	// Open-source models requested by user as Llama is being phased out
	modelsToTry := []string{"openai/gpt-oss-120b", "openai/gpt-oss-20b"}

	var lastBodyBytes []byte
	var lastStatusCode int
	var lastErr error

	for _, model := range modelsToTry {
		groqPayload := map[string]interface{}{
			"model":    model,
			"messages": messages,
		}

		jsonData, err := json.Marshal(groqPayload)
		if err != nil {
			log.Printf("[ERROR] GroqAIService: Failed to marshal payload: %v", err)
			return nil, http.StatusInternalServerError, fmt.Errorf("error marshalling payload: %w", err)
		}

		req, err := http.NewRequestWithContext(ctx, "POST", groqAPIURL, bytes.NewBuffer(jsonData))
		if err != nil {
			log.Printf("[ERROR] GroqAIService: Failed to create request: %v", err)
			return nil, http.StatusInternalServerError, fmt.Errorf("error creating request: %w", err)
		}

		req.Header.Set("Authorization", "Bearer "+s.groqAPIKey)
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.client.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("error contacting Groq API with model %s: %w", model, err)
			continue
		}

		bodyBytes, err := io.ReadAll(resp.Body)
		resp.Body.Close()

		if err != nil {
			log.Printf("[ERROR] GroqAIService: Failed to read response body for model %s: %v", model, err)
			lastErr = fmt.Errorf("error reading response body for model %s: %w", model, err)
			continue
		}

		log.Printf("[DEBUG] GroqAIService: Groq response status for %s: %d", model, resp.StatusCode)

		lastStatusCode = resp.StatusCode
		lastBodyBytes = bodyBytes

		if resp.StatusCode == http.StatusOK {
			var groqResp struct {
				Choices []struct {
					Message map[string]interface{} `json:"message"`
				} `json:"choices"`
			}
			
			if err := json.Unmarshal(bodyBytes, &groqResp); err == nil && len(groqResp.Choices) > 0 {
				updatedMessages := append(messages, groqResp.Choices[0].Message)
				
				session, err := s.chatRepo.GetSessionForUser(ctx, userID)
				if err == nil {
					session.Messages = updatedMessages
					_ = s.chatRepo.SaveSession(ctx, session)
				}
			}
			return bodyBytes, resp.StatusCode, nil
		}
	}

	if lastStatusCode != 0 {
		return lastBodyBytes, lastStatusCode, nil
	}
	return nil, http.StatusBadGateway, lastErr
}

func (s *GroqAIService) GetTextToSpeech(ctx context.Context, text string, languageCode string) ([]byte, int, error) {
	url := "https://api.sarvam.ai/text-to-speech"
	
	targetLang := languageCode
	if targetLang == "" {
		targetLang = detectLanguageCode(text)
	}
	log.Printf("[INFO] GroqAIService.GetTextToSpeech: Detected language code: %s", targetLang)
	
	payload := map[string]interface{}{
		"inputs":               []string{text},
		"target_language_code": targetLang,
		"speaker":              "ishita",
		"model":                "bulbul:v3",
	}
	
	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[ERROR] GroqAIService.GetTextToSpeech: JSON marshal error: %v", err)
		return nil, http.StatusInternalServerError, err
	}
	
	log.Printf("[DEBUG] GroqAIService.GetTextToSpeech: Payload: %s", string(jsonData))
	
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("[ERROR] GroqAIService.GetTextToSpeech: Request creation error: %v", err)
		return nil, http.StatusInternalServerError, err
	}
	
	req.Header.Set("api-subscription-key", s.sarvamAPIKey)
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, http.StatusBadGateway, err
	}
	defer resp.Body.Close()
	
	bodyBytes, err := io.ReadAll(resp.Body)
	return bodyBytes, resp.StatusCode, err
}

func (s *GroqAIService) GetSpeechToText(ctx context.Context, audioData []byte, filename string, languageCode string) ([]byte, int, error) {
	url := "https://api.sarvam.ai/speech-to-text"
	
	// Create multipart body
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	// Add file
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	part.Write(audioData)
	
	// Add language code
	_ = writer.WriteField("language_code", languageCode)
	_ = writer.WriteField("model", "saaras:v3")
	
	writer.Close()
	
	req, err := http.NewRequestWithContext(ctx, "POST", url, body)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	
	req.Header.Set("api-subscription-key", s.sarvamAPIKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, http.StatusBadGateway, err
	}
	defer resp.Body.Close()
	
	bodyBytes, err := io.ReadAll(resp.Body)
	return bodyBytes, resp.StatusCode, err
}

func (s *GroqAIService) GetSpeechToTextStream(ctx context.Context, clientConn *websocket.Conn, lang string) error {
	if s.sarvamAPIKey == "" {
		log.Printf("[ERROR] GetSpeechToTextStream: SARVAM_API_KEY is empty! Check Railway env vars.")
		return fmt.Errorf("sarvam API key not configured")
	}
	log.Printf("[INFO] GetSpeechToTextStream: Sarvam key is configured, connecting...")

	sarvamURL := "wss://api.sarvam.ai/speech-to-text-realtime/ws?language_code=auto&stream_type=balanced&silence_duration_ms=5000"
	header := http.Header{}
	header.Set("api-subscription-key", s.sarvamAPIKey)

	// Connect to Sarvam
	sarvamConn, resp, err := websocket.DefaultDialer.Dial(sarvamURL, header)
	if err != nil {
		log.Printf("[ERROR] GroqAIService.GetSpeechToTextStream: Failed to connect to Sarvam WS: %v", err)
		if resp != nil {
			log.Printf("[ERROR] Sarvam WS Response Status: %d", resp.StatusCode)
		}
		return err
	}
	defer sarvamConn.Close()

	log.Printf("[INFO] GroqAIService.GetSpeechToTextStream: Successfully connected to Sarvam WS")

	errChan := make(chan error, 2)

	// Go routine to read from Flutter client and forward to Sarvam
	go func() {
		for {
			messageType, message, err := clientConn.ReadMessage()
			if err != nil {
				log.Printf("[INFO] Client read error or disconnected: %v", err)
				errChan <- err
				return
			}
			
			// We expect the client to send the JSON format required by Sarvam:
			// {"audio": "base64...", "sample_rate": 16000, "encoding": "audio/wav" or "pcm_s16le"}
			// So we just blindly forward it.
			err = sarvamConn.WriteMessage(messageType, message)
			if err != nil {
				log.Printf("[ERROR] Failed to write to Sarvam WS: %v", err)
				errChan <- err
				return
			}
		}
	}()

	// Go routine to read from Sarvam and forward to Flutter client
	go func() {
		for {
			messageType, message, err := sarvamConn.ReadMessage()
			if err != nil {
				log.Printf("[INFO] Sarvam read error or disconnected: %v", err)
				errChan <- err
				return
			}

			// Forward Sarvam's response to the client
			err = clientConn.WriteMessage(messageType, message)
			if err != nil {
				log.Printf("[ERROR] Failed to write to Client WS: %v", err)
				errChan <- err
				return
			}
		}
	}()

	// Wait for either connection to close or error
	return <-errChan
}
