function pad(n) {
  return String(n).padStart(2, '0');
}

function generateTag(commitDate, sha, tagFormat) {
  const year = commitDate.getUTCFullYear();
  const month = commitDate.getUTCMonth() + 1;
  const day = commitDate.getUTCDate();
  const hour = commitDate.getUTCHours();
  const minute = commitDate.getUTCMinutes();
  const second = commitDate.getUTCSeconds();

  const tokens = [
    ['{YYYY}', year],
    ['{YY}', String(year).slice(-2)],
    ['{MM}', pad(month)],
    ['{M}', month],
    ['{DD}', pad(day)],
    ['{D}', day],
    ['{HH}', pad(hour)],
    ['{H}', hour],
    ['{mm}', pad(minute)],
    ['{m}', minute],
    ['{ss}', pad(second)],
    ['{s}', second]
  ];

  let tag = tagFormat;
  tag = tag.replace(/\{sha:(\d+)\}/g, (_, len) => {
    return sha.substring(0, parseInt(len));
  });
  tag = tag.replace(/\{sha\}/g, sha);
  for (const [token, value] of tokens) {
    tag = tag.replaceAll(token, value);
  }

  return tag;
}

module.exports = { generateTag, pad };
