document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const result = document.getElementById('result');
    const hexagramNumber = document.getElementById('hexagram-number');
    const changingLines = document.getElementById('changing-lines');
    const readingContent = document.getElementById('reading-content');
    const divProcess = document.getElementById('divination-process');
    const processSteps = document.querySelectorAll('.process-step');
    const hexagramLines = document.getElementById('hexagram-lines');

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function createHexagramLine(isYang, isChanging) {
        const line = document.createElement('div');
        line.className = `line ${isYang ? 'yang' : 'yin'} ${isChanging ? 'changing' : ''}`;
        return line;
    }

    function updateProcessStep(stepIndex) {
        processSteps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
    }

    async function animateProcess() {
        divProcess.classList.remove('hidden');
        result.classList.add('hidden');

        // Animate through each step
        for (let i = 0; i < processSteps.length; i++) {
            updateProcessStep(i);
            await sleep(1000); // Wait 1 second between steps
        }
    }

    function displayHexagram(lines, changingLineNumbers) {
        hexagramLines.innerHTML = '';
        
        // Create lines from top to bottom
        for (let i = 5; i >= 0; i--) {
            const isYang = lines[i] === 1;
            const isChanging = changingLineNumbers.includes(i + 1);
            const line = createHexagramLine(isYang, isChanging);
            hexagramLines.appendChild(line);
        }
    }

    generateBtn.addEventListener('click', async () => {
        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Consulting the Oracle...';
            
            // Start the process animation
            await animateProcess();
            
            const response = await fetch('/reading', {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate reading');
            }
            
            const data = await response.json();
            
            // Update hexagram number
            hexagramNumber.textContent = data.hexagram_number;
            
            // Display changing lines
            if (data.changing_lines.length > 0) {
                changingLines.textContent = `Changing lines: ${data.changing_lines.join(', ')}`;
            } else {
                changingLines.textContent = 'No changing lines';
            }
            
            // Display hexagram
            displayHexagram(data.lines, data.changing_lines);
            
            // Update reading text
            readingContent.textContent = data.reading;
            
            // Show result
            divProcess.classList.add('hidden');
            result.classList.remove('hidden');
            
            // Smooth scroll to result
            result.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate reading. Please try again.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Begin New Divination';
        }
    });
}); 