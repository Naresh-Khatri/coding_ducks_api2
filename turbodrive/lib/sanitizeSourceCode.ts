const sanitizer = (input: string): string => {
  // Regular expression to match text within single, double, triple quotes, and backticks
  const quotedTextRegex =
    /(?:'[^']*'|"[^"]*"|'''[^']*'''|"""[^"]*""")|`[^`]*`/g;

  // Escape newline characters within quoted text
  const escapedCode = input.replace(quotedTextRegex, (match) => {
    return match.replace(/\n/g, "\\n");
  });
  console.log(escapedCode.replace(/"/g, `\"`));
  return escapedCode.replace(/"/g, `\"`);
};

export default sanitizer;
