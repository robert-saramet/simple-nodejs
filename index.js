// Dependencies
const fs = require('fs');
const http = require('http');
const url = require('url');

// Server variables
const port = process.env.PORT || 3001;
const address = process.env.IP || 'localhost';

// Load products from JSON file
const products = fs.readFileSync(`${__dirname}/data/data.json`, 'utf8');
const productsObj = JSON.parse(products);

// Load templates from filesystem
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf8');

// Replace placeholders with actual data
const replaceTemplate = (template, product) => {
    let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%ID%}/g, product.id);

    if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    return output;
}

// Handle requests
const server = http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true);
    const path = pathname;
    
    // Overview page
    if (path === '/' || path === '/overview') {
        res.writeHead(200, { 'Content-Type': 'text/html' });

        const cardsHtml = productsObj.map(product => replaceTemplate(tempCard, product)).join('');
        const output = tempOverview.replace('{%PRODICT_CARDS%}', cardsHtml);
        res.end(output);

    // Product page
    } else if (path === '/product') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const product = productsObj[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.end(output);

    // API page
    } else if (path === '/api') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(products);

    // 404 page
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>Page not found</h1>');
    }

});

// Start server
server.listen(port, address, () => {
    console.log(`Server listening on ${address}:${port}`);
});