// index.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Main endpoint to fetch account data
app.get('/account/:address', async (req, res) => {
    let browser;
    try {
        const { address } = req.params;
        
        console.log(`Fetching data for address: ${address}`);
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto(`https://explorer.burnt.com/xion-mainnet-1/account/${address}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForSelector('#app', { timeout: 5000 });

        // Extract data
        const accountInfo = await page.evaluate(() => {
            return {
                balance: document.querySelector('.balance-info')?.innerText || 'Not found',
                transactions: Array.from(document.querySelectorAll('.transaction-item')).map(tr => ({
                    hash: tr.querySelector('.hash')?.innerText?.trim() || '',
                    amount: tr.querySelector('.amount')?.innerText?.trim() || '',
                    type: tr.querySelector('.type')?.innerText?.trim() || ''
                })),
                delegations: Array.from(document.querySelectorAll('.delegation-item')).map(del => ({
                    validator: del.querySelector('.validator')?.innerText?.trim() || '',
                    amount: del.querySelector('.amount')?.innerText?.trim() || ''
                }))
            };
        });

        accountInfo.address = address;
        accountInfo.lastUpdated = new Date().toISOString();

        console.log('Extracted data:', accountInfo);
        res.json(accountInfo);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to fetch data',
            message: error.message
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

// Add a test endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});