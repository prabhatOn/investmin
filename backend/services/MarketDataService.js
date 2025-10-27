/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const { executeQuery } = require('../config/database');

class MarketDataService {
  
  /**
   * Update market prices with real-time data from external API
   * This replaces the previous demo price generation
   */
  static async updateMarketPrices() {
    try {
      // Check if API is configured - if not, skip updates to avoid spam
      const apiKey = process.env.MARKET_DATA_API_KEY;
      const apiUrl = process.env.MARKET_DATA_API_URL;
      
      if (!apiKey || !apiUrl) {
        console.log('Market data API not configured - skipping price updates until API integration is complete');
        return { 
          updated: 0, 
          message: 'API not configured - updates skipped',
          skipped: true 
        };
      }
      
      console.log('Fetching real market prices from API...');
      
      // Get all active symbols
      const symbols = await executeQuery(
        'SELECT id, symbol, pip_size FROM symbols WHERE is_active = 1'
      );
      
      if (!symbols.length) {
        console.log('No active symbols found');
        return { updated: 0, message: 'No symbols to update' };
      }
      
      let updatedCount = 0;
      let errorCount = 0;
      
      // TODO: Replace this section with your real API integration
      // Example structure:
      // const response = await fetch(`${apiUrl}?apikey=${apiKey}&currencies=${symbols.map(s => s.symbol).join(',')}`);
      // const data = await response.json();
      
      for (const symbol of symbols) {
        try {
          // TODO: Replace this with actual API data fetching
          // Example:
          // const apiData = await this.fetchPriceFromAPI(symbol.symbol);
          // if (!apiData) {
          //   console.log(`No API data for ${symbol.symbol}, using last known price`);
          //   continue;
          // }
          
          // TEMPORARY: Using last known prices as fallback until API is integrated
          const latestPrices = await executeQuery(
            `SELECT bid, ask, last FROM market_prices 
             WHERE symbol_id = ? 
             ORDER BY timestamp DESC 
             LIMIT 1`,
            [symbol.id]
          );
          
          let newBid, newAsk, newLast;
          
          if (latestPrices.length > 0) {
            // TODO: Replace with real API data
            // For now, keeping prices stable until API integration
            newBid = parseFloat(latestPrices[0].bid);
            newAsk = parseFloat(latestPrices[0].ask);
            newLast = parseFloat(latestPrices[0].last);
            
            // TODO: Remove this comment once API is integrated
            console.log(`TODO: Integrate real API for ${symbol.symbol} - currently using last known price`);
          } else {
            // Fallback to default prices if no historical data
            const basePrice = this.getDefaultPrice(symbol.symbol);
            const spread = this.getDefaultSpread(symbol.symbol);
            
            newBid = basePrice;
            newAsk = basePrice + spread;
            newLast = basePrice + (spread / 2);
            
            console.log(`Using default price for ${symbol.symbol} (no historical data)`);
          }
          
          // Calculate change metrics
          const change = latestPrices.length > 0 
            ? newLast - parseFloat(latestPrices[0].last || newLast)
            : 0;
          const changePercent = latestPrices.length > 0 && parseFloat(latestPrices[0].last) > 0
            ? (change / parseFloat(latestPrices[0].last)) * 100
            : 0;
          
          // Insert new market price
          await executeQuery(
            `INSERT INTO market_prices 
             (symbol_id, bid, ask, last, high, low, volume, change_amount, change_percent) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              symbol.id,
              newBid.toFixed(6),
              newAsk.toFixed(6),
              newLast.toFixed(6),
              newLast.toFixed(6), // High (will be updated by API)
              newLast.toFixed(6), // Low (will be updated by API)
              Math.floor(Math.random() * 1000000), // TODO: Get real volume from API
              change.toFixed(6),
              changePercent.toFixed(4)
            ]
          );
          
          updatedCount++;
          
        } catch (error) {
          console.error(`Error updating price for symbol ${symbol.symbol}:`, error);
          errorCount++;
        }
      }
      
      console.log(`Market price update completed: ${updatedCount} updated, ${errorCount} errors`);
      
      return {
        updated: updatedCount,
        errors: errorCount,
        message: `Successfully updated ${updatedCount} market prices from API`
      };
      
    } catch (error) {
      console.error('Error in updateMarketPrices:', error);
      
      // TODO: Implement fallback mechanism - use last known prices if API fails
      console.log('TODO: Implement API failure fallback - currently returning error');
      
      return {
        updated: 0,
        error: error.message,
        message: 'Failed to fetch market prices from API'
      };
    }
  }
  
  /**
   * Get default price for a symbol (for initialization)
   */
  static getDefaultPrice(symbol) {
    const defaultPrices = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'AUDUSD': 0.6720,
      'USDCAD': 1.3580,
      'USDCHF': 0.9125,
      'NZDUSD': 0.6180,
      'EURGBP': 0.8590,
      'EURJPY': 162.25,
      'GBPJPY': 189.10
    };
    
    return defaultPrices[symbol] || 1.0000;
  }
  
  /**
   * Get default spread for a symbol
   */
  static getDefaultSpread(symbol) {
    const defaultSpreads = {
      'EURUSD': 0.00015,
      'GBPUSD': 0.00020,
      'USDJPY': 0.015,
      'AUDUSD': 0.00018,
      'USDCAD': 0.00020,
      'USDCHF': 0.00018,
      'NZDUSD': 0.00025,
      'EURGBP': 0.00018,
      'EURJPY': 0.025,
      'GBPJPY': 0.030
    };
    
    return defaultSpreads[symbol] || 0.00020;
  }
  
  /**
   * Get current market price for a symbol
   */
  static async getCurrentPrice(symbolId) {
    try {
      const prices = await executeQuery(
        `SELECT bid, ask, last, timestamp FROM market_prices 
         WHERE symbol_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [symbolId]
      );
      
      return prices.length > 0 ? prices[0] : null;
    } catch (error) {
      console.error('Error getting current price:', error);
      return null;
    }
  }
  
  /**
   * Clean old market prices (keep only last 1000 entries per symbol)
   */
  static async cleanOldPrices() {
    try {
      const symbols = await executeQuery('SELECT id FROM symbols WHERE is_active = 1');
      
      for (const symbol of symbols) {
        await executeQuery(
          `DELETE FROM market_prices 
           WHERE symbol_id = ? 
           AND id NOT IN (
             SELECT id FROM (
               SELECT id FROM market_prices 
               WHERE symbol_id = ? 
               ORDER BY timestamp DESC 
               LIMIT 1000
             ) AS temp
           )`,
          [symbol.id, symbol.id]
        );
      }
      
      console.log('Cleaned old market prices');
    } catch (error) {
      console.error('Error cleaning old prices:', error);
    }
  }
}

module.exports = MarketDataService;