import fs from 'fs';
import puppeteer from 'puppeteer';

const rosterStr = fs.readFileSync('data/students-roster.json', 'utf8');
const roster = JSON.parse(rosterStr);
roster.sort((a, b) => a.fullName.localeCompare(b.fullName));
const students = roster.slice(0, 60);
const columns = [[], [], [], []];
students.forEach((student, index) => {
    const colIndex = Math.floor(index / 15);
    if (colIndex < 4) {
        columns[colIndex].push(student.fullName);
    }
});

const unijosLogo = fs.readFileSync('assets/images/logo/unijos logo.png', 'base64');
const napsLogo = fs.readFileSync('assets/images/logo/naps logo.png', 'base64');
const qpLogoStr = fs.readFileSync('public/favicon.svg', 'utf8');
const qpLogoB64 = Buffer.from(qpLogoStr).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flier</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            width: 1400px; height: 1600px;
            background-color: #050505; color: #ffffff; font-family: 'Outfit', sans-serif;
            position: relative; overflow: hidden; display: flex; flex-direction: column;
        }
        .bg-pattern {
            position: absolute; inset: 0;
            background-image: radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 80%); z-index: 1;
        }
        .bg-logo {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 900px; height: 900px; opacity: 0.04; z-index: 2;
        }
        .content {
            position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center;
            height: 100%; padding: 70px 60px;
        }
        .header {
            display: flex; align-items: center; justify-content: space-between; width: 100%;
            padding: 0 40px; margin-bottom: 50px;
        }
        .logo { width: 140px; height: 140px; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(212, 175, 55, 0.2)); }
        .header-text { text-align: center; display: flex; flex-direction: column; gap: 8px; }
        .header-text h3 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 600; color: #D4AF37; letter-spacing: 0.15em; text-transform: uppercase; }
        .header-text h1 { font-size: 38px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase; }
        .header-text h2 { font-size: 28px; font-weight: 500; color: rgba(255, 255, 255, 0.8); letter-spacing: 0.02em; text-transform: uppercase; }
        .main-title { text-align: center; margin-bottom: 60px; }
        .main-title .wishing { font-size: 26px; color: #D4AF37; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
        .main-title .success { font-size: 76px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1; text-shadow: 0 0 40px rgba(212, 175, 55, 0.4); margin-bottom: 12px; text-transform: uppercase; }
        .main-title .exams { font-size: 32px; color: #D4AF37; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; background: linear-gradient(135deg, #F9D423 0%, #FF4E50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .students-grid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; width: 100%;
            background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 32px; padding: 40px; backdrop-filter: blur(20px); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
            margin-bottom: 50px; flex-grow: 1;
        }
        .student-col { display: flex; flex-direction: column; gap: 14px; }
        .student-item { display: flex; align-items: center; gap: 10px; }
        .student-number { width: 26px; height: 26px; background: #D4AF37; color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; flex-shrink: 0; }
        .student-name { font-size: 15px; font-weight: 500; color: rgba(255, 255, 255, 0.95); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; }
        .footer { text-align: center; margin-top: auto; }
        .footer p { font-size: 22px; color: rgba(255, 255, 255, 0.7); font-style: italic; letter-spacing: 0.02em; }
        .footer .strong { color: #D4AF37; font-weight: 600; font-style: normal; }
    </style>
</head>
<body>
    <div class="bg-pattern"></div>
    <img src="data:image/svg+xml;base64,${qpLogoB64}" class="bg-logo" />
    <div class="content">
        <div class="header">
            <img src="data:image/png;base64,${unijosLogo}" class="logo" />
            <div class="header-text">
                <h3>Class of 2024</h3>
                <h1>Department of Physics</h1>
                <h2>University of Jos</h2>
            </div>
            <img src="data:image/png;base64,${napsLogo}" class="logo" />
        </div>
        <div class="main-title">
            <div class="wishing">Wishing You Outstanding</div>
            <div class="success">SUCCESS</div>
            <div class="exams">IN YOUR FINAL EXAMINATIONS</div>
        </div>
        <div class="students-grid">
            ${columns.map((col, colIdx) => `
                <div class="student-col">
                    ${col.map((name, rowIdx) => `
                        <div class="student-item">
                            <div class="student-number">${(colIdx * 15) + rowIdx + 1}</div>
                            <div class="student-name">${name}</div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        <div class="footer">
            <p>Let your potential be the <span class="strong">FORCE</span>. Make us proud!</p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('flier.html', html);

(async () => {
    console.log('Launching puppeteer...');
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--hide-scrollbars']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'public/fliers/exam-success.webp', type: 'webp', quality: 90 });
    
    await browser.close();
    console.log('Done generating flier!');
})();
