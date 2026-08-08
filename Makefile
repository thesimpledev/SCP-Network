all:
	GOOS=js GOARCH=wasm go build -o dist/main.wasm ./cmd/web
