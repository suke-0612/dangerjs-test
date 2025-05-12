function simpleSuggest(input: string, candidates: string[]): string | null {
    return candidates.find(c => c.toLowerCase().startsWith(input.toLowerCase())) || null;
  }
  
  console.log(simpleSuggest("a", ["apple", "banana", "grape"])); // "apple"