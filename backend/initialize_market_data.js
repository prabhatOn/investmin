const { executeQuery } = require('./config/database.js');
const MarketDataService = require('./services/MarketDataService.js');

async function initializeMarketData() {
  try {
    console.log('Initializing market data from API...');

    // First, clear existing market prices
    await executeQuery('DELETE FROM market_prices');
    console.log('Cleared existing market prices');

    // Get all symbols
    const symbols = await executeQuery('SELECT id, symbol FROM symbols WHERE is_active = 1');

    if (symbols.length === 0) {
      console.log('No active symbols found. Please ensure symbols are created first.');
      return;
    }

    // TODO: Replace this section with real API initialization
    // Instead of using hardcoded default prices, fetch initial prices from your market data API
    // Example structure:
    // const apiKey = process.env.MARKET_DATA_API_KEY;
    // const apiUrl = process.env.MARKET_DATA_API_URL || 'https://api.currencyapi.com/v3/latest';
    //
    // try {
    //   const response = await fetch(`${apiUrl}?apikey=${apiKey}&base_currency=USD&currencies=${symbols.map(s => s.symbol).join(',')}`);
    //   const data = await response.json();
    //
    //   if (data.data) {
    //     // Use API data for initialization
    //     for (const symbol of symbols) {
    //       const apiPrice = data.data[symbol.symbol]?.value;
    //       if (apiPrice) {
    //         const spread = MarketDataService.getDefaultSpread(symbol.symbol);
    //         // ... rest of initialization logic
    //       }
    //     }
    //   }
    // } catch (apiError) {
    //   console.log('API not available, falling back to default prices');
    //   // Fall back to default prices if API fails
    // }

    console.log('TODO: Implement API-based market data initialization');
    console.log('Currently using default prices as fallback until API integration is complete');

    // TEMPORARY: Using default prices until API integration
    for (const symbol of symbols) {
      try {
        const basePrice = MarketDataService.getDefaultPrice(symbol.symbol);
        const spread = MarketDataService.getDefaultSpread(symbol.symbol);

        const bid = basePrice;
        const ask = basePrice + spread;
        const last = basePrice + (spread / 2);

        await executeQuery(
          `INSERT INTO market_prices
           (symbol_id, bid, ask, last, high, low, volume, change_amount, change_percent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            symbol.id,
            bid.toFixed(6),
            ask.toFixed(6),
            last.toFixed(6),
            last.toFixed(6),
            last.toFixed(6),
            Math.floor(Math.random() * 1000000),
            0.000000,
            0.0000
          ]
        );

        console.log(`Initialized prices for ${symbol.symbol}: BID=${bid.toFixed(6)}, ASK=${ask.toFixed(6)} (DEFAULT - TODO: Replace with API data)`);

      } catch (error) {
        console.error(`Error initializing price for ${symbol.symbol}:`, error);
      }
    }

    console.log('Market data initialization completed (using default prices - TODO: Integrate real API)');

  } catch (error) {
    console.error('Error in initializeMarketData:', error);
  }
}

// Run if called directly
if (require.main === module) {
  initializeMarketData()
    .then(() => {
      console.log('Market data initialization finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Market data initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeMarketData };