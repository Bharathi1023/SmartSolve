const fs = require('fs');
let content = fs.readFileSync('frontend/src/services/api.js', 'utf8');

const originalMapping = {
  'n1': 'MR07YxA8AHs',
  'n2': 'ZM8ECpBuQYE',
  'n3': 'FSyAehMdpyI',
  'n4': 'B10pc0Kizsc',
  'n5': 'O5nskjZ_GoI',
  'n6': 'fo46yFWIJzU',
  'n7': '3ez14uE9cZ0',
  'n8': 'c76tZ3U7l7w',
  'n9': 'HuFR5XBYLfU',
  'n10': 'vn3e37IQBCk',
  'n11': 'fo46yFWIJzU',
  'n12': 'B10pc0Kizsc',
  'n13': 'MR07YxA8AHs',
  'n14': 'uAxyI_XfqXk',
  'n15': 'HuFR5XBYLfU',
  'n16': 'dGIDxJWMnk8'
};

content = content.replace(/id: "n\d+"[\s\S]*?videoUrl: "https:\/\/www\.youtube\.com\/embed\/[^"]+"/g, (match) => {
  const idMatch = match.match(/id: "(n\d+)"/);
  if (idMatch && originalMapping[idMatch[1]]) {
    return match.replace(/videoUrl: "[^"]+"/, 'videoUrl: "https://www.youtube.com/embed/' + originalMapping[idMatch[1]] + '"');
  }
  return match;
});

const vlMapping = {
  'vl1': 'vA-tO5BfF4U',
  'vl18': 'aqM4bO04F8A',
  'vl23': 'aqM4bO04F8A'
};

content = content.replace(/id: "vl\d+"[\s\S]*?videoUrl: "https:\/\/www\.youtube\.com\/embed\/[^"]+"/g, (match) => {
  const idMatch = match.match(/id: "(vl\d+)"/);
  if (idMatch && vlMapping[idMatch[1]]) {
    return match.replace(/videoUrl: "[^"]+"/, 'videoUrl: "https://www.youtube.com/embed/' + vlMapping[idMatch[1]] + '"');
  }
  return match;
});


fs.writeFileSync('frontend/src/services/api.js', content);
console.log('Restored original videos for Notes');
