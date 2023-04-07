import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { Foodbit } from "./Foodbit";
import { Revel } from "./Revel";

export class Utils {


  // public static spiltNameByLanguage(revelName : string) : string[] {
  
  //   if (!Boolean(revelName)) return null ;
  //   const englishCharsPattern = "[\x00-\x7F]+" ;
  //   const englishName =  Regex.Matches(revelName, englishCharsPattern)
  //                               .OfType<Match>()
  //                               .Where(m => !string.IsNullOrWhiteSpace(m.Groups[0].Value))
  //                               .Select(m => m.Groups[0].Value.Trim())
  //                               .ToArray();


  //   return 
  // }
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
