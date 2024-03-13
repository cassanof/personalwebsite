package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type GenerateRequest struct {
	Prompt string `json:"prompt"`
}

type GenerateResponse struct {
	Generated string `json:"generated"`
}

type GenerateRequestQueued struct {
	req           GenerateRequest
	responseQueue chan *GenerateResponse
}

type Cache struct {
	Requests map[string]*GenerateResponse
	Lock     sync.RWMutex
}

const (
	STATIC_PATH = "./frontend/dist/"
)

var (
	app *fiber.App = fiber.New(fiber.Config{
		Prefork:       true,
		CaseSensitive: true,
		StrictRouting: true,
		GETOnly:       false,
		AppName:       "Federico's Personal Website",
	})
	MAX_QUEUE_SIZE    = 1
	API_KEY           = ""
	ENGINE            = ""
	MODEL_ENDPOINT    = "https://api-inference.huggingface.co/models/gammatau/deepseek-1b-multipl-t-rkt"
	LLAMACPP_ENDPOINT = "http://localhost:8000/completion"
	generateQueue     = make(chan GenerateRequestQueued, MAX_QUEUE_SIZE)
	cache             = Cache{
		Requests: make(map[string]*GenerateResponse),
		Lock:     sync.RWMutex{},
	}
)

func main() {
	// get engine for completion
	ENGINE = os.Getenv("ENGINE")
	switch ENGINE {
	case "HF":
		ENGINE = "HF"
	case "LLAMACPP":
		ENGINE = "LLAMACPP"
		if os.Getenv("LLAMACPP_ENDPOINT") != "" {
			LLAMACPP_ENDPOINT = os.Getenv("LLAMACPP_ENDPOINT")
		}
	default:
		// default to HF
		ENGINE = "HF"
	}

	if ENGINE == "HF" {
		API_KEY = os.Getenv("API_KEY")
		if API_KEY == "" {
			log.Fatal("huggingface API key not set!! set it with the API_KEY environment variable. Or use llamacpp as the engine with ENGINE=LLAMACPP")
		}
		if os.Getenv("MODEL_ENDPOINT") != "" {
			MODEL_ENDPOINT = os.Getenv("MODEL_ENDPOINT")
		}
	}

	// set max queue size to env variable if set
	// otherwise, use default value
	if os.Getenv("MAX_QUEUE_SIZE") != "" {
		str_max_queue_size := os.Getenv("MAX_QUEUE_SIZE")
		i, err := strconv.Atoi(str_max_queue_size)
		if err != nil {
			log.Fatal("MAX_QUEUE_SIZE must be an integer")
		}
		MAX_QUEUE_SIZE = i
	}

	app.Static("/", STATIC_PATH)

	file := createLogFile()
	defer file.Close()

	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path} | ${ips} ${referer} - ${reqHeader:User-Agent}\n",
		Output: file,
	}))
	log.SetOutput(file)

	app.Post("/generate", generateEndpoint)
	for i := 0; i < MAX_QUEUE_SIZE; i++ {
		go generateQueueWorker()
	}

	// 404 Handler
	app.Use(func(c *fiber.Ctx) error {
		return c.SendFile(STATIC_PATH+"404.html", false)
	})

	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestCompression,
	}))

	app.Use(recover.New())

	app.Listen(":5000")
}

type HuggingFaceRequest struct {
	Inputs     string `json:"inputs"`
	Parameters struct {
		MaxNewTokens int     `json:"max_new_tokens"`
		Temperature  float32 `json:"temperature"`
		TopP         float32 `json:"top_p"`
	} `json:"parameters"`
	Options struct {
		WaitForModel bool `json:"wait_for_model"`
	} `json:"options"`
}

type LlamaCppRequest struct {
	Prompt      string  `json:"prompt"`
	NPredict    int     `json:"n_predict"`
	Temperature float32 `json:"temperature"`
}

