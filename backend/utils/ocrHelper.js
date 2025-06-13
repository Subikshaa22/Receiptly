const { PythonShell } = require('python-shell');

exports.runOCR = (filePath) => {
  return new Promise((resolve, reject) => {
    let options = {
      args: [filePath],
    };

    console.time(" OCR PythonShell Time");

    PythonShell.run('ocr_model.py', options, function (err, results) {
      console.timeEnd("OCR PythonShell Time");

      if (err) {
        console.error(" PythonShell error:", err);
        return reject(err);
      }

      if (!results || results.length === 0) {
        return reject(new Error("No output from OCR script"));
      }

      try {
        const parsed = JSON.parse(results.join(''));
        resolve(parsed);
      } catch (parseError) {
        console.error("Failed to parse OCR output:", parseError);
        reject(parseError);
      }
    });
  });
};
