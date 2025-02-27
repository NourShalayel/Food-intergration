import * as I from '../Interface'

export class Utils {

  public static splitNameByLanguage(revelName: string): I.splitNameLanguag[] | null {
    if (!revelName) {
      return null;
    }

    const englishCharsPattern = /[\x00-\x7F]+/g;
    const englishParts = revelName.match(englishCharsPattern)?.filter((part) => !!part.trim()) || [];

    const nonEnglishCharsPattern = /[^\x00-\x7F]+/g;
    const nonEnglishParts = revelName.match(nonEnglishCharsPattern) || [];

    const names: I.splitNameLanguag[] = [{
      en: englishParts.length === 0 ? nonEnglishParts.join(" ") : englishParts.join(" "),
      ar: nonEnglishParts.length === 0 ? englishParts.join(" ") : nonEnglishParts.join(" "),
    }
    ];

    return names;
  }

  public static splitSpaces(name: string): I.splitNameSpace[] {
    console.log(`name ${name}`)
    if(name){
      const [firstName, lastname] = name.split(' ');
      const names: I.splitNameSpace[] = [{
        first_Name: firstName,
        last_Name:  lastname,
      }]
      console.log(`names ${names}`)
      return names
    }
  }

  public static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
}



// public static List<string> spiltNameByLanguage(string revelName)
// {
//     if (string.IsNullOrEmpty(revelName))
//         return null;

//     string englishCharsPattern = "[\x00-\x7F]+";
//     var englishParts = Regex.Matches(revelName, englishCharsPattern)
//                             .OfType<Match>()
//                             .Where(m => !string.IsNullOrWhiteSpace(m.Groups[0].Value))
//                             .Select(m => m.Groups[0].Value.Trim())
//                             .ToArray();

//     string nonEnglishCharsPattern = "[^\x00-\x7F]+";
//     var nonEnglishParts = Regex.Matches(revelName, nonEnglishCharsPattern)
//                                 .OfType<Match>()
//                                 .Select(m => m.Groups[0].Value)
//                                 .ToArray();
//     List<string> names = new List<string>
//     {
//         String.Join(" ", englishParts.Length == 0 ? nonEnglishParts : englishParts),
//         String.Join(" ", nonEnglishParts.Length == 0 ? englishParts : nonEnglishParts)
//     };
//     return names;

// }
