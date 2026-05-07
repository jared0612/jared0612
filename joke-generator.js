/**
 * Random Joke Generator using JokeAPI
 * Fetches random jokes from https://jokeapi.dev/
 */

// Configuration
const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Any';

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
 * Format and display a joke
 * @param {Object} joke - Joke object from API
 */
function displayJoke(joke) {
  console.log('\n' + '='.repeat(50));
  console.log('🎭 JOKE OF THE DAY 🎭');
  console.log('='.repeat(50) + '\n');
  
  if (joke.type === 'twopart') {
    // Two-part jokes (setup and delivery)
    console.log(`📝 Setup: ${joke.setup}`);
    console.log(`\n😂 Punchline: ${joke.delivery}\n`);
  } else if (joke.type === 'single') {
    // Single-line jokes
    console.log(`${joke.joke}\n`);
  }
  
  // Additional info
  console.log(`Category: ${joke.category}`);
  console.log('='.repeat(50) + '\n');
}

/**
 * Main function to generate and display a joke
 */
async function main() {
  try {
    console.log('🔄 Fetching a random joke...\n');
    const joke = await getRandomJoke();
    displayJoke(joke);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the generator
main();

// Export functions for use as a module
module.exports = {
  getRandomJoke,
  displayJoke
};
