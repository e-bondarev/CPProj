const files = require('./files');

module.exports = {
    fromDir: function(root, context, html, script, style, scripts = []) {
        const layoutPath = `${root}/${context}/${html}`;
        const scriptPath = `${root}/${context}/${script}`;
        const stylePath  = `${root}/${context}/${style}`;
    
        let htmlContent = files.readFile(layoutPath).toString();
        const scriptContent = files.readFile(scriptPath).toString();
        const styleContent = files.readFile(stylePath).toString();
    
        htmlContent = htmlContent.split('</head>').join(`<style>${styleContent}</style> </head>`);

        for (var i = 0; i < scripts.length; i++)
        {
            const vue = files.readFile(`${root}/${scripts[i]}`);            
            htmlContent = htmlContent.split('</head>').join(`<script>${vue}</script> </head>`);
        }

        htmlContent = htmlContent.split('</body>').join(`<script>${scriptContent}</script> </body>`);
    
        return htmlContent;
    }
};