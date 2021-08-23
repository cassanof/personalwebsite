package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

const (
	STATIC_PATH = "./frontend/dist/"
)

var app *fiber.App = fiber.New(fiber.Config{
	Prefork:       true,
	CaseSensitive: true,
	StrictRouting: true,
	GETOnly:       true, // to change if I want to create a dynamic website.
	AppName:       "Federico's Personal Website",
})

func main() {
	app.Static("/", STATIC_PATH)

	file := createLogFile()
	defer file.Close()

	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path} | ${ip} ${referer} - ${reqHeader:User-Agent}\n",
		Output: file,
	}))

	// 404 Handler
	app.Use(func(c *fiber.Ctx) error {
		return c.SendFile(STATIC_PATH+"404.html", false)
	})

	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	app.Use(recover.New())

	app.Listen(":5000")
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
