const fs = require('fs');
let content = fs.readFileSync('frontend/src/services/api.js', 'utf8');

const validMapping = {
  // NOTES
  'n1': 'MR07YxA8AHs',
  'n2': 'ZM8ECpBuQYE',
  'n3': 'FSyAehMdpyI',
  'n4': 'B10pc0Kizsc',
  'n5': 'ZM8ECpBuQYE',
  'n6': 'fo46yFWIJzU',
  'n7': 'uAxyI_XfqXk',
  'n8': 'MR07YxA8AHs',
  'n9': 'HuFR5XBYLfU',
  'n10': 'HuFR5XBYLfU', 
  'n11': 'fo46yFWIJzU',
  'n12': 'B10pc0Kizsc',
  'n13': 'MR07YxA8AHs',
  'n14': 'uAxyI_XfqXk',
  'n15': 'HuFR5XBYLfU',
  'n16': 'fo46yFWIJzU', 

  // LIVE CLASSES
  'lc1': 'ZM8ECpBuQYE',
  'lc2': 'B10pc0Kizsc',
  'lc3': 'MR07YxA8AHs',
  'lc4': 'HuFR5XBYLfU',
  'lc5': 'FSyAehMdpyI',
  'lc6': 'fo46yFWIJzU',
  'lc7': 'uAxyI_XfqXk',
  'lc8': 'HuFR5XBYLfU', 
  'lc9': 'MR07YxA8AHs', 
  'lc10': 'fo46yFWIJzU' 
};

// Replace Notes videos
content = content.replace(/id: "n\d+"[\s\S]*?videoUrl: "https:\/\/www\.youtube\.com\/embed\/[^"]+"/g, (match) => {
  const p1 = match.match(/id: "(n\d+)"/)[1];
  if (validMapping[p1]) {
    return match.replace(/videoUrl: "[^"]+"/, 'videoUrl: "https://www.youtube.com/embed/' + validMapping[p1] + '"');
  }
  return match;
});

// Replace Live Classes videos
content = content.replace(/id: "lc\d+"[\s\S]*?videoUrl: "https:\/\/www\.youtube\.com\/embed\/([^"]+)"/g, (match) => {
  const p1 = match.match(/id: "(lc\d+)"/)[1];
  const oldId = match.match(/embed\/([^"]+)"/)[1];
  if (validMapping[p1]) {
    const hasParams = oldId.includes('?');
    const query = hasParams ? oldId.substring(oldId.indexOf('?')) : '?autoplay=1&mute=1';
    return match.replace(/videoUrl: "[^"]+"/, 'videoUrl: "https://www.youtube.com/embed/' + validMapping[p1] + query + '"');
  }
  return match;
});

fs.writeFileSync('frontend/src/services/api.js', content);
console.log('Fixed all video IDs to use only verified valid ones.');
