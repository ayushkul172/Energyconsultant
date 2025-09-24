const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    const html = fs.readFileSync(path.join(__dirname, '../../dashboard.html'), 'utf8');
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Dashboard unavailable'
    };
  }
};
