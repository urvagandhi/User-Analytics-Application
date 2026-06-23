/*
// seed.js
// Run this script using: node seed.js
// Make sure your backend server is running (usually on port 5000)

const BACKEND_URL = 'http://localhost:5000/api/events/batch';

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

const pages = [
  'http://localhost:3000/',
  'http://localhost:3000/pricing',
  'http://localhost:3000/docs'
];

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Key UI components (coordinates) where clicks concentrate
const pageTargetClusters = {
  'http://localhost:3000/': [
    { name: 'Hero CTA Button', xPct: 50, yPct: 45, probability: 0.7 },
    { name: 'Get Started Nav Button', xPct: 85, yPct: 8, probability: 0.5 },
    { name: 'Features Link', xPct: 20, yPct: 8, probability: 0.4 },
    { name: 'Feature Card 2', xPct: 50, yPct: 75, probability: 0.3 }
  ],
  'http://localhost:3000/pricing': [
    { name: 'Growth Tier Select', xPct: 50, yPct: 40, probability: 0.7 },
    { name: 'Free Tier Select', xPct: 25, yPct: 40, probability: 0.5 },
    { name: 'Enterprise Tier Select', xPct: 75, yPct: 40, probability: 0.3 },
    { name: 'FAQ Section Header', xPct: 50, yPct: 80, probability: 0.4 }
  ],
  'http://localhost:3000/docs': [
    { name: 'Docs Search Bar', xPct: 15, yPct: 12, probability: 0.6 },
    { name: 'Sidebar Link: Introduction', xPct: 10, yPct: 25, probability: 0.5 },
    { name: 'Sidebar Link: SDK Setup', xPct: 10, yPct: 32, probability: 0.7 },
    { name: 'Copy Code Button', xPct: 45, yPct: 55, probability: 0.5 }
  ]
};

async function runSeed() {
  console.log('Generating high-quality telemetry seed events...');
  
  const allEvents = [];
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Generate 15 sessions over 3 days (5 sessions per day)
  for (let s = 0; s < 15; s++) {
    const sessionId = generateSessionId();
    const userAgent = userAgents[s % userAgents.length];
    
    // Distribute sessions across 3 days
    let dayOffset = 0;
    if (s >= 5 && s < 10) dayOffset = 1; // Yesterday
    if (s >= 10) dayOffset = 2;          // 2 days ago
    
    // Choose a random base time on that day
    const sessionBaseTime = now - (dayOffset * ONE_DAY_MS) - Math.floor(Math.random() * 8 * 60 * 60 * 1000); 

    // Determine how many pages this user visited
    const numPages = Math.floor(Math.random() * 3) + 1; // 1 to 3 pages
    const sessionPages = pages.slice(0, numPages);

    let eventOffsetTime = 0;

    for (const pageUrl of sessionPages) {
      const pageViewTime = sessionBaseTime + eventOffsetTime;
      
      // 1. Page View Event
      allEvents.push({
        type: 'page_view',
        sessionId,
        userAgent,
        pageUrl,
        timestamp: pageViewTime
      });

      eventOffsetTime += 4000; // 4 seconds reading page

      // 2. Generate Clicks for the page clusters with slight jitter (+/- 1.5%) to simulate human clicks
      const targets = pageTargetClusters[pageUrl] || [];
      for (const target of targets) {
        // Evaluate click based on probability
        if (Math.random() < target.probability) {
          // Multiple clicks on popular items
          const clickCount = Math.random() > 0.75 ? 2 : 1; 

          for (let c = 0; c < clickCount; c++) {
            const clickTime = pageViewTime + eventOffsetTime;
            
            // Add a small randomized coordinate jitter
            const xJitter = (Math.random() - 0.5) * 3; // +/- 1.5%
            const yJitter = (Math.random() - 0.5) * 3; // +/- 1.5%
            
            const xPct = Math.max(0, Math.min(100, Number((target.xPct + xJitter).toFixed(2))));
            const yPct = Math.max(0, Math.min(100, Number((target.yPct + yJitter).toFixed(2))));

            allEvents.push({
              type: 'click',
              sessionId,
              userAgent,
              pageUrl,
              timestamp: clickTime,
              x: Math.round(xPct * 19.2), // Simulate 1920 viewport width
              y: Math.round(yPct * 10.8), // Simulate 1080 viewport height
              viewportWidth: 1920,
              viewportHeight: 1080,
              xPct,
              yPct
            });

            eventOffsetTime += Math.floor(Math.random() * 4000) + 1500; // 1.5-5.5s delay
          }
        }
      }
      
      eventOffsetTime += 10000; // time before moving to next page
    }
  }

  // Sort events chronologically so the database logs them realistically
  allEvents.sort((a, b) => a.timestamp - b.timestamp);

  console.log(`Sending a batch of ${allEvents.length} events to ${BACKEND_URL}...`);

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(allEvents)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Seeded database successfully with realistic multi-day cluster data!');
      console.log('Ingestion Response:', data);
    } else {
      const errorText = await response.text();
      console.error(`Failed to seed: HTTP ${response.status}`, errorText);
    }
  } catch (error) {
    console.error('Error connecting to the backend server. Is it running?', error.message);
  }
}

runSeed();
*/
