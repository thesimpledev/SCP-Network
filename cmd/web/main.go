package main

import (
	"github.com/maxence-charriere/go-app/v10/pkg/app"
)

type applicationStep int

const (
	loginStep applicationStep = iota
	passwordStep
	terminalStep
)

type application struct {
	app.Compo

	step        applicationStep
	userInput   string
	outputLines []string

	correctUserName string
	correctPassword string

	loading        bool
	loadingMessage string
}

func (r *application) OnMount(ctx app.Context) {
	r.correctUserName = "aclef"
	r.correctPassword = "container"
	r.step = loginStep
	r.outputLines = []string{}
}

func (h *application) Render() app.UI {
	return app.H1().Text("Hello, World! How are you doing today?")
}

func main() {
	app.Route("/", func() app.Composer { return &application{} })
	app.RunWhenOnBrowser()
}
