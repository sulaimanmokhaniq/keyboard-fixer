const enToArMap = {
  'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح', '[': 'ج', ']': 'د',
  'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك', "'": 'ط',
  'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة', ',': 'و', '.': 'ز', '/': 'ظ',
  'Q': 'َ', 'W': 'ً', 'E': 'ُ', 'R': 'ٌ', 'T': 'لإ', 'Y': 'إ', 'U': '‘', 'I': '÷', 'O': '×', 'P': '؛', '{': '<', '}': '>',
  'A': 'ِ', 'S': 'ٍ', 'D': ']', 'F': '[', 'G': 'لأ', 'H': 'أ', 'J': 'ـ', 'K': '،', 'L': '/', ':': ':', '"': '"',
  'Z': '~', 'X': 'ْ', 'C': '{', 'V': '}', 'B': 'لآ', 'N': 'آ', 'M': '’', '<': ',', '>': '.', '?': '؟',
  '`': 'ذ', '~': 'ّ'
};

const arToEnMap = Object.entries(enToArMap).reduce((acc, [en, ar]) => {
  acc[ar] = en;
  return acc;
}, {});

function convertText(text) {
  let arCount = 0;
  let enCount = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[a-zA-Z]/.test(char)) enCount++;
    else if (/[\u0600-\u06FF]/.test(char)) arCount++;
  }

  const direction = enCount > arCount ? 'en2ar' : 'ar2en';
  
  let result = text;
  
  if (direction === 'ar2en') {
    // Handle multi-character ligatures mapped to single English keys
    result = result.replace(/لا/g, 'b');
    result = result.replace(/لآ/g, 'B');
    result = result.replace(/لأ/g, 'G');
    result = result.replace(/لإ/g, 'T');
    
    let temp = '';
    for (let i = 0; i < result.length; i++) {
      temp += arToEnMap[result[i]] || result[i];
    }
    return temp;
  } else {
    let temp = '';
    for (let i = 0; i < result.length; i++) {
      temp += enToArMap[result[i]] || result[i];
    }
    return temp;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fix_text") {
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      
      if (start !== end) {
        // Only convert selected text
        const selectedText = activeElement.value.substring(start, end);
        const fixedText = convertText(selectedText);
        
        activeElement.setRangeText(fixedText, start, end, 'select');
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      const selection = window.getSelection();
      if (!selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        const fixedText = convertText(selectedText);
        
        // Handle contenteditable fields or standard HTML text selection
        if (document.queryCommandSupported('insertText')) {
          document.execCommand('insertText', false, fixedText);
        } else {
          range.deleteContents();
          range.insertNode(document.createTextNode(fixedText));
        }
      }
    }
  }
});
