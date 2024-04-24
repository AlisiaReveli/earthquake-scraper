import puppeteer from "puppeteer";
import fs from 'fs';
import {execSync} from 'child_process';

const jsonFilePath = 'generated_links.json';

const generateDatesAndLinks = () => {
    console.log('Generating dates and links...');
    try {
        // Execute dates.js to generate the links JSON file
        execSync('node dates.js');
        console.log('Dates and links generated successfully.');
    } catch (error) {
        console.error('Error generating dates and links:', error);
    }
};

const getData = async () => {
    // Check if the JSON file exists
    if (!fs.existsSync(jsonFilePath)) {
        generateDatesAndLinks();
    }

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    try {
        // Read the generated URLs from the JSON file
        const linksJSON = fs.readFileSync(jsonFilePath);
        const links = JSON.parse(linksJSON).links;
        // Scrape data from the first URL only
        const url = links[0];

        await page.goto(url, {
            waitUntil: "domcontentloaded",
        });


        const loadMoreUrl = await page.evaluate(() => qTableMain.loadMoreUrl);

        console.log('Load more URL:', loadMoreUrl);
        await page.goto(loadMoreUrl, {
            waitUntil: "domcontentloaded",
        });

        const earthquakeData = await page.evaluate(() => {


            return ['test'];
        });

        console.log('Scraped data:', earthquakeData);
        console.log('Scraping completed.', earthquakeData.length);


    } catch (error) {
        console.error('Error reading or scraping:', error);
    } finally {
        await browser.close();
    }
};

// Start the scraping
getData();
