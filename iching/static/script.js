function generateHexagram() {
    let lines = [];
    for (let i = 0; i < 6; i++) {
        let line = Math.random() < 0.5 ? 0 : 1;
        lines.push(line);
    }
    return lines;
}

function calculateHexagramNumber(hexagram) {
    let binaryString = "";
    for (let i = hexagram.length - 1; i >= 0; i--) {
        binaryString += hexagram[i].toString();
    }
    return parseInt(binaryString, 2) + 1;
}

function getChangingLines(lines) {
    return lines.map((line, index) => (line === 0 || line === 1) ? index + 1 : null).filter(Number.isInteger);
}

function displayHexagram(lines, changingLines) {
    const hexagramDiv = document.getElementById('hexagram');
    if (!hexagramDiv) {
        console.error('Hexagram div not found');
        return;
    }
    hexagramDiv.innerHTML = '';

    lines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.classList.add('line');

        if (line === 1) {
            lineDiv.classList.add('yang');
        } else {
            lineDiv.classList.add('yin');
        }

        if (changingLines.includes(index + 1)) {
            lineDiv.classList.add('changing');
        }

        hexagramDiv.appendChild(lineDiv);
    });
}

function displayReading(hexagramData) {
    const readingDiv = document.getElementById('reading');
    if (!readingDiv) {
        console.error('Reading div not found');
        return;
    }
    
    if (!hexagramData || !hexagramData.reading) {
        readingDiv.innerHTML = "No reading could be generated";
        return;
    }

    const reading = hexagramData.reading;
    const relatingHexagram = hexagramData.relating_hexagram;

    let resultText = `
        <h2>${reading.name} (${reading.chinese} - ${hexagramData.hexagram_number})</h2>
        <p>${reading.description}</p>
        <p><b>Judgment:</b> ${reading.judgment}</p>
        <p><b>Image:</b> ${reading.image}</p>
    `;

    if (hexagramData.changing_lines.length > 0) {
        resultText += "<h3>Changing Lines:</h3>";
        for (const lineNumber in reading.lines) {
            resultText += `<p><b>Line ${lineNumber}:</b> ${reading.lines[lineNumber]}</p>`;
        }

        if (relatingHexagram) {
            resultText += `
                <h3>Relating Hexagram:</h3>
                <h2>${relatingHexagram.name} (${relatingHexagram.chinese} - ${relatingHexagram.number})</h2>
                <p>${relatingHexagram.description}</p>
            `;
        }
    }

    readingDiv.innerHTML = resultText;
}

async function generateReading() {
    const hexagram = generateHexagram();
    const changingLines = getChangingLines(hexagram);
    displayHexagram(hexagram, changingLines);

    try {
        const response = await fetch('/reading', { method: 'POST' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.detail}`);
        }
        const readingData = await response.json();
        displayReading(readingData);
    } catch (error) {
        displayReading(null);
        console.error("Error fetching reading:", error);
        alert(error.message);
    }
} 