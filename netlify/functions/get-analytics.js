exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      pageviews: 1247,
      visitors: 856,
      avgDuration: 124,
      bounceRate: 0.38,
      pageviewsChange: 0.12,
      visitorsChange: 0.08,
      durationChange: 0.05,
      bounceChange: -0.02,
      geographic: [
        {country: "🇺🇸 United States", city: "New York", visitors: 245, uniqueIPs: 189, percentage: 28.6}
      ],
      recentLocations: [],
      pages: [],
      ipInsights: {topISPs: []}
    })
  };
};
