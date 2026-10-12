// check-assets.js
const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "dist");
const assetsPath = path.join(distPath, "assets");

// función para obtener todos los archivos dentro de un directorio (recursivo)
function getAllFiles(dir, extFilter = null, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, extFilter, fileList);
    } else {
      if (!extFilter || file.endsWith(extFilter)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

// 1. obtener todos los archivos de assets
const assetFiles = getAllFiles(assetsPath).map(f => path.relative(distPath, f));

// 2. obtener todos los archivos html, js y css de dist
const contentFiles = getAllFiles(distPath).filter(
  f => f.endsWith(".html") || f.endsWith(".js") || f.endsWith(".css")
);

// 3. leer contenido y ver qué assets están siendo usados
let usedAssets = new Set();

contentFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf-8");
  assetFiles.forEach(asset => {
    if (content.includes(asset)) {
      usedAssets.add(asset);
    }
  });
});

// 4. calcular no usados
const unusedAssets = assetFiles.filter(a => !usedAssets.has(a));

// Mostrar resultados
console.log("✅ Archivos usados:");
console.log([...usedAssets].join("\n"));

console.log("\n⚠️ Archivos NO usados:");
console.log(unusedAssets.length ? unusedAssets.join("\n") : "Todos están en uso");
