/**
 * Random Joke Generator using JokeAPI
 * Fetches a random joke every hour and updates the README
 * https://jokeapi.dev/
 */

const fs = require('fs');
const path = require('path');

// Configuration
const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Any';
const README_PATH = path.join(__dirname, 'README.md');
const INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch a random joke from the API
 * @returns {Promise<Object>} Joke object with setup and delivery
 */
async function getRandomJoke() {
  try {
    const response = await fetch(JOKE_API_URL);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const joke = await response.json();
    
    // Check if joke was successfully retrieved
    if (joke.error) {
      throw new Error(`API Error: ${joke.message}`);
    }
    
    return joke;
  } catch (error) {
    console.error('Failed to fetch joke:', error);
    throw error;
  }
}

/**
 * Format joke into markdown string
 * @param {Object} joke - Joke object from API
 * @returns {string} Formatted joke
 */
function formatJoke(joke) {
  let jokeText = '';
  
  if (joke.type === 'twopart') {
    // Two-part jokes (setup and delivery)
    jokeText = `> **Setup:** ${joke.setup}\n>\n> **Punchline:** ${joke.delivery}`;
  } else if (joke.type === 'single') {
    // Single-line jokes
    jokeText = `> ${joke.joke}`;
  }
  
  return jokeText;
}

/**
 * Update README with new joke
 * @param {Object} joke - Joke object from API
 */
async function updateReadmeWithJoke(joke) {
  try {
    let readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    
    // Format the new joke section
    const jokeMarkdown = formatJoke(joke);
    const timestamp = new Date().toLocaleString('zh-CN');
    
    const jokeSection = `## 😂 今日笑话

${jokeMarkdown}

*💡 更新于: ${timestamp} (由 [joke-generator.js](https://github.com/jared0612/jared0612/blob/main/joke-generator.js) 生成)*`;
    
    // Replace the joke section in README
    const jokeRegex = /## 😂 今日笑话[\s\S]*?(?=\n---)/;
    
    if (jokeRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(jokeRegex, jokeSection);
    } else {
      // If joke section doesn't exist, add it after the greeting
      readmeContent = readmeContent.replace(
        /## Hi there 👋[\s\S]*?\n---/,
        `## Hi there 👋\n\n${jokeSection}\n\n---`
      );
    }
    
    // Write updated content back to README
    fs.writeFileSync(README_PATH, readmeContent, 'utf-8');
    
    console.log(`✅ [${timestamp}] README updated with new joke!`);
    console.log(`📝 Joke: ${joke.type === 'twopart' ? joke.setup : joke.joke}\n`);
  } catch (error) {
    console.error('Failed to update README:', error);
  }
}

/**
 * Generate and update joke every hour
 */
async function startJokeScheduler() {
  console.log('🎭 Joke Generator Started!');
  console.log(`⏰ Will generate a new joke every hour\n`);
  
  // Generate immediately on startup
  try {
    const joke = await getRandomJoke();
    await updateReadmeWithJoke(joke);
  } catch (error) {
    console.error('❌ Initial joke generation failed:', error.message);
  }
  
  // Schedule subsequent jokes every hour
  setInterval(async () => {
    try {
      const joke = await getRandomJoke();
      await updateReadmeWithJoke(joke);
    } catch (error) {
      console.error('❌ Failed to generate joke:', error.message);
    }
  }, INTERVAL);
}

/**
 * Main function
 */
function main() {
  // Check if README exists
  if (!fs.existsSync(README_PATH)) {
    console.error('❌ README.md not found!');
    process.exit(1);
  }
  
  // Start the scheduler
  startJokeScheduler();
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n\n👋 Joke Generator stopped.');
    process.exit(0);
  });
}

// Run the generator
main();

// Export functions for use as a module
module.exports = {
  getRandomJoke,
  formatJoke,
  updateReadmeWithJoke
};
