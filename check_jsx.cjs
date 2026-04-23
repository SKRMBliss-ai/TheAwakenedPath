const fs = require('fs');
const content = fs.readFileSync('c:\\Github\\Bliss\\AwakenedPath\\src\\UntetheredSoulApp.tsx', 'utf8');

function checkJSXBalance(str) {
    let lines = str.split('\n');
    let stack = [];
    let inTag = false;
    let currentTag = "";
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        for (let j = 0; j < line.length; j++) {
            let char = line[j];
            
            if (char === '<' && line[j+1] !== ' ' && line[j+1] !== '=' && !line.substring(j).startsWith('<=') && !line.substring(j).startsWith('<-')) {
                // Potential tag start
                if (line.substring(j, j+4) === '<!--') {
                    // Comment, skip to end
                    let end = line.indexOf('-->', j);
                    if (end !== -1) { j = end + 2; continue; }
                }
                
                if (line[j+1] === '/') {
                    // Closing tag
                } else {
                    // Opening tag or self-closing
                }
            }
        }
    }
    // Actually, let's use a simpler approach: search for all tags and check balance.
    const tagRegex = /<(\/?)([a-zA-Z0-9\._-]+)(\b[^>]*?)(\/?)>/g;
    let match;
    let tagStack = [];
    while ((match = tagRegex.exec(str)) !== null) {
        let isClosing = match[1] === '/';
        let tagName = match[2];
        let isSelfClosing = match[4] === '/';
        
        // Skip some common non-tag usages of <
        if (tagName === 'ReturnType') continue;
        if (tagName === 'Record') continue;
        if (tagName === 'Practice') continue; // Wait, Practice could be a type or a component
        
        if (isSelfClosing) continue;
        
        if (isClosing) {
            if (tagStack.length === 0) {
                console.log(`Unexpected closing tag </${tagName}> at line ${getLine(str, match.index)}`);
                // return; // Continue to see more
            } else {
                let top = tagStack.pop();
                if (top.name !== tagName) {
                    console.log(`Mismatched tag </${tagName}> at line ${getLine(str, match.index)}, expected </${top.name}> from line ${top.line}`);
                    // return;
                }
            }
        } else {
            tagStack.push({name: tagName, line: getLine(str, match.index)});
        }
    }
    
    if (tagStack.length > 0) {
        tagStack.forEach(t => console.log(`Unclosed tag <${t.name}> from line ${t.line}`));
    } else {
        console.log('All JSX tags are balanced!');
    }
}

function getLine(str, index) {
    return str.substring(0, index).split('\n').length;
}

checkJSXBalance(content);
