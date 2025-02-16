package main

import (
	"fmt"

	"github.com/maxence-charriere/go-app/v10/pkg/app"
)

// applicationStep is our "enum" for the login flow & terminal screen
type applicationStep int

const (
	loginStep applicationStep = iota
	passwordStep
	terminalStep
)

type application struct {
	app.Compo // Embed app.Compo for lifecycle methods

	step        applicationStep
	userInput   string
	outputLines []string

	correctUserName string
	correctPassword string

	loading        bool
	loadingMessage string
}

// OnMount is called once the component is first attached to the DOM.
// If your go-app version does not accept (ctx app.Context) here, remove it.
func (r *application) OnMount(ctx app.Context) {
	r.correctUserName = "aclef"
	r.correctPassword = "container"
	r.step = loginStep
	r.outputLines = []string{}
}

// Render defines how to draw the component
func (r *application) Render() app.UI {
	return app.Div().Class("terminal").Body(
		app.Div().Class("terminal-header").Text("SCP Foundation Terminal"),
		app.Div().Class("terminal-content").Body(
			r.renderTerminalScreen(),
		),
		// The "post-it" credentials area
		app.Div().Class("post-it").Body(
			app.P().Text(fmt.Sprintf("Username: %s", r.correctUserName)),
			app.P().Text(fmt.Sprintf("Password: %s", r.correctPassword)),
		),
	)
}

func (r *application) renderTerminalScreen() app.UI {
	switch r.step {
	case loginStep:
		return r.renderUserNamePrompt()
	case passwordStep:
		return r.renderPasswordPrompt()
	default:
		return r.renderMainTerminal()
	}
}

func (r *application) renderUserNamePrompt() app.UI {
	return app.Div().Class("input-line").Body(
		app.Div().Class("output").Body(
			app.Range(r.outputLines).Slice(func(i int) app.UI {
				return app.P().Text(r.outputLines[i])
			}),
		),
		app.P().Text("Username:"),
		app.Input().
			Class("terminal-input").
			Value(r.userInput).
			AutoFocus(true).
			// onInputChange & onKeyDown below
			OnChange(r.onInputChange).
			OnKeyDown(r.onKeyDown),
	)
}

func (r *application) renderPasswordPrompt() app.UI {
	return app.Div().Body(
		app.Div().Body(
			app.Range(r.outputLines).Slice(func(i int) app.UI {
				return app.P().Text(r.outputLines[i])
			}),
		),
		app.P().Text("Password:"),
		app.Input().
			Class("terminal-input").
			Type("password").
			Value(r.userInput).
			AutoFocus(true).
			OnChange(r.onInputChange).
			OnKeyDown(r.onKeyDown),
	)
}

func (r *application) renderMainTerminal() app.UI {
	if r.loading {
		// If in loading state, show existing output plus loading message
		return app.Div().Body(
			app.Range(r.outputLines).Slice(func(i int) app.UI {
				return app.P().Text(r.outputLines[i])
			}),
			app.P().Text(r.loadingMessage),
		)
	}

	// Otherwise show normal terminal
	return app.Div().Body(
		// Prior output
		app.Range(r.outputLines).Slice(func(i int) app.UI {
			return app.P().Text(r.outputLines[i])
		}),
		// Prompt + input
		app.Span().Text("scp> "),
		app.Input().
			Class("terminal-input").
			Value(r.userInput).
			AutoFocus(true).
			OnChange(r.onInputChange).
			OnKeyDown(r.onKeyDown),
	)
}

// --- Event Handlers ---

func (r *application) onInputChange(ctx app.Context, e app.Event) {
	val := e.Value.Get("value").String()
	ctx.Dispatch(func(ctx app.Context) {
		r.userInput = val
	})
}

func (r *application) onKeyDown(ctx app.Context, e app.Event) {
	// We get the pressed key from the underlying JS event
	key := e.JSValue().Get("key").String()
	if key == "Enter" {
		switch r.step {
		case loginStep:
			r.processUsername(ctx)
		case passwordStep:
			r.processPassword(ctx)
		default:
			r.processTerminalCommand(ctx)
		}
	}
}

// --- Logic: Username/Password ---

func (r *application) processUsername(ctx app.Context) {
	if r.userInput == r.correctUserName {
		r.step = passwordStep
		r.userInput = ""
	} else {
		r.outputLines = append(r.outputLines, "Error: Incorrect username. Try again.")
	}
	ctx.Dispatch(func(ctx app.Context) {
		// State has been updated; this will trigger a re-render
	})
}

func (r *application) processPassword(ctx app.Context) {
	ctx.Dispatch(func(ctx app.Context) {
		if r.userInput == r.correctPassword {
			r.step = terminalStep
			r.outputLines = append(r.outputLines, "Welcome!")
			r.userInput = ""
		} else {
			r.outputLines = append(r.outputLines, "Error: Incorrect password. Try again.")
		}
	})
}

// --- Logic: Terminal Commands ---

func (r *application) processTerminalCommand(ctx app.Context) {
	cmd := r.userInput

	ctx.Dispatch(func(ctx app.Context) {
		// Echo the command
		r.outputLines = append(r.outputLines, fmt.Sprintf("scp> %s", cmd))
		r.userInput = ""
	})

	if cmd == "Tell me about SCP 298" {
		ctx.Dispatch(func(ctx app.Context) {
			r.loading = true
			r.loadingMessage = "SCP> Accessing Data: Please Wait"
		})

		// Simulate a 2-second delay using JavaScript's setTimeout
		app.Window().Call("setTimeout", app.FuncOf(func(this app.Value, args []app.Value) interface{} {
			ctx.Dispatch(func(ctx app.Context) {
				r.outputLines = append(r.outputLines,
					"● O5 File Access Acknowledged...",
					"Item #: SCP-298",
					"Object Class: Safe",
					"",
					"Special Containment Procedures:",
					"...(Your full text here)...",
				)
				r.loading = false
			})
			return nil
		}), 2000)
	} else {
		ctx.Dispatch(func(ctx app.Context) {
			r.outputLines = append(r.outputLines, "Command not recognized...")
		})
	}
}

// --- Main Entry Point ---

func main() {
	// Route root path to our "application" component
	app.Route("/", func() app.Composer { return &application{} })
	app.RunWhenOnBrowser()

	// That’s it. No local server needed if deploying to S3 as WASM.
}
