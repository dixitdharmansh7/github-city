// GitHub-like language colors
export const languageColorMap = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#239120',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  R: '#198CE7',
  MATLAB: '#e16737',
  Perl: '#0298c3',
  Lua: '#000080',
  Haskell: '#5e5086',
  Clojure: '#db5855',
  Elixir: '#6e4a7e',
  Erlang: '#B83998',
  Julia: '#a270ba',
  CoffeeScript: '#244776',
  OCaml: '#3be133',
  ObjectiveC: '#438eff',
  Assembly: '#6E4C13',
  Fortran: '#4d41b1',
  Groovy: '#e69f56',
  VisualBasic: '#945db7',
  Delphi: '#B0CE4E',
  ABAP: '#E8274B',
  Apex: '#1797c0',
  Crystal: '#000100',
  Elm: '#60B5CC',
  Fsharp: '#b845fc',
  Lisp: '#3fb68b',
  Nim: '#37775b',
  Pascal: '#E3F171',
  Pulumi: '#512668',
  Solidity: '#AA6746',
  VBA: '#867db1',
  Zig: '#ec915c',
  Unknown: '#999999'
};

export const getLanguageColor = (language) => {
  return languageColorMap[language] || languageColorMap.Unknown;
};

// Get all unique languages from data
export const getUniqueLanguages = (data) => {
  const languages = new Set(data.map(d => d.primary_language));
  return Array.from(languages).sort();
};

// Assign building type based on rank and district
export const assignBuildingType = (rank, total, district) => {
  const percentile = rank / total;
  
  // Top tier - skyscrapers and spires
  if (percentile <= 0.02) {
    return rank <= 3 ? 'spire' : 'skyscraper';
  }
  
  // Second tier - towers and complex buildings
  if (percentile <= 0.05) {
    return rank % 2 === 0 ? 'tower' : 'complex';
  }
  
  // Third tier - varied by district
  if (percentile <= 0.15) {
    const types = ['terraced', 'skyscraper', 'complex'];
    return types[rank % types.length];
  }
  
  // District-specific types
  switch (district) {
    case 'tech':
      return ['campus', 'tower', 'complex'][rank % 3];
    case 'industrial':
      return ['compound', 'terraced', 'complex'][rank % 3];
    case 'historic':
      return ['pyramid', 'terraced', 'monument'][rank % 3];
    case 'residential':
      return ['terraced', 'pyramid', 'compound'][rank % 3];
    case 'waterfront':
      return ['tower', 'skyscraper', 'terraced'][rank % 3];
    default:
      // Midtown and others - mix of common types
      const commonTypes = ['skyscraper', 'tower', 'terraced', 'complex'];
      return commonTypes[rank % commonTypes.length];
  }
};
