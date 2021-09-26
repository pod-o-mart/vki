/* ********************************************************************
 **********************************************************************
 * HTML Virtual Keyboard Interface Script - v1.34
 *   Copyright (c) 2010 - GreyWyvern
 *
 *  - Licenced for free distribution under the BSDL
 *          http://www.opensource.org/licenses/bsd-license.php
 *
 * Add a script-driven keyboard interface to text fields, password
 * fields and textareas.
 *
 * See http://www.greywyvern.com/code/javascript/keyboard for examples
 * and usage instructions.
 *
 * Version 1.34 - May 21, 2010
 *   - Added Basic Japanese Hiragana/Katakana keyboard layout
 *   - Visual style changes, useability changes
 *   - Dead key fixes for Opera style reflow bugs
 *   - Added simple i18n object to user config
 *
 *   See full changelog at:
 *     http://www.greywyvern.com/code/javascript/keyboard.changelog.txt
 *
 * Keyboard Credits
 *   - Basic Japanese Hiragana/Katakana keyboard layout by Damjan
 *   - Ukrainian keyboard layout by Dmitry Nikitin
 *   - Macedonian keyboard layout by Damjan Dimitrioski
 *   - Pashto keyboard layout by Ahmad Wali Achakzai (qamosona.com)
 *   - Armenian Eastern and Western keyboard layouts by Hayastan Project (www.hayastan.co.uk)
 *   - Pinyin keyboard layout from a collaboration with Lou Winklemann
 *   - Kazakh keyboard layout by Alex Madyankin
 *   - Danish keyboard layout by Verner Kjærsgaard
 *   - Slovak keyboard layout by Daniel Lara (www.learningslovak.com)
 *   - Belarusian, Serbian Cyrillic and Serbian Latin keyboard layouts by Evgeniy Titov
 *   - Bulgarian Phonetic keyboard layout by Samuil Gospodinov
 *   - Swedish keyboard layout by Håkan Sandberg
 *   - Romanian keyboard layout by Aurel
 *   - Farsi (Persian) keyboard layout by Kaveh Bakhtiyari (www.bakhtiyari.com)
 *   - Burmese keyboard layout by Cetanapa
 *   - Slovenian keyboard layout by Miran Zeljko
 *   - Hungarian keyboard layout by Antal Sall 'Hiromacu'
 *   - Arabic keyboard layout by Srinivas Reddy
 *   - Italian and Spanish (Spain) keyboard layouts by dictionarist.com
 *   - Lithuanian and Russian keyboard layouts by Ramunas
 *   - German keyboard layout by QuHno
 *   - French keyboard layout by Hidden Evil
 *   - Polish Programmers layout by moose
 *   - Turkish keyboard layouts by offcu
 *   - Dutch and US Int'l keyboard layouts by jerone
 *
 */
