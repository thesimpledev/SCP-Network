package main

import (
	"fmt"

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

func (r *application) Render() app.UI {
	return app.Div().Class("terminal-container").Body(
		app.Div().Class("terminal-header").Text("SCP Foundation Terminal"),
		app.Div().Class("terminal-content").Body(
			r.renderTerminalScreen(),
		),
		app.Div().Class("post-it").Body(
			app.P().Text(fmt.Sprintf("Username: %s", r.correctUserName)),
			app.P().Text(fmt.Sprintf("Password: %s", r.correctPassword)),
		),
	)
}

func (r *Root) renderTerminalScreen() app.UI {

}

func main() {
	app.Route("/", func() app.Composer { return &application{} })
	app.RunWhenOnBrowser()
}
