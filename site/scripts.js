document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.querySelector('.terminal-input');
    const outputDiv = document.querySelector('.output');
    let accumulatedInput = "";

    function startLoadingAnimation() {
        let count = 0;
        const loadingInterval = setInterval(() => {
            count++;
            let dots = Array(count % 4).fill().map((_, i) => '.').join('');
            terminalInput.value = `Accessing Data: Please Wait${dots}`;
        }, 500); // every half second update dots
        return loadingInterval;
    }

    async function sendCommandToServer(command) {
        try {
            const response = await fetch('https://3enuvpqp3l.execute-api.us-east-2.amazonaws.com/alpha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command: command })
            });

            if (!response.ok) {
                console.log(response);
                throw new Error(`HTTP error! Status: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error.message);
            return { error: error.message };
        }
    }

    function clear() {
        outputDiv.innerHTML = '';
        terminalInput.value = '';
        accumulatedInput = '';
    }

    // If you want to add more commands in the future, you'd:
    // 1. Write its function.
    // 2. Add its name and corresponding function to this object.
    const commandFunctions = {
        clear: clear,
        ls: ls
        // anotherCommand: anotherCommandFunction
    };


    terminalInput.addEventListener('keydown', async function(e) {
        if (e.key === 'Enter' && e.shiftKey) {
            accumulatedInput += terminalInput.value + '\n';
            terminalInput.value = '';
        } else if (e.key === 'Enter') {
            e.preventDefault();
            accumulatedInput += terminalInput.value;
            
            // Check if the command exists in our custom commands
            if (commandFunctions[accumulatedInput.trim().toLowerCase()]) {
                commandFunctions[accumulatedInput.trim().toLowerCase()]();
                return;  // Exit early, don't send the command to the server
            }
    
            outputDiv.innerHTML += `<p>scp&gt; ${marked.parse(accumulatedInput).replace(/<p>|<\/p>/g, '')}</p>`;
            
            const loadingInterval = startLoadingAnimation();
            const serverResponse = await sendCommandToServer(accumulatedInput);
    
            clearInterval(loadingInterval);
            terminalInput.value = '';
    
            if (serverResponse.error) {
                outputDiv.innerHTML += `<p>Error: ${serverResponse.error}</p>`;
            } else {
                outputDiv.innerHTML += marked.parse(serverResponse.message);
            }
    
            accumulatedInput = "";
        }
    });

    async function ls() {
        const mockFiles = [
            'file1.txt',
            'file2.log',
            'image.jpg',
            'script.sh',
            'document.pdf',
            'folder1/',
            'folder2/',
            'folder3/'
        ];
    
        const output = mockFiles.join('    '); // Files and folders are separated by spaces for presentation
        await printToScreen(`<p>scp&gt; ${output}</p>`);
    }
});