var VKI_attach, VKI_close;
  function VKI_buildKeyboardInputs() {
    var self = this;

    this.VKI_version = "1.34";
    this.VKI_showVersion = false;
    this.VKI_target = false;
    this.VKI_shift = this.VKI_shiftlock = false;
    this.VKI_altgr = this.VKI_altgrlock = false;
    this.VKI_dead = true;
    this.VKI_deadkeysOn = false;
    this.VKI_kt = "Russian";  // Default keyboard layout
    this.VKI_clearPasswords = false;  // Clear password fields on focus
    this.VKI_imageURI = "http://podolak.net/libraries/tastatur/keyboard.png";
    this.VKI_clickless = 0;  // 0 = disabled, > 0 = delay in ms
    this.VKI_keyCenter = 3;

    this.VKI_isIE = /*@cc_on!@*/false;
    this.VKI_isIE6 = /*@if(@_jscript_version == 5.6)!@end@*/false;
    this.VKI_isIElt8 = /*@if(@_jscript_version < 5.8)!@end@*/false;
    this.VKI_isWebKit = window.opera;
    this.VKI_isOpera = RegExp("Opera").test(navigator.userAgent);
    this.VKI_isMoz = (!this.VKI_isWebKit && navigator.product == "Gecko");


    /* ***** i18n text strings ************************************* */
    this.VKI_i18n = {
      '00': "Virtual Keyboard Interface",
      '01': "Display virtual keyboard interface",
      '02': "Select keyboard layout",
      '03': "Dead keys",
      '04': "On",
      '05': "Off",
      '06': "Close the keyboard",
      '07': "Clear",
      '08': "Clear this input",
      '09': "Version"
    };


    /* ***** Create keyboards ************************************** */
    this.VKI_layout = {};

    // - Lay out each keyboard in rows of sub-arrays.  Each sub-array
    //   represents one key.
    //
    // - Each sub-array consists of four slots described as follows:
    //     example: ["a", "A", "\u00e1", "\u00c1"]
    //
    //          a) Normal character
    //          A) Character + Shift/Caps
    //     \u00e1) Character + Alt/AltGr/AltLk
    //     \u00c1) Character + Shift/Caps + Alt/AltGr/AltLk
    //
    //   You may include sub-arrays which are fewer than four slots.
    //   In these cases, the missing slots will be blanked when the
    //   corresponding modifier key (Shift or AltGr) is pressed.
    //
    // - If the second slot of a sub-array matches one of the following
    //   strings:
    //     "Tab", "Caps", "Shift", "Enter", "Bksp",
    //     "Alt" OR "AltGr", "historic chars"
    //   then the function of the key will be the following,
    //   respectively:
    //     - Insert a tab
    //     - Toggle Caps Lock (technically a Shift Lock)
    //     - Next entered character will be the shifted character
    //     - Insert a newline (textarea), or close the keyboard
    //     - Delete the previous character
    //     - Next entered character will be the alternate character
    //     - Toggle Alt/AltGr Lock
    //
    //   The first slot of this sub-array will be the text to display
    //   on the corresponding key.  This allows for easy localisation
    //   of key names.
    //
    // - Layout dead keys (diacritic + letter) should be added as
    //   arrays of two item arrays with hash keys equal to the
    //   diacritic.  See the "this.VKI_deadkey" object below the layout
    //   definitions.  In  each two item child array, the second item
    //   is what the diacritic would change the first item to.
    //
    // - To disable dead keys for a layout, simply assign true to the
    //   DDK property of the layout (DDK = disable dead keys).  See the
    //   Numpad layout below for an example.
    //
    // - Note that any characters beyond the normal ASCII set should be
    //   entered in escaped Unicode format.  (eg \u00a3 = Pound symbol)
    //   You can find Unicode values for characters here:
    //     http://unicode.org/charts/
    //
    // - To remove a keyboard, just delete it, or comment it out of the
    //   source code

    this.VKI_layout.Russian = [ // Russian Standard Keyboard
      [["\u0451", "\u0401", "\u0481", "\u0480"], ["1", "!", "\ua67d", "\u0482"], ["2", '"', "\ua67c", "\u0488"], ["3", "\u2116", "\ua66f", "\u0489"], ["4", ";", "\u0483", "\ua670"], ["5", "%", "\u0485", "\ua671"], ["6", ":", "\u0486", "\ua672"], ["7", "?", " \u0487"], ["8", "*", "\u0484"], ["9", "(", "\u0306"], ["0", ")", "\u02D8", "\u205D"], ["-", "_", "\u0308", "\u205C"], ["=", "+", "`", "\u2609"], ["Bksp", "Bksp"]],
      [["Tab", "Tab"], ["\u0439", "\u0419", "\u0454", "\u0404"], ["\u0446", "\u0426", "\u0455", "\u0405"], ["\u0443", "\u0423", "\u0456", "\u0406"], ["\u043A", "\u041A", "\u0457", "\u0407"], ["\u0435", "\u0415", "\u0461", "\u0460"], ["\u043D", "\u041D", "\u0463", "\u0462"], ["\u0433", "\u0413", "\u0465", "\u0464"], ["\u0448", "\u0428", "\u0467", "\u0466"], ["\u0449", "\u0429", "\u0469", "\u0468"], ["\u0437", "\u0417", "\u046B", "\u046A"], ["\u0445", "\u0425", "\u046D", "\u046C"], ["\u044A", "\u042A", "\u046F", "\u046E"], ["Enter", "Enter"]],
      [["Caps", "Caps"], ["\u0444", "\u0424", "\u0471", "\u0470"], ["\u044B", "\u042B", "\u0473", "\u0472"], ["\u0432", "\u0412", "\u0475", "\u0474"], ["\u0430", "\u0410", "\u0477", "\u0476"], ["\u043F", "\u041F", "\u0479", "\u0478"], ["\u0440", "\u0420", "\u047B", "\u047A"], ["\u043E", "\u041E", "\u047D", "\u047C"], ["\u043B", "\u041B", "\u047F", "\u047E"], ["\u0434", "\u0414", "\ua64b", "\ua64a"], ["\u0436", "\u0416", "\uA657", "\uA656"], ["\u044D", "\u042D", "\uA653", "\uA652"], ["\\", "/"]],
      [["Shift", "Shift"], ["\u00b4","\u00b4", "\ua643", "\ua642"], ["\u044F", "\u042F", "\ua641", "\ua640"], ["\u0447", "\u0427", "\u0387"], ["\u0441", "\u0421", "\u033E"], ["\u043C", "\u041C", "\u10FB"], ["\u0438", "\u0418", "\u2056"], ["\u0442", "\u0422", "\u2058"], ["\u044C", "\u042C", "\u2059"], ["\u0431", "\u0411", "\u203B"], ["\u044E", "\u042E", "\ua673"], [".", ",", "\ua67e"], ["Shift", "Shift"]],
      [[" ", " ", " ", " "], ["historic chars", "historic chars"]]
    ];
    
    this.VKI_layout["English (UK)"] = [ // UK Standard Keyboard
      [["`", "\u00ac", "\u00a6"], ["1", "!"], ["2", '"'], ["3", "\u00a3"], ["4", "$", "\u20ac"], ["5", "%"], ["6", "^"], ["7", "&"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"], ["Bksp", "Bksp"]],
      [["Tab", "Tab"], ["q", "Q", "\u00E2", "\u00C2"], ["w", "W", "\u01CE", "\u01CD"], ["e", "E", "\u00e9", "\u00c9"], ["r", "R", "\u00E8", "\u00C8"], ["t", "T", "\u0451", "\u0401"], ["y", "Y", "\u00EA", "\u00CA"], ["u", "U", "\u00fa", "\u00da"], ["i", "I", "\u00ed", "\u00cd"], ["o", "O", "\u00f3", "\u00d3"], ["p", "P", "\u011B", "\u011A"], ["[", "{", "\u0117", "\u0116"], ["]", "}", "\u00EC", "\u00CC"], ["Enter", "Enter"]],
      [["Caps", "Caps"], ["a", "A", "\u00e1", "\u00c1"], ["s", "S", "\u00EF", "\u00CF"], ["d", "D", "\u012D", "\u012C"], ["f", "F", "\u012B", "\u012A"], ["g", "G", "\u00F4", "\u00D4"], ["h", "H", "\u014D", "\u014C"], ["j", "J", "\u00FB", "\u00DB"], ["k", "K", "\u010D", "\u010C"], ["l", "L", "f\u0300", "F\u0300"], [";", ":", "\u1E1F", "\u1E1E"], ["'", "@", "\u015D", "\u015C"], ["#", "~", "\u0161", "\u0160"]],
      [["Shift", "Shift"], ["\\", "|", "\u1EF3", "\u1EF2"], ["z", "Z", "\u1E8F", "\u1E8E"], ["x", "X", "\u1E91", "\u1E90"], ["c", "C", "\u017E", "\u017D"], ["v", "V", "i\u0361e", "I\u0361E"], ["b", "B", "i\u0361u", "I\u0361U"], ["n", "N", "i\u0361a", "I\u0361A"], ["m", "M", "\u014D\u0361t", "\u014C\u0361T"], [",", "<", "k\u0361s", "K\u0361S"], [".", ">", "p\u0361s", "P\u0361S"], ["/", "?", "t\u0361s", "T\u0361S"], ["Shift", "Shift"]],
      [[" ", " ", " ", " "], ["AltGr", "AltGr"]]
    ];

    this.VKI_layout.German = [ 
      [["\u005e", "\u00b0"], ["1", "!"], ["2", '"', "\u00b2"], ["3", "\u00a7", "\u00b3"], ["4", "$"], ["5", "%"], ["6", "&"], ["7", "/", "{"], ["8", "(", "["], ["9", ")", "]"], ["0", "=", "}"], ["\u00df", "?", "\\"], ["\u00b4", "\u0060"], ["Bksp", "Bksp"]],
      [["Tab", "Tab"], ["q", "Q", "\u0040"], ["w", "W", "\u00E2", "\u00C2"], ["e", "E", "\u20ac"], ["r", "R", "\u01CE", "\u01CD"], ["t", "T", "\u00E8", "\u00C8"], ["z", "Z", "\u0451", "\u0401"], ["u", "U", "\u00EA", "\u00CA"], ["i", "I", "\u011B", "\u011A"], ["o", "O", "\u0117", "\u0116"], ["p", "P", "\u00EC", "\u00CC"], ["\u00fc", "\u00dc", "\u00EF", "\u00CF"], ["+", "*", "~"], ["Enter", "Enter"]],
      [["Caps", "Caps"], ["a", "A", "\u012D", "\u012C"], ["s", "S", "\u012B", "\u012A"], ["d", "D", "\u00F4", "\u00D4"], ["f", "F", "\u014D", "\u014C"], ["g", "G", "\u00FB", "\u00DB"], ["h", "H", "\u010D", "\u010C"], ["j", "J", "f\u0300", "F\u0300"], ["k", "K", "\u1E1F", "\u1E1E"], ["l", "L", "\u015D", "\u015C"], ["\u00f6", "\u00d6", "\u0161", "\u0160"], ["\u00e4", "\u00c4", "\u1EF3", "\u1EF2"], ["#", "'"]],
      [["Shift", "Shift"], ["<", ">", "\u00a6"], ["y", "Y", "\u1E8F", "\u1E8E"], ["x", "X", "\u1E91", "\u1E90"], ["c", "C", "\u017E", "\u017D"], ["v", "V", "i\u0361e", "I\u0361E"], ["b", "B", "i\u0361u", "I\u0361U"], ["n", "N", "i\u0361a", "I\u0361A"], ["m", "M", "\u00b5", "\u014D\u0361t", "\u014C\u0361T"], [",", ";", "k\u0361s", "K\u0361S"], [".", ":", "p\u0361s", "P\u0361S"], ["-", "_", "t\u0361s", "T\u0361S"], ["Shift", "Shift"]],
      [[" ", " ", " ", " "], ["AltGr", "AltGr"]]
    ];

    this.VKI_layout.Danish = [ 
      [["\u00bd", "\u00a7"], ["1", "!"], ["2", '"', "@"], ["3", "#", "\u00a3"], ["4", "\u00a4", "$"], ["5", "%", "\u20ac"], ["6", "&"], ["7", "/", "{"], ["8", "(", "["], ["9", ")", "]"], ["0", "=", "}"], ["+", "?"], ["\u00b4", "`", "|"], ["Bksp", "Bksp"]],
      [["Tab", "Tab"], ["q", "Q", "\u00E2", "\u00C2"], ["w", "W", "\u01CE", "\u01CD"], ["e", "E", "\u20ac", "\u00E8", "\u00C8"], ["r", "R", "\u0451", "\u0401"], ["t", "T", "\u00EA", "\u00CA"], ["y", "Y", "\u011B", "\u011A"], ["u", "U", "\u0117", "\u0116"], ["i", "I", "\u00EC", "\u00CC"], ["o", "O", "\u00EF", "\u00CF"], ["p", "P", "\u012D", "\u012C"], ["\u00e5", "\u00c5", "\u012B", "\u012A"], ["\u00a8", "^", "~"], ["Enter", "Enter"]],
      [["Caps", "Caps"], ["a", "A", "\u00F4", "\u00D4"], ["s", "S", "\u014D", "\u014C"], ["d", "D", "\u00FB", "\u00DB"], ["f", "F", "\u010D", "\u010C"], ["g", "G", "f\u0300", "F\u0300"], ["h", "H", "\u1E1F", "\u1E1E"], ["j", "J", "\u015D", "\u015C"], ["k", "K", "\u0161", "\u0160"], ["l", "L", "\u1EF3", "\u1EF2"], ["\u00e6", "\u00c6", "\u1E8F", "\u1E8E"], ["\u00f8", "\u00d8", "\u1E91", "\u1E90"], ["'", "*"]],
      [["Shift", "Shift"], ["<", ">", "\\", "\u017E", "\u017D"], ["z", "Z", "i\u0361e", "I\u0361E"], ["x", "X", "i\u0361u", "I\u0361U"], ["c", "C", "i\u0361a", "I\u0361A"], ["v", "V", "\u014D\u0361t", "\u014C\u0361T"], ["b", "B", "k\u0361s", "K\u0361S"], ["n", "N", "p\u0361s", "P\u0361S"], ["m", "M", "\u03bc", "\u039c"], [",", ";", "t\u0361s", "T\u0361S"], [".", ":"], ["-", "_"], ["Shift", "Shift"]],
      [[" ", " ", " ", " "], ["AltGr", "AltGr"]]
    ];

    /* ***** Define Dead Keys ************************************** */
    this.VKI_deadkey = {};

    // - Lay out each dead key set in one row of sub-arrays.  The rows
    //   below are wrapped so uppercase letters are below their
    //   lowercase equivalents.
    //
    // - The first letter in each sub-array is the letter pressed after
    //   the diacritic.  The second letter is the letter this key-combo
    //   will generate.
    //
    // - Note that if you have created a new keyboard layout and want
    //   it included in the distributed script, PLEASE TELL ME if you
    //   have added additional dead keys to the ones below.

    this.VKI_deadkey['"'] = this.VKI_deadkey['\u00a8'] = [ // Umlaut / Diaeresis / Greek Dialytika
      ["a", "\u00e4"], ["e", "\u00eb"], ["i", "\u00ef"], ["o", "\u00f6"], ["u", "\u00fc"], ["y", "\u00ff"], ["\u03b9", "\u03ca"], ["\u03c5", "\u03cb"], ["\u016B", "\u01D6"], ["\u00FA", "\u01D8"], ["\u01D4", "\u01DA"], ["\u00F9", "\u01DC"],
      ["A", "\u00c4"], ["E", "\u00cb"], ["I", "\u00cf"], ["O", "\u00d6"], ["U", "\u00dc"], ["Y", "\u0178"], ["\u0399", "\u03aa"], ["\u03a5", "\u03ab"], ["\u016A", "\u01D5"], ["\u00DA", "\u01D7"], ["\u01D3", "\u01D9"], ["\u00D9", "\u01DB"],
      ["\u304b", "\u304c"], ["\u304d", "\u304e"], ["\u304f", "\u3050"], ["\u3051", "\u3052"], ["\u3053", "\u3054"],
      ["\u305f", "\u3060"], ["\u3061", "\u3062"], ["\u3064", "\u3065"], ["\u3066", "\u3067"], ["\u3068", "\u3069"],
      ["\u3055", "\u3056"], ["\u3057", "\u3058"], ["\u3059", "\u305a"], ["\u305b", "\u305c"], ["\u305d", "\u305e"],
      ["\u306f", "\u3070"], ["\u3072", "\u3073"], ["\u3075", "\u3076"], ["\u3078", "\u3079"], ["\u307b", "\u307c"],
      ["\u30ab", "\u30ac"], ["\u30ad", "\u30ae"], ["\u30af", "\u30b0"], ["\u30b1", "\u30b2"], ["\u30b3", "\u30b4"],
      ["\u30bf", "\u30c0"], ["\u30c1", "\u30c2"], ["\u30c4", "\u30c5"], ["\u30c6", "\u30c7"], ["\u30c8", "\u30c9"],
      ["\u30b5", "\u30b6"], ["\u30b7", "\u30b8"], ["\u30b9", "\u30ba"], ["\u30bb", "\u30bc"], ["\u30bd", "\u30be"],
      ["\u30cf", "\u30d0"], ["\u30d2", "\u30d3"], ["\u30d5", "\u30d6"], ["\u30d8", "\u30d9"], ["\u30db", "\u30dc"]
    ];
    this.VKI_deadkey['~'] = [ // Tilde / Stroke
      ["a", "\u00e3"], ["l", "\u0142"], ["n", "\u00f1"], ["o", "\u00f5"],
      ["A", "\u00c3"], ["L", "\u0141"], ["N", "\u00d1"], ["O", "\u00d5"]
    ];
    this.VKI_deadkey['^'] = [ // Circumflex
      ["a", "\u00e2"], ["e", "\u00ea"], ["i", "\u00ee"], ["o", "\u00f4"], ["u", "\u00fb"], ["w", "\u0175"], ["y", "\u0177"],
      ["A", "\u00c2"], ["E", "\u00ca"], ["I", "\u00ce"], ["O", "\u00d4"], ["U", "\u00db"], ["W", "\u0174"], ["Y", "\u0176"]
    ];
    this.VKI_deadkey['\u02c7'] = [ // Baltic caron
      ["c", "\u010D"], ["d", "\u010f"], ["e", "\u011b"], ["s", "\u0161"], ["l", "\u013e"], ["n", "\u0148"], ["r", "\u0159"], ["t", "\u0165"], ["u", "\u01d4"], ["z", "\u017E"], ["\u00fc", "\u01da"],
      ["C", "\u010C"], ["D", "\u010e"], ["E", "\u011a"], ["S", "\u0160"], ["L", "\u013d"], ["N", "\u0147"], ["R", "\u0158"], ["T", "\u0164"], ["U", "\u01d3"], ["Z", "\u017D"], ["\u00dc", "\u01d9"]
    ];
    this.VKI_deadkey['\u02d8'] = [ // Romanian and Turkish breve
      ["a", "\u0103"], ["g", "\u011f"],
      ["A", "\u0102"], ["G", "\u011e"]
    ];
    this.VKI_deadkey['-'] = this.VKI_deadkey['\u00af'] = [ // Macron
      ["a", "\u0101"], ["e", "\u0113"], ["i", "\u012b"], ["o", "\u014d"], ["u", "\u016B"], ["y", "\u0233"], ["\u00fc", "\u01d6"],
      ["A", "\u0100"], ["E", "\u0112"], ["I", "\u012a"], ["O", "\u014c"], ["U", "\u016A"], ["Y", "\u0232"], ["\u00dc", "\u01d5"]
    ];
    this.VKI_deadkey['`'] = [ // Grave
      ["a", "\u00e0"], ["e", "\u00e8"], ["i", "\u00ec"], ["o", "\u00f2"], ["u", "\u00f9"], ["\u00fc", "\u01dc"],
      ["A", "\u00c0"], ["E", "\u00c8"], ["I", "\u00cc"], ["O", "\u00d2"], ["U", "\u00d9"], ["\u0404", "\u0404\u0300"], ["\u0406", "\u0406\u0300"], ["\u0407", "\u0407\u0300"], ["\u0410", "\u0410\u0300"], ["\u0415", "\u0415\u0300"], ["\u0418", "\u0418\u0300"], ["\u041E", "\u041E\u0300"], ["\u0423", "\u0423\u0300"], ["\u042B", "\u042B\u0300"], ["\u042D", "\u042D\u0300"], ["\u042E", "\u042E\u0300"], ["\u042F", "\u042F\u0300"], ["\u0430", "\u0430\u0300"], ["\u0435", "\u0435\u0300"], ["\u0438", "\u0438\u0300"], ["\u043E", "\u043E\u0300"], ["\u0443", "\u0443\u0300"], ["\u044B", "\u044B\u0300"], ["\u044D", "\u044D\u0300"], ["\u044F", "\u044F\u0300"], ["\u0454", "\u0454\u0300"], ["\u0456", "\u0456\u0300"], ["\u0457", "\u0457\u0300"], ["\u0462", "\u0462\u0300"], ["\u0463", "\u0463\u0300"], ["\u0460", "\u0460\u0300"], ["\u0461", "\u0461\u0300"], ["\u0464", "\u0464\u0300"], ["\u0465", "\u0465\u0300"], ["\u0466", "\u0466\u0300"], ["\u0467", "\u0467\u0300"], ["\u0468", "\u0468\u0300"], ["\u0469", "\u0469\u0300"], ["\u046A", "\u046A\u0300"], ["\u046B", "\u046B\u0300"], ["\u046C", "\u046C\u0300"], ["\u046D", "\u046D\u0300"], ["\u0474", "\u0474\u0300"], ["\u0475", "\u0475\u0300"], ["\u0478", "\u0478\u0300"], ["\u0479", "\u0479\u0300"], ["\u047A", "\u047A\u0300"], ["\u047B", "\u047B\u0300"], ["\u047C", "\u047C\u0300"], ["\u047D", "\u047D\u0300"], ["\u047E", "\u047E\u0300"], ["\u047F", "\u047F\u0300"], ["\u044E", "\u044E\u0300"], ["\u042E", "\u042E\u0300"], ["\ua64b", "\ua64b\u0300"], ["\ua64a", "\ua64a\u0300"], ["\uA657", "\uA657\u0300"], ["\uA656", "\uA656\u0300"], ["\uA653", "\uA653\u0300"], ["\uA652", "\uA652\u0300"], ["\u0306", "\u0306\u0300"], ["\u0483", "\u0483\u0300"], ["\u0484", "\u0484\u0300"], ["\u0485", "\u0485\u0300"], ["\u0486", "\u0486\u0300"], ["\u02D8", "\u02D8\u0300"]
    ];
    this.VKI_deadkey["'"] = this.VKI_deadkey['\u00b4'] = this.VKI_deadkey['\u0384'] = [ // Acute / Greek Tonos
      ["a", "\u00e1"], ["e", "\u00e9"], ["i", "\u00ed"], ["o", "\u00f3"], ["u", "\u00fa"], ["y", "\u00fd"], ["\u03b1", "\u03ac"], ["\u03b5", "\u03ad"], ["\u03b7", "\u03ae"], ["\u03b9", "\u03af"], ["\u03bf", "\u03cc"], ["\u03c5", "\u03cd"], ["\u03c9", "\u03ce"], ["\u00fc", "\u01d8"],
      ["A", "\u00c1"], ["E", "\u00c9"], ["I", "\u00cd"], ["O", "\u00d3"], ["U", "\u00da"], ["Y", "\u00dd"], ["\u0391", "\u0386"], ["\u0395", "\u0388"], ["\u0397", "\u0389"], ["\u0399", "\u038a"], ["\u039f", "\u038c"], ["\u03a5", "\u038e"], ["\u03a9", "\u038f"], ["\u00dc", "\u01d7"], ["\u0435", "\u0435\u0301"], ["\u0404", "\u0404\u0301"], ["\u0406", "\u0406\u0301"], ["\u0407", "\u0407\u0301"], ["\u0410", "\u0410\u0301"], ["\u0415", "\u0415\u0301"], ["\u0418", "\u0418\u0301"], ["\u041E", "\u041E\u0301"], ["\u0423", "\u0423\u0301"], ["\u042B", "\u042B\u0301"], ["\u042D", "\u042D\u0301"], ["\u042E", "\u042E\u0301"], ["\u042F", "\u042F\u0301"], ["\u0430", "\u0430\u0301"], ["\u0435", "\u0435\u0301"], ["\u0438", "\u0438\u0301"], ["\u043E", "\u043E\u0301"], ["\u0443", "\u0443\u0301"], ["\u044B", "\u044B\u0301"], ["\u044D", "\u044D\u0301"], ["\u044F", "\u044F\u0301"], ["\u0454", "\u0454\u0301"], ["\u0456", "\u0456\u0301"], ["\u0457", "\u0457\u0301"], ["\u0462", "\u0462\u0301"], ["\u0463", "\u0463\u0301"], ["\u0460", "\u0460\u0301"], ["\u0461", "\u0461\u0301"], ["\u0464", "\u0464\u0301"], ["\u0465", "\u0465\u0301"], ["\u0466", "\u0466\u0301"], ["\u0467", "\u0467\u0301"], ["\u0468", "\u0468\u0301"], ["\u0469", "\u0469\u0301"], ["\u046A", "\u046A\u0301"], ["\u046B", "\u046B\u0301"], ["\u046C", "\u046C\u0301"], ["\u046D", "\u046D\u0301"], ["\u0474", "\u0474\u0301"], ["\u0475", "\u0475\u0301"], ["\u0478", "\u0478\u0301"], ["\u0479", "\u0479\u0301"], ["\u047A", "\u047A\u0301"], ["\u047B", "\u047B\u0301"], ["\u047C", "\u047C\u0301"], ["\u047D", "\u047D\u0301"], ["\u047E", "\u047E\u0301"], ["\u047F", "\u047F\u0301"], ["\u044E", "\u044E\u0301"], ["\u042E", "\u042E\u0301"], ["\ua64b", "\ua64b\u0301"], ["\ua64a", "\ua64a\u0301"], ["\uA657", "\uA657\u0301"], ["\uA656", "\uA656\u0301"], ["\uA653", "\uA653\u0301"], ["\uA652", "\uA652\u0301"], ["\u0306", "\u0306\u0301"], ["\u0483", "\u0483\u0301"], ["\u0484", "\u0484\u0301"], ["\u0485", "\u0485\u0301"], ["\u0486", "\u0486\u0301"], ["\u02D8", "\u02D8\u0301"]
    ];
    this.VKI_deadkey['\u02dd'] = [ // Hungarian Double Acute Accent
      ["o", "\u0151"], ["u", "\u0171"],
      ["O", "\u0150"], ["U", "\u0170"]
    ];
    this.VKI_deadkey['\u0385'] = [ // Greek Dialytika + Tonos
      ["\u03b9", "\u0390"], ["\u03c5", "\u03b0"]
    ];
    this.VKI_deadkey['\u00b0'] = this.VKI_deadkey['\u00ba'] = [ // Ring
      ["a", "\u00e5"], ["u", "\u016f"],
      ["A", "\u00c5"], ["U", "\u016e"]
    ];
    this.VKI_deadkey['\u02DB'] = [ // Ogonek
      ["a", "\u0106"], ["e", "\u0119"], ["i", "\u012f"], ["o", "\u01eb"], ["u", "\u0173"], ["y", "\u0177"],
      ["A", "\u0105"], ["E", "\u0118"], ["I", "\u012e"], ["O", "\u01ea"], ["U", "\u0172"], ["Y", "\u0176"]
    ];
    this.VKI_deadkey['\u02D9'] = [ // Dot-above
      ["c", "\u010B"], ["e", "\u0117"], ["g", "\u0121"], ["z", "\u017C"],
      ["C", "\u010A"], ["E", "\u0116"], ["G", "\u0120"], ["Z", "\u017B"]
    ];
    this.VKI_deadkey['\u00B8'] = this.VKI_deadkey['\u201a'] = [ // Cedilla
      ["c", "\u00e7"], ["s", "\u015F"],
      ["C", "\u00c7"], ["S", "\u015E"]
    ];
    this.VKI_deadkey[','] = [ // Comma
      ["s", (this.VKI_isIElt8) ? "\u015F" : "\u0219"], ["t", (this.VKI_isIElt8) ? "\u0163" : "\u021B"],
      ["S", (this.VKI_isIElt8) ? "\u015E" : "\u0218"], ["T", (this.VKI_isIElt8) ? "\u0162" : "\u021A"]
    ];
    this.VKI_deadkey['\u3002'] = [ // Hiragana/Katakana Point
      ["\u306f", "\u3071"], ["\u3072", "\u3074"], ["\u3075", "\u3077"], ["\u3078", "\u307a"], ["\u307b", "\u307d"],
      ["\u30cf", "\u30d1"], ["\u30d2", "\u30d4"], ["\u30d5", "\u30d7"], ["\u30d8", "\u30da"], ["\u30db", "\u30dd"]
    ];
	this.VKI_deadkey[' \u0487'] = [ // dasy pneuma
	["\u0391", "\u0386"], ["\u0395", "\u0388"], ["\u0397", "\u0389"], ["\u0399", "\u038a"], ["\u039f", "\u038c"], ["\u03a5", "\u038e"], ["\u03a9", "\u038f"], ["\u00dc", "\u01d7"], ["\u0435", "\u0435\u0487"], ["\u0404", "\u0404\u0487"], ["\u0406", "\u0406\u0487"], ["\u0407", "\u0407\u0487"], ["\u0410", "\u0410\u0487"], ["\u0415", "\u0415\u0487"], ["\u0418", "\u0418\u0487"], ["\u041E", "\u041E\u0487"], ["\u0423", "\u0423\u0487"], ["\u042B", "\u042B\u0487"], ["\u042D", "\u042D\u0487"], ["\u042E", "\u042E\u0487"], ["\u042F", "\u042F\u0487"], ["\u0430", "\u0430\u0487"], ["\u0435", "\u0435\u0487"], ["\u0438", "\u0438\u0487"], ["\u043E", "\u043E\u0487"], ["\u0443", "\u0443\u0487"], ["\u044B", "\u044B\u0487"], ["\u044D", "\u044D\u0487"], ["\u044F", "\u044F\u0487"], ["\u0454", "\u0454\u0487"], ["\u0456", "\u0456\u0487"], ["\u0457", "\u0457\u0487"], ["\u0462", "\u0462\u0487"], ["\u0463", "\u0463\u0487"], ["\u0460", "\u0460\u0487"], ["\u0461", "\u0461\u0487"], ["\u0464", "\u0464\u0487"], ["\u0465", "\u0465\u0487"], ["\u0466", "\u0466\u0487"], ["\u0467", "\u0467\u0487"], ["\u0468", "\u0468\u0487"], ["\u0469", "\u0469\u0487"], ["\u046A", "\u046A\u0487"], ["\u046B", "\u046B\u0487"], ["\u046C", "\u046C\u0487"], ["\u046D", "\u046D\u0487"], ["\u0474", "\u0474\u0487"], ["\u0475", "\u0475\u0487"], ["\u0478", "\u0478\u0487"], ["\u0479", "\u0479\u0487"], ["\u047A", "\u047A\u0487"], ["\u047B", "\u047B\u0487"], ["\u047C", "\u047C\u0487"], ["\u047D", "\u047D\u0487"], ["\u047E", "\u047E\u0487"], ["\u047F", "\u047F\u0487"], ["\u044E", "\u044E\u0487"], ["\u042E", "\u042E\u0487"], ["\ua64b", "\ua64b\u0487"], ["\ua64a", "\ua64a\u0487"], ["\uA657", "\uA657\u0487"], ["\uA656", "\uA656\u0487"], ["\uA653", "\uA653\u0487"], ["\uA652", "\uA652\u0487"], ["\u0306", "\u0306\u0487"], ["\u0483", "\u0483\u0487"], ["\u0484", "\u0484\u0487"], ["\u0485", "\u0485\u0487"], ["\u0486", "\u0486\u0487"], ["\u02D8", "\u02D8\u0487"]
    ];


    /* ***** Define Symbols **************************************** */
    this.VKI_symbol = {
      '\ua67d': "\ua67d ", '\ua67c': "\ua67c ", '\ua66f': "\ua66f ", '\u0483': "\u0483 ", '\u0485': "\u0485 ",'\u0486': "\u0486 ", '\u0484': "\u0484 ", '\u0306': "\u0306 ", '\u0308': "\u0308 ", '\u033E': "\u033E ",'\u0488': "\u0488 ", '\u0489': "\u0489 "
    };



    /* ****************************************************************
     * Attach the keyboard to an element
     *
     */
    this.VKI_attachKeyboard = VKI_attach = function(elem) {
      if (elem.VKI_attached) return false;
      var keybut = document.createElement('img');
          keybut.src = this.VKI_imageURI;
          keybut.alt = this.VKI_i18n['00'];
          keybut.className = "keyboardInputInitiator";
          keybut.title = this.VKI_i18n['01'];
          keybut.elem = elem;
          keybut.onclick = function() { self.VKI_show(this.elem); };
      elem.VKI_attached = true;
      elem.parentNode.insertBefore(keybut, (elem.dir == "rtl") ? elem : elem.nextSibling);
      if (this.VKI_isIE) {
        elem.onclick = elem.onselect = elem.onkeyup = function(e) {
          if ((e || event).type != "keyup" || !this.readOnly)
            this.range = document.selection.createRange();
        };
      }
    };


    /* ***** Find tagged input & textarea elements ***************** */
    var inputElems = [
      document.getElementsByTagName('input'),
      document.getElementsByTagName('textarea')
    ];
    for (var x = 0, elem; elem = inputElems[x++];)
      for (var y = 0, ex; ex = elem[y++];)
        if ((ex.nodeName == "TEXTAREA" || ex.type == "text" || ex.type == "password") && ex.className.indexOf("keyboardInput") > -1)
          this.VKI_attachKeyboard(ex);


    /* ***** Build the keyboard interface ************************** */
    this.VKI_keyboard = document.createElement('table');
    this.VKI_keyboard.id = "keyboardInputMaster";
    this.VKI_keyboard.dir = "ltr";
    this.VKI_keyboard.cellSpacing = this.VKI_keyboard.border = "0";

    var thead = document.createElement('thead');
      var tr = document.createElement('tr');
        var th = document.createElement('th');
          var abbr = document.createElement('abbr');
              abbr.title = this.VKI_i18n['00'];
              abbr.appendChild(document.createTextNode(''));
            th.appendChild(abbr);

          var kblist = document.createElement('select');
              kblist.title = this.VKI_i18n['02'];
            for (ktype in this.VKI_layout) {
              if (typeof this.VKI_layout[ktype] == "object") {
                var opt = document.createElement('option');
                    opt.value = ktype;
                    opt.appendChild(document.createTextNode(ktype));
                  kblist.appendChild(opt);
              }
            }
            if (kblist.options.length) {
                kblist.value = this.VKI_kt;
                kblist.onchange = function() {
                  self.VKI_kt = this.value;
                  self.VKI_buildKeys();
                  self.VKI_position(true);
                };
              th.appendChild(kblist);
            }

            var label = document.createElement('label');
              var checkbox = document.createElement('input');
                  checkbox.type = "checkbox";
                  checkbox.title = this.VKI_i18n['03'] + ": " + ((this.VKI_deadkeysOn) ? this.VKI_i18n['04'] : this.VKI_i18n['05']);
                  checkbox.defaultChecked = this.VKI_deadkeysOn;
                  checkbox.onclick = function() {
                    self.VKI_deadkeysOn = this.checked;
                    this.title = self.VKI_i18n['03'] + ": " + ((this.checked) ? self.VKI_i18n['04'] : self.VKI_i18n['05']);
                    self.VKI_modify("");
                    return true;
                  };
                label.appendChild(this.VKI_deadkeysElem = checkbox);
                  checkbox.checked = this.VKI_deadkeysOn;
            th.appendChild(label);
          tr.appendChild(th);

        var td = document.createElement('td');
          var closer = document.createElement('strong');
              closer.id = "keyboardInputClose";
              closer.appendChild(document.createTextNode('X'));
              closer.title = this.VKI_i18n['06'];
              closer.onmousedown = function() { this.className = "pressed"; };
              closer.onmouseup = function() { this.className = ""; };
              closer.onclick = function() { self.VKI_close(); };
            td.appendChild(closer);

          var clearer = document.createElement('span');
              clearer.id = "keyboardInputClear";
              clearer.appendChild(document.createTextNode(this.VKI_i18n['07']));
              clearer.title = this.VKI_i18n['08'];
              clearer.onmousedown = function() { this.className = "pressed"; };
              clearer.onmouseup = function() { this.className = ""; };
              clearer.onclick = function() {
                self.VKI_target.value = "";
                self.VKI_target.focus();
                return false;
              };
            td.appendChild(clearer);

          tr.appendChild(td);
        thead.appendChild(tr);
    this.VKI_keyboard.appendChild(thead);

    var tbody = document.createElement('tbody');
      var tr = document.createElement('tr');
        var td = document.createElement('td');
            td.colSpan = "2";
          var div = document.createElement('div');
              div.id = "keyboardInputLayout";
            td.appendChild(div);
          if (this.VKI_showVersion) {
            var div = document.createElement('div');
              var ver = document.createElement('var');
                  ver.title = this.VKI_i18n['09'] + " " + this.VKI_version;
                  ver.appendChild(document.createTextNode("v" + this.VKI_version));
                div.appendChild(ver);
              td.appendChild(div);
          }
          tr.appendChild(td);
        tbody.appendChild(tr);
    this.VKI_keyboard.appendChild(tbody);

    if (this.VKI_isIE6) {
      this.VKI_iframe = document.createElement('iframe');
      this.VKI_iframe.style.position = "absolute";
      this.VKI_iframe.style.border = "0px none";
      this.VKI_iframe.style.filter = "mask()";
      this.VKI_iframe.style.zIndex = "999999";
      this.VKI_iframe.src = this.VKI_imageURI;
    }


    /* ****************************************************************
     * Build or rebuild the keyboard keys
     *
     */
    this.VKI_buildKeys = function() {
      this.VKI_shift = this.VKI_shiftlock = this.VKI_altgr = this.VKI_altgrlock = this.VKI_dead = false;
      this.VKI_deadkeysOn = (this.VKI_layout[this.VKI_kt].DDK) ? false : this.VKI_keyboard.getElementsByTagName('label')[0].getElementsByTagName('input')[0].checked;

      var container = this.VKI_keyboard.tBodies[0].getElementsByTagName('div')[0];
      while (container.firstChild) container.removeChild(container.firstChild);

      for (var x = 0, hasDeadKey = false, lyt; lyt = this.VKI_layout[this.VKI_kt][x++];) {
        var table = document.createElement('table');
            table.cellSpacing = table.border = "0";
        if (lyt.length <= this.VKI_keyCenter) table.className = "keyboardInputCenter";
          var tbody = document.createElement('tbody');
            var tr = document.createElement('tr');
            for (var y = 0, lkey; lkey = lyt[y++];) {
              var td = document.createElement('td');
                if (this.VKI_symbol[lkey[0]]) {
                  var span = document.createElement('span');
                      span.className = lkey[0];
                      span.appendChild(document.createTextNode(this.VKI_symbol[lkey[0]]));
                    td.appendChild(span);
                } else td.appendChild(document.createTextNode(lkey[0] || "\xa0"));

                var className = [];
                if (this.VKI_deadkeysOn)
                  for (key in this.VKI_deadkey)
                    if (key === lkey[0]) { className.push("alive"); break; }
                if (lyt.length > this.VKI_keyCenter && y == lyt.length) className.push("last");
                if (lkey[0] == " ") className.push("space");
                  td.className = className.join(" ");

                  td.VKI_clickless = 0;
                  if (!td.click) {
                    td.click = function() {
                      var evt = this.ownerDocument.createEvent('MouseEvents');
                      evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                      this.dispatchEvent(evt);
                    };
                  }
                  td.onmouseover = function() {
                    if (self.VKI_clickless) {
                      var _self = this;
                      clearTimeout(this.VKI_clickless);
                      this.VKI_clickless = setTimeout(function() { _self.click(); }, self.VKI_clickless);
                    }
                    if ((this.firstChild.nodeValue || this.firstChild.className) != "\xa0") this.className += " hover";
                  };
                  td.onmouseout = function() {
                    if (self.VKI_clickless) clearTimeout(this.VKI_clickless);
                    this.className = this.className.replace(/ ?(hover|pressed)/g, "");
                  };
                  td.onmousedown = function() {
                    if (self.VKI_clickless) clearTimeout(this.VKI_clickless);
                    if ((this.firstChild.nodeValue || this.firstChild.className) != "\xa0") this.className += " pressed";
                  };
                  td.onmouseup = function() {
                    if (self.VKI_clickless) clearTimeout(this.VKI_clickless);
                    this.className = this.className.replace(/ ?pressed/g, "");
                  };
                  td.ondblclick = function() { return false; };

                switch (lkey[1]) {
                  case "Caps": case "Shift":
                  case "Alt": case "AltGr": case "historic chars":
                    td.onclick = (function(type) { return function() { self.VKI_modify(type); return false; }; })(lkey[1]);
                    break;
                  case "Tab":
                    td.onclick = function() { self.VKI_insert("\t"); return false; };
                    break;
                  case "Bksp":
                    td.onclick = function() {
                      self.VKI_target.focus();
                      if (self.VKI_target.setSelectionRange) {
                        if (self.VKI_target.readOnly && self.VKI_isWebKit) {
                          var rng = [self.VKI_target.selStart || 0, self.VKI_target.selEnd || 0];
                        } else var rng = [self.VKI_target.selectionStart, self.VKI_target.selectionEnd];
                        if (rng[0] < rng[1]) rng[0]++;
                        self.VKI_target.value = self.VKI_target.value.substr(0, rng[0] - 1) + self.VKI_target.value.substr(rng[1]);
                        self.VKI_target.setSelectionRange(rng[0] - 1, rng[0] - 1);
                        if (self.VKI_target.readOnly && self.VKI_isWebKit) {
                          var range = window.getSelection().getRangeAt(0);
                          self.VKI_target.selStart = range.startOffset;
                          self.VKI_target.selEnd = range.endOffset;
                        }
                      } else if (self.VKI_target.createTextRange) {
                        try {
                          self.VKI_target.range.select();
                        } catch(e) { self.VKI_target.range = document.selection.createRange(); }
                        if (!self.VKI_target.range.text.length) self.VKI_target.range.moveStart('character', -1);
                        self.VKI_target.range.text = "";
                      } else self.VKI_target.value = self.VKI_target.value.substr(0, self.VKI_target.value.length - 1);
                      if (self.VKI_shift) self.VKI_modify("Shift");
                      if (self.VKI_altgr) self.VKI_modify("AltGr");
                      self.VKI_target.focus();
                      return true;
                    };
                    break;
                  case "Enter":
                    td.onclick = function() {
                      if (self.VKI_target.nodeName != "TEXTAREA") {
                        self.VKI_close();
                        this.className = this.className.replace(/ ?(hover|pressed)/g, "");
                      } else self.VKI_insert("\n");
                      return true;
                    };
                    break;
                  default:
                    td.onclick = function() {
                      var character = this.firstChild.nodeValue || this.firstChild.className;
                      if (self.VKI_deadkeysOn && self.VKI_dead) {
                        if (self.VKI_dead != character) {
                          for (key in self.VKI_deadkey) {
                            if (key == self.VKI_dead) {
                              if (character != " ") {
                                for (var z = 0, rezzed = false, dk; dk = self.VKI_deadkey[key][z++];) {
                                  if (dk[0] == character) {
                                    self.VKI_insert(dk[1]);
                                    rezzed = true;
                                    break;
                                  }
                                }
                              } else {
                                self.VKI_insert(self.VKI_dead);
                                rezzed = true;
                              } break;
                            }
                          }
                        } else rezzed = true;
                      } self.VKI_dead = false;

                      if (!rezzed && character != "\xa0") {
                        if (self.VKI_deadkeysOn) {
                          for (key in self.VKI_deadkey) {
                            if (key == character) {
                              self.VKI_dead = key;
                              this.className += " dead";
                              if (self.VKI_shift) self.VKI_modify("Shift");
                              if (self.VKI_altgr) self.VKI_modify("AltGr");
                              break;
                            }
                          }
                          if (!self.VKI_dead) self.VKI_insert(character);
                        } else self.VKI_insert(character);
                      }

                      self.VKI_modify("");
                      if (self.VKI_isOpera) {
                        this.style.width = "50px";
                        var foo = this.offsetWidth;
                        this.style.width = "";
                      }
                      return false;
                    };

                }
                tr.appendChild(td);
              tbody.appendChild(tr);
            table.appendChild(tbody);

            for (var z = 0; z < 4; z++)
              if (this.VKI_deadkey[lkey[z] = lkey[z] || "\xa0"]) hasDeadKey = true;
        }
        container.appendChild(table);
      }
      this.VKI_deadkeysElem.style.display = (!this.VKI_layout[this.VKI_kt].DDK && hasDeadKey) ? "inline" : "none";
    };

    this.VKI_buildKeys();
    VKI_disableSelection(this.VKI_keyboard);


    /* ****************************************************************
     * Controls modifier keys
     *
     */
    this.VKI_modify = function(type) {
      switch (type) {
        case "Alt":
        case "AltGr": this.VKI_altgr = !this.VKI_altgr; break;
        case "historic chars": this.VKI_altgrlock = !this.VKI_altgrlock; break;
        case "Caps": this.VKI_shiftlock = !this.VKI_shiftlock; break;
        case "Shift": this.VKI_shift = !this.VKI_shift; break;
      } var vchar = 0;
      if (!this.VKI_shift != !this.VKI_shiftlock) vchar += 1;
      if (!this.VKI_altgr != !this.VKI_altgrlock) vchar += 2;

      var tables = this.VKI_keyboard.getElementsByTagName('table');
      for (var x = 0; x < tables.length; x++) {
        var tds = tables[x].getElementsByTagName('td');
        for (var y = 0; y < tds.length; y++) {
          var className = [], lkey = this.VKI_layout[this.VKI_kt][x][y];

          if (tds[y].className.indexOf('hover') > -1) className.push("hover");

          switch (lkey[1]) {
            case "Alt":
            case "AltGr":
              if (this.VKI_altgr) className.push("dead");
              break;
            case "historic chars":
              if (this.VKI_altgrlock) className.push("dead");
              break;
            case "Shift":
              if (this.VKI_shift) className.push("dead");
              break;
            case "Caps":
              if (this.VKI_shiftlock) className.push("dead");
              break;
            case "Tab": case "Enter": case "Bksp": break;
            default:
              if (type) {
                tds[y].removeChild(tds[y].firstChild);
                if (this.VKI_symbol[lkey[vchar]]) {
                  var span = document.createElement('span');
                      span.className = lkey[vchar];
                      span.appendChild(document.createTextNode(this.VKI_symbol[lkey[vchar]]));
                    tds[y].appendChild(span);
                } else tds[y].appendChild(document.createTextNode(lkey[vchar]));
              }
              if (this.VKI_deadkeysOn) {
                var character = tds[y].firstChild.nodeValue || tds[y].firstChild.className;
                if (this.VKI_dead) {
                  if (character == this.VKI_dead) className.push("dead");
                  for (var z = 0; z < this.VKI_deadkey[this.VKI_dead].length; z++) {
                    if (character == this.VKI_deadkey[this.VKI_dead][z][0]) {
                      className.push("target");
                      break;
                    }
                  }
                }
                for (key in this.VKI_deadkey)
                  if (key === character) { className.push("alive"); break; }
              }
          }

          if (y == tds.length - 1 && tds.length > this.VKI_keyCenter) className.push("last");
          if (lkey[0] == " ") className.push("space");
          tds[y].className = className.join(" ");
        }
      }
    };


    /* ****************************************************************
     * Insert text at the cursor
     *
     */
    this.VKI_insert = function(text) {
      this.VKI_target.focus();
      if (this.VKI_target.maxLength) this.VKI_target.maxlength = this.VKI_target.maxLength;
      if (typeof this.VKI_target.maxlength == "undefined" ||
          this.VKI_target.maxlength < 0 ||
          this.VKI_target.value.length < this.VKI_target.maxlength) {
        if (this.VKI_target.setSelectionRange) {
          if (this.VKI_target.readOnly && this.VKI_isWebKit) {
            var rng = [this.VKI_target.selStart || 0, this.VKI_target.selEnd || 0];
          } else var rng = [this.VKI_target.selectionStart, this.VKI_target.selectionEnd];
          this.VKI_target.value = this.VKI_target.value.substr(0, rng[0]) + text + this.VKI_target.value.substr(rng[1]);
          if (text == "\n" && window.opera) rng[0]++;
          this.VKI_target.setSelectionRange(rng[0] + text.length, rng[0] + text.length);
          if (this.VKI_target.readOnly && this.VKI_isWebKit) {
            var range = window.getSelection().getRangeAt(0);
            this.VKI_target.selStart = range.startOffset;
            this.VKI_target.selEnd = range.endOffset;
          }
        } else if (this.VKI_target.createTextRange) {
          try {
            this.VKI_target.range.select();
          } catch(e) { this.VKI_target.range = document.selection.createRange(); }
          this.VKI_target.range.text = text;
          this.VKI_target.range.collapse(true);
          this.VKI_target.range.select();
        } else this.VKI_target.value += text;
        if (this.VKI_shift) this.VKI_modify("Shift");
        if (this.VKI_altgr) this.VKI_modify("AltGr");
        this.VKI_target.focus();
      } else if (this.VKI_target.createTextRange && this.VKI_target.range)
        this.VKI_target.range.select();
    };


    /* ****************************************************************
     * Show the keyboard interface
     *
     */
    this.VKI_show = function(elem) {
      if (!this.VKI_target) {
        this.VKI_target = elem;
        if (this.VKI_isIE) {
          if (!this.VKI_target.range) {
            this.VKI_target.range = this.VKI_target.createTextRange();
            this.VKI_target.range.moveStart('character', this.VKI_target.value.length);
          } this.VKI_target.range.select();
        }
        try { this.VKI_keyboard.parentNode.removeChild(this.VKI_keyboard); } catch (e) {}
        if (this.VKI_clearPasswords && this.VKI_target.type == "password") this.VKI_target.value = "";

        var elem = this.VKI_target;
        this.VKI_target.keyboardPosition = "absolute";
        do {
          if (VKI_getStyle(elem, "position") == "fixed") {
            this.VKI_target.keyboardPosition = "fixed";
            break;
          }
        } while (elem = elem.offsetParent);

        if (this.VKI_isIE6) document.body.appendChild(this.VKI_iframe);
        document.body.appendChild(this.VKI_keyboard);
        this.VKI_keyboard.style.position = this.VKI_target.keyboardPosition;

        this.VKI_position(true);
        if (self.VKI_isMoz || self.VKI_isWebKit) this.VKI_position(true);
        this.VKI_target.focus();
      } else this.VKI_close();
    };


    /* ****************************************************************
     * Position the keyboard
     *
     */
    this.VKI_position = function(force) {
      if (self.VKI_target) {
        var kPos = VKI_findPos(self.VKI_keyboard), wDim = VKI_innerDimensions(), sDis = VKI_scrollDist();
        var place = false, fudge = self.VKI_target.offsetHeight + 3;
        if (force !== true) {
          if (kPos[1] + self.VKI_keyboard.offsetHeight - sDis[1] - wDim[1] > 0) {
            place = true;
            fudge = -self.VKI_keyboard.offsetHeight - 3;
          } else if (kPos[1] - sDis[1] < 0) place = true;
        }
        if (place || force === true) {
          var iPos = VKI_findPos(self.VKI_target);
          self.VKI_keyboard.style.top = iPos[1] - ((self.VKI_target.keyboardPosition == "fixed" && !self.VKI_isIE && !self.VKI_isMoz) ? sDis[1] : 0) + fudge + "px";
          self.VKI_keyboard.style.right = Math.max(10, Math.min(wDim[0] - self.VKI_keyboard.offsetWidth - 25, iPos[0])) + "px";
          if (self.VKI_isIE6) {
            self.VKI_iframe.style.width = self.VKI_keyboard.offsetWidth + "px";
            self.VKI_iframe.style.height = self.VKI_keyboard.offsetHeight + "px";
            self.VKI_iframe.style.top = self.VKI_keyboard.style.top;
            self.VKI_iframe.style.right = self.VKI_keyboard.style.right;
          }
        }
        if (force === true) self.VKI_position();
      }
    };


    if (window.addEventListener) {
      window.addEventListener('resize', this.VKI_position, false);
      window.addEventListener('scroll', this.VKI_position, false);
    } else if (window.attachEvent) {
      window.attachEvent('onresize', this.VKI_position);
      window.attachEvent('onscroll', this.VKI_position);
    }


    /* ****************************************************************
     * Close the keyboard interface
     *
     */
    this.VKI_close = VKI_close = function() {
      if (this.VKI_target) {
        try {
          this.VKI_keyboard.parentNode.removeChild(this.VKI_keyboard);
          if (this.VKI_isIE6) this.VKI_iframe.parentNode.removeChild(this.VKI_iframe);
        } catch (e) {}
        this.VKI_target.focus();
        this.VKI_target = false;
      }
    };
  }

  function VKI_findPos(obj) {
    var curleft = curtop = 0;
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return [curleft, curtop];
  }

  function VKI_innerDimensions() {
    if (self.innerHeight) {
      return [self.innerWidth, self.innerHeight];
    } else if (document.documentElement && document.documentElement.clientHeight) {
      return [document.documentElement.clientWidth, document.documentElement.clientHeight];
    } else if (document.body)
      return [document.body.clientWidth, document.body.clientHeight];
    return [0, 0];
  }

  function VKI_scrollDist() {
    var html = document.getElementsByTagName('html')[0];
    if (html.scrollTop && document.documentElement.scrollTop) {
      return [html.scrollLeft, html.scrollTop];
    } else if (html.scrollTop || document.documentElement.scrollTop) {
      return [html.scrollLeft + document.documentElement.scrollLeft, html.scrollTop + document.documentElement.scrollTop];
    } else if (document.body.scrollTop)
      return [document.body.scrollLeft, document.body.scrollTop];
    return [0, 0];
  }

  function VKI_getStyle(obj, styleProp) {
    if (obj.currentStyle) {
      var y = obj.currentStyle[styleProp];
    } else if (window.getComputedStyle)
      var y = window.getComputedStyle(obj, null)[styleProp];
    return y;
  }

  function VKI_disableSelection(elem) {
    elem.onselectstart = function() { return false; };
    elem.unselectable = "on";
    elem.style.MozUserSelect = "none";
    elem.style.cursor = "default";
    if (window.opera) elem.onmousedown = function() { return false; };
  }


  /* ***** Attach this script to the onload event ****************** */
  if (window.addEventListener) {
    window.addEventListener('load', VKI_buildKeyboardInputs, false);
  } else if (window.attachEvent)
    window.attachEvent('onload', VKI_buildKeyboardInputs);