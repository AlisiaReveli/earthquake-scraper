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

// Extract the loadMoreUrl from the script
        const loadMoreUrl = await page.evaluate(() => qTableMain.loadMoreUrl);

// Navigate to the loadMoreUrl outside of page.evaluate()
        await page.goto(loadMoreUrl, {
            waitUntil: "domcontentloaded",
        });

// Scrape the data
        const earthquakeData = await page.evaluate(() => {
            const earthquakes = [];
            const earthquakeElements = document.querySelectorAll('body > div');
            earthquakeElements.forEach(entry => {
                const datetimeElement = entry.querySelector('.aStr');
                const magnitudeElement = entry.querySelector('.magCircle');
                const countryElement = entry.querySelector('img');

                // Check if all required elements exist
                if (datetimeElement && magnitudeElement && countryElement) {
                    const datetime = datetimeElement.innerText.match(/\w{3} \d{1,2}, \d{4} \d{1,2}:\d{2} (am|pm) \([\w\s]+\)/);
                    const magnitude = magnitudeElement.innerText;
                    const depth = entry.innerText.match(/\d+\.\d+\s?km/);
                    const location = entry.innerText.match(/(?<=\d+\.\d+\s?km).+(?=\s*<div class="actionBtn")/);
                    const country = countryElement.title;

                    earthquakeData.push({
                        datetime: datetime ? datetime[0] : null,
                        magnitude: magnitude ? magnitude : null,
                        depth: depth ? depth[0] : null,
                        location: location ? location[0].trim() : null,
                        country: country ? country : null
                    });
                } else {
                    console.error('One or more required elements not found for an earthquake entry:', entry);
                }
            });

            return earthquakes;
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
