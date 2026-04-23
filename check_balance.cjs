const fs = require('fs');
const content = fs.readFileSync('c:\\Github\\Bliss\\AwakenedPath\\src\\UntetheredSoulApp.tsx', 'utf8');

function checkBalanced(str) {
    let stack = [];
    let lines = str.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        for (let j = 0; j < line.length; j++) {
            let char = line[j];
            if (char === '{' || char === '[' || char === '(') {
                stack.push({char, line: i + 1, col: j + 1});
            } else if (char === '}' || char === ']' || char === ')') {
                if (stack.length === 0) {
                    console.log(`Unexpected ${char} at line ${i + 1}, col ${j + 1}`);
                    return;
                }
                let top = stack.pop();
                if ((char === '}' && top.char !== '{') ||
                    (char === ']' && top.char !== '[') ||
                    (char === ')' && top.char !== '(')) {
                    console.log(`Mismatched ${char} at line ${i + 1}, col ${j + 1} (expected closing for ${top.char} from line ${top.line}, col ${top.col})`);
                    return;
                }
            }
        }
    }
    if (stack.length > 0) {
        let top = stack.pop();
        console.log(`Unclosed ${top.char} from line ${top.line}, col ${top.col}`);
    } else {
        console.log('All brackets/braces are balanced!');
    }
}

checkBalanced(content);
