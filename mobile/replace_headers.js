const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') || filePath.includes('home.tsx') || filePath.includes('login.tsx') || filePath.includes('register.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    const headerRegex = /<LinearGradient\s+colors=\{theme\.gradientPrimary\}\s+style=\{styles\.header\}>([\s\S]*?)<\/LinearGradient>/;
    
    if (headerRegex.test(content)) {
        console.log('Processing: ' + filePath);
        
        const parts = filePath.split(path.sep);
        const appIndex = parts.indexOf('app');
        const depth = parts.length - appIndex - 1;
        const relativePath = '../'.repeat(depth) + 'assets/bgimage.jpg';
        
        if (!content.includes('ImageBackground')) {
            content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]react-native['"];/, (match, p1) => {
                if (!p1.includes('ImageBackground')) {
                    return `import { ${p1.trim()}, ImageBackground } from 'react-native';`;
                }
                return match;
            });
        }
        
        content = content.replace(
            headerRegex,
            `<ImageBackground source={require('${relativePath}')} style={styles.header} resizeMode="cover">\n        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,20,50,0.72)' }} pointerEvents="none" />$1</ImageBackground>`
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        fs.statSync(dirPath).isDirectory() ? walkDir(dirPath) : processFile(dirPath);
    });
}

walkDir('c:\\Users\\Device Hospi-Tsech\\Desktop\\CamerBus\\mobile\\app');
console.log('Done');
