export function run(input) {
  const s = String(input.text);
  const rows = [], errors = [];
  let pos = Number(s.charCodeAt(0) === 65279), line = 1, width = -1, columns = null;
  while (pos &lt; s.length) {
    const startLine = line;
    const row = input.header === true && columns === null ? null : rows.length;
    const report = (code, detail) => errors.push({code, line:startLine, row, ...detail});
    const fields = [];
    let quoted;
    do {
      let value = '';
      quoted = s[pos] === '"';
      let closed = false;
      if (quoted) {
        let cursor = pos + 1;
        while (true) {
          const end = s.indexOf('"', cursor);
          if (end &lt; 0) { report('unterminated_quote'); break; }
          if (s[end + 1] === '"') { cursor = end + 2; continue; }
          value = s.slice(pos + 1, end).replace(/""/g, '"').replace(/\r\n?/g, '\n');
          for (let k = value.indexOf('\n'); k &gt;= 0; k = value.indexOf('\n', k+1)) line++;
          pos = end + 1;
          closed = true;
          break;
        }
      }
      let start = pos, junk = false;
      while (pos &lt; s.length) {
        const c = s.charCodeAt(pos);
        if (c === 44 || c === 10 || (c === 13 && s.charCodeAt(pos+1) === 10)) break;
        if (c === 13) {
          value += s.slice(start, pos);
          start = pos + 1;
          report('stray_cr');
        } else junk = true;
        pos++;
      }
      fields.push(value + s.slice(start, pos));
      if (closed && junk) report('quote_junk');
      if (s[pos] !== ',') break;
      pos++;
    } while (true);
    if (pos &lt; s.length) { pos += s[pos] === '\r' ? 2 : 1; line++; }
    if (fields.length === 1 && fields[0] === '' &amp;&amp; !quoted) continue;
    if (width &lt; 0) width = fields.length;
    if (row === null) { columns = fields; continue; }
    if (fields.length &lt; width) {
      report('short_row', {fields:fields.length});
      while (fields.length &lt; width) fields.push('');
    } else if (fields.length &gt; width) report('long_row', {extra:fields.splice(width)});
    rows.push(fields);
  }
  return {columns:input.header === true ? columns ?? [] : null, rows, errors};
}
