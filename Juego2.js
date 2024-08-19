// Definir listas de palabras
const shortWords = ["sol", "luz", "mar", "pan", "ave", "casa", "lago", "pez", "ola", "roca"];
const mediumWords = ["camino", "árbol", "montaña", "cielo", "playa", "nube", "flor", "viento", "piedra", "río"];
const longWords = ["mariposa", "bicicleta", "oceánico", "montañoso", "caminante", "universo", "constelación", "terremoto", "tranquilidad", "naturaleza"];

// Función para seleccionar palabras al azar
function getRandomWords(wordList, count) {
    return wordList.sort(() => Math.random() - 0.5).slice(0, count);
}

// Seleccionar palabras de cada lista
let words = [
    ...getRandomWords(shortWords, 3),  // 3 palabras cortas
    ...getRandomWords(mediumWords, 3), // 3 palabras medianas
    ...getRandomWords(longWords, 3)    // 3 palabras largas
];

let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
const sopaSize = 15;
let sopa = [];
let selectedCells = [];
let isDragging = false; // Variable para controlar el arrastre
let startCell = null; // Para almacenar la celda inicial del arrastre

// Crear la sopa de letras
function createSopa() {
    sopa = Array.from({ length: sopaSize }, () => Array.from({ length: sopaSize }, () => ""));

    words.forEach(word => {
        let placed = false;
        while (!placed) {
            let direction = Math.floor(Math.random() * 4); // 0 = horizontal, 1 = vertical, 2 = diagonal, 3 = diagonal invertida
            let row = Math.floor(Math.random() * sopaSize);
            let col = Math.floor(Math.random() * sopaSize);
            let rowIncrement = direction === 1 ? 1 : direction === 2 ? 1 : 0;
            let colIncrement = direction === 0 ? 1 : direction === 2 ? 1 : direction === 3 ? -1 : 0;

            if (canPlaceWord(word, row, col, rowIncrement, colIncrement)) {
                for (let i = 0; i < word.length; i++) {
                    sopa[row + i * rowIncrement][col + i * colIncrement] = word[i].toUpperCase();
                }
                placed = true;
            }
        }
    });

    // Llenar las celdas vacías con letras aleatorias
    sopa.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === "") {
                sopa[rowIndex][colIndex] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        });
    });
}

// Verificar si se puede colocar una palabra
function canPlaceWord(word, row, col, rowIncrement, colIncrement) {
    for (let i = 0; i < word.length; i++) {
        let newRow = row + i * rowIncrement;
        let newCol = col + i * colIncrement;

        // Verificar límites y si la celda está ocupada
        if (newRow >= sopaSize || newCol >= sopaSize || newRow < 0 || newCol < 0 || (sopa[newRow][newCol] !== "" && sopa[newRow][newCol] !== word[i].toUpperCase())) {
            return false;
        }
    }
    return true;
}

// Renderizar la sopa de letras
function renderSopa() {
    const sopaContainer = document.getElementById("sopa-de-letras");
    sopaContainer.innerHTML = sopa.map((row, rowIndex) =>
        row.map((letter, colIndex) =>
            `<div data-row="${rowIndex}" data-col="${colIndex}">${letter}</div>`
        ).join('')
    ).join('');

    // Añadir eventos a las celdas
    sopaContainer.querySelectorAll('div').forEach(cell => {
        cell.addEventListener("click", () => selectCell(cell));
    });
}

// Renderizar la lista de palabras
function renderWordList() {
    const wordListContainer = document.getElementById("word-list");
    wordListContainer.innerHTML = '<h3>Palabras a encontrar:</h3>' +
        words.map(word => `<p>${word.toUpperCase()}</p>`).join('');
}

// Seleccionar una celda
function selectCell(cell) {
    if (cell.classList.contains("found")) return;

    const { row, col } = cell.dataset;
    if (selectedCells.length > 0) {
        const lastCell = selectedCells[selectedCells.length - 1];
        if (!areCellsAdjacent(lastCell.row, lastCell.col, parseInt(row), parseInt(col))) {
            clearSelection();
            return;
        }
    }

    cell.classList.add("selected");
    selectedCells.push({ row: parseInt(row), col: parseInt(col), letter: cell.innerText, element: cell });

    checkSelectedWord();
}

// Verificar si las celdas son adyacentes
function areCellsAdjacent(row1, col1, row2, col2) {
    return (Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1);
}

// Verificar la palabra seleccionada
function checkSelectedWord() {
    let selectedWord = selectedCells.map(cell => cell.letter).join('');
    let reversedWord = selectedWord.split('').reverse().join('');

    if (words.includes(selectedWord.toLowerCase()) || words.includes(reversedWord.toLowerCase())) {
        selectedCells.forEach(cell => {
            cell.element.classList.add("found");
            cell.element.classList.remove("selected");
        });
        score += 10;
        localStorage.setItem('score', score);
        updateScore();
        selectedCells = [];
        checkWinCondition();
    } else if (selectedWord.length > Math.max(...words.map(word => word.length))) {
        clearSelection();
    }
}

// Limpiar la selección de celdas
function clearSelection() {
    selectedCells.forEach(cell => cell.element.classList.remove("selected"));
    selectedCells = [];
}

// Verificar si se ha ganado
function checkWinCondition() {
    const totalLettersInWords = words.join('').length;
    const foundCells = document.querySelectorAll("#sopa-de-letras div.found").length;
    if (foundCells === totalLettersInWords) {
        alert("¡Felicidades, has encontrado todas las palabras!");
    }
}

// Actualizar la puntuación
function updateScore() {
    document.getElementById("score").innerText = `Puntuación: ${score}`;
}

// Reiniciar el juego
function resetGame() {
    score = 0;
    localStorage.setItem('score', score);
    selectedCells = [];
    words = [
        ...getRandomWords(shortWords, 3),
        ...getRandomWords(mediumWords, 3),
        ...getRandomWords(longWords, 3)
    ];
    init();
}

// Inicializar el juego
function init() {
    createSopa();
    renderSopa();
    renderWordList();
    updateScore();
}

init();
