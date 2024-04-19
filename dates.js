import fs from 'fs';

// Define an array of month abbreviations

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const currentDay = currentDate.getDate();

// Start year for the loop

const startYear = 1998;

// Array to store generated dates
let dates = [];

// Loop through each year and month
for (let year = startYear; year <= currentYear; year++) {
    const endMonth = year === currentYear ? currentMonth : 11; // If it's the current year, loop until the current month, otherwise loop through all 12 months
    for (let monthIndex = 0; monthIndex <= endMonth; monthIndex++) {
        const month = months[monthIndex];
        const daysInMonth = monthIndex === 1 && isLeapYear(year) ? 29 : new Date(year, monthIndex + 1, 0).getDate();

        // Generate dates for each day of the month
        const endDay = (year === currentYear && monthIndex === currentMonth) ? currentDay : daysInMonth; // If it's the current month, loop until the current day, otherwise loop through all days
        for (let day = 1; day <= endDay; day++) {
            const dateString = `${year}-${month}-${day}`;
            dates.push(dateString);
        }
    }
}

// Function to check if a year is a leap year
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Convert dates array to an array of URLs
let urls = [];
dates.forEach(dateString => {
    urls.push(`https://allquakes.com/earthquakes/archive/${dateString}/showMore.html`);
});

// Write the generated URLs to a JSON file
fs.writeFile('generated_links.json', JSON.stringify({ "links": urls }, null, 2), err => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('Links have been generated and saved to generated_links.json');
    }
});
