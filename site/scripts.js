document.addEventListener('DOMContentLoaded', () => {
    localStorage.clear();
    const terminalInput = document.querySelector('.terminal-input');
    const outputDiv = document.querySelector('.output');
    let accumulatedInput = "";
    const FAUX_USERNAME = 'aclef';
    const FAUX_PASSWORD = 'container';
    const postItUsername = document.querySelector('.post-it p:nth-child(1)');
    const postItPassword = document.querySelector('.post-it p:nth-child(2)');

    postItUsername.innerHTML = `<strong>Username:</strong> ${FAUX_USERNAME}`;
    postItPassword.innerHTML = `<strong>Password:</strong> ${FAUX_PASSWORD}`;

    let loginState = 'username';  // Possible values: 'username', 'password', 'authenticated'


    function startLoadingAnimation() {
        let count = 0;
        const loadingInterval = setInterval(() => {
            count++;
            let dots = Array(count % 4).fill().map((_, i) => '.').join('');
            terminalInput.value = `Accessing Data: Please Wait${dots}`;
        }, 500); // every half second update dots
        return loadingInterval;
    }

    async function sendConversationToServer() {
        const conversation = JSON.parse(localStorage.getItem('conversation') || '[]');
        try {
            const response = await fetch('https://3enuvpqp3l.execute-api.us-east-2.amazonaws.com/alpha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ conversation: conversation })
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


    document.querySelector('.prompt').textContent = 'Username:';  // Set initial prompt

terminalInput.addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();

        // Handle the username input
        if (loginState === 'username') {
            if (terminalInput.value === FAUX_USERNAME) {
                accumulatedInput = ""
                terminalInput.value = '';
                document.querySelector('.prompt').textContent = 'Password:';
                loginState = 'password';
            } else {
                terminalInput.value = '';
                outputDiv.innerHTML += `<p>Error: Incorrect username. Try again.</p>`;
            }

        // Handle the password input
        } else if (loginState === 'password') {
            if (terminalInput.value === FAUX_PASSWORD) {
                terminalInput.value = '';
                outputDiv.innerHTML += `<p>Welcome ${accumulatedInput}!</p>`;
                document.querySelector('.prompt').textContent = 'scp>';
                loginState = 'authenticated';
            } else {
                terminalInput.value = '';
                accumulatedInput = '';  // Clear the previously stored username
                outputDiv.innerHTML += `<p>Error: Incorrect password. Try again.</p>`;
                document.querySelector('.prompt').textContent = 'Username:';
                loginState = 'username';
            }

        // Handle command input (once authenticated)
        } else if (loginState === 'authenticated') {
            accumulatedInput += terminalInput.value;
             // Store user input in localStorage
            let conversation = JSON.parse(localStorage.getItem('conversation') || '[]');
            conversation.push({ type: 'user', message: accumulatedInput });
            localStorage.setItem('conversation', JSON.stringify(conversation));
            
            // Check if the command exists in our custom commands
            if (commandFunctions[accumulatedInput.trim().toLowerCase()]) {
                commandFunctions[accumulatedInput.trim().toLowerCase()]();
                return;  // Exit early, don't send the command to the server
            }
    
            outputDiv.innerHTML += `<p>scp&gt; ${marked.parse(accumulatedInput).replace(/<p>|<\/p>/g, '')}</p>`;
            
            const loadingInterval = startLoadingAnimation();
            const serverResponse = await sendConversationToServer();
    
            clearInterval(loadingInterval);
            terminalInput.value = '';
    
            if (serverResponse.error) {
                outputDiv.innerHTML += `<p>Error: ${serverResponse.error}</p>`;
                
                // Store error response in localStorage
                conversation = JSON.parse(localStorage.getItem('conversation') || '[]');
                conversation.push({ type: 'assistant', message: `Error: ${serverResponse.error}` });
                localStorage.setItem('conversation', JSON.stringify(conversation));
    
            } else {
                outputDiv.innerHTML += marked.parse(serverResponse.message);
    
                // Store server response in localStorage
                conversation = JSON.parse(localStorage.getItem('conversation') || '[]');
                conversation.push({ type: 'assistant', message: serverResponse.message });
                localStorage.setItem('conversation', JSON.stringify(conversation));
            }
    
            accumulatedInput = "";
        }
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
