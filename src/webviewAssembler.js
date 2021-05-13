const files = require('./files');

module.exports = {
    fromDir: function(context, html, script, style, scripts = []) {
        const layoutPath = `${context}/${html}`;
        const scriptPath = `${context}/${script}`;
        const stylePath  = `${context}/${style}`;
    
        let htmlContent = files.readFile(layoutPath).toString();
        const scriptContent = files.readFile(scriptPath).toString();
        const styleContent = files.readFile(stylePath).toString();
    
        htmlContent = htmlContent.split('</head>').join(`<style>${styleContent}</style> </head>`);

        for (var i = 0; i < scripts.length; i++)
        {
            const vue = files.readFile(`${context}/${scripts[i]}`);            
            htmlContent = htmlContent.split('</head>').join(`<script>${vue}</script> </head>`);
        }

        htmlContent = htmlContent.split('</body>').join(`<script>${scriptContent}</script> </body>`);
    
        return htmlContent;
    }
};