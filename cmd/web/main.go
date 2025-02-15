package main

import (
	"github.com/maxence-charriere/go-app/v10/pkg/app"
)

type hello struct {
	app.Compo
}

func (h *hello) Render() app.UI {
	return app.H1().Text("Hello, World! How are you doing today?")
}

func main() {
	app.Route("/", func() app.Composer { return &hello{} })
	app.RunWhenOnBrowser()
}