func postJsonReq(url string, reqBody interface{}, auth bool) *http.Response {
	httpClient := &http.Client{}
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		log.Fatal(err)
		return nil
	}
	req.Header.Set("Content-Type", "application/json")
	if auth {
		req.Header.Set("Authorization", "Bearer "+API_KEY)
	}

	reqBodyJson, err := json.Marshal(reqBody)
	if err != nil {
		log.Println(err)
		return nil
	}

	req.Body = io.NopCloser(strings.NewReader(string(reqBodyJson)))

	resp, err := httpClient.Do(req)
	if err != nil {
		log.Println(err)
		return nil
	}
	defer resp.Body.Close()
	return resp
}

func sendHfRequest(q_req GenerateRequest) *string {
	// json body
	reqBody := HuggingFaceRequest{
		Inputs: q_req.Prompt,
		Parameters: struct {
			MaxNewTokens int     `json:"max_new_tokens"`
			Temperature  float32 `json:"temperature"`
			TopP         float32 `json:"top_p"`
		}{
			MaxNewTokens: 200,
			Temperature:  0.0,
			TopP:         1.0,
		},
		Options: struct {
			WaitForModel bool `json:"wait_for_model"`
		}{
			WaitForModel: true,
		},
	}

	resp := postJsonReq(MODEL_ENDPOINT, reqBody, true)
	if resp == nil {
		return nil
	}
	// print resp in string
	fmt.Println("resp: ", resp)
	var respBody []map[string]string
	// json unmarshal
	if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
		log.Println(err)
		return nil
	}
	fmt.Println("respBody: ", respBody)
	generated := respBody[0]["generated_text"]
	return &generated
}

func sendLlamaCppRequest(q_req GenerateRequest) *string {
	// json body
	reqBody := LlamaCppRequest{
		Prompt:      q_req.Prompt,
		NPredict:    1024,
		Temperature: 0.0,
	}

	resp := postJsonReq(LLAMACPP_ENDPOINT, reqBody, false)
	if resp == nil {
		return nil
	}
	// print resp in string
	fmt.Println("resp: ", resp)
	resBody, _ := io.ReadAll(resp.Body)
	jsonStr := string(resBody)
	fmt.Println("respBody: ", jsonStr)
	resBytes := []byte(jsonStr)
	var respBody map[string]string
	// json unmarshal
	if err := json.Unmarshal(resBytes, &respBody); err != nil {
		log.Println(err)
		return nil
	}
	fmt.Println("respBody: ", respBody)
	generated := respBody["content"]
	return &generated
}

func generateQueueWorker() {
	handleGenerateRequest := func(q_req GenerateRequest) *GenerateResponse {
		log.Println("Received generate request: ", q_req.Prompt)
		if q_req.Prompt == "" {
			return &GenerateResponse{Generated: ""}
		}
		// check cache
		cache.Lock.RLock()
		if val, ok := cache.Requests[q_req.Prompt]; ok {
			cache.Lock.RUnlock()
			log.Println("Cache hit for: ", q_req.Prompt)
			return val
		}
		cache.Lock.RUnlock()

		var reqRes *string
		if ENGINE == "HF" {
			reqRes = sendHfRequest(q_req)
		} else if ENGINE == "LLAMACPP" {
			reqRes = sendLlamaCppRequest(q_req)
		}
		if reqRes == nil {
			return nil
		}
		generated := *reqRes
		log.Println("Generated: \n", generated)

		res := GenerateResponse{Generated: generated}
		// add to cache
		cache.Lock.Lock()
		cache.Requests[q_req.Prompt] = &res
		cache.Lock.Unlock()
		return &res
	}

	for {
		select {
		case q_req := <-generateQueue:
			q_req.responseQueue <- handleGenerateRequest(q_req.req)
		}
	}
}

func generateEndpoint(c *fiber.Ctx) error {
	var req GenerateRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}
	queue := make(chan *GenerateResponse)
	generateQueue <- GenerateRequestQueued{req: req, responseQueue: queue}
	resp := <-queue
	if resp == nil {
		return c.Status(500).JSON(&fiber.Map{
			"error": "Internal Server Error",
		})
	}
	return c.JSON(resp)
}

func createLogFile() *os.File {
	if _, err := os.Stat("./logs"); os.IsNotExist(err) {
		err := os.Mkdir("./logs", 0755)
		if err != nil {
			log.Fatalf("error creating directory: %v\n", err)
		}
	}

	file, err := os.OpenFile("./logs/reqs.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v\n", err)
	}

	return file
}
