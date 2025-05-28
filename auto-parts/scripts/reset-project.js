#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It deletes or moves the /app, /components, /hooks, /scripts, and /constants directories to /app-example based on user input and creates a new /app directory with an index.tsx and _layout.tsx file.
 * You can remove the `reset-project` script from package.json and safely delete this file after running it.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require('child_process');

const root = process.cwd();
const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
const exampleDir = "app-example";
const newAppDir = "app";
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
   
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

 
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

 
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /app directory created.");

 
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 app/index.tsx created.");

 
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 app/_layout.tsx created.");

    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit app/index.tsx to edit the main screen.${
        userInput === "y"
          ? `\n3. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

rl.question(
  "Do you want to move existing files to /app-example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);


const DIRECTORIES_TO_REMOVE = [
  'node_modules',
  'ios',
  'android',
  '.expo',
];


const FILES_TO_REMOVE = [
  'package-lock.json',
  'yarn.lock',
  'npm-debug.log',
  'yarn-error.log',
];


DIRECTORIES_TO_REMOVE.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Удаление директории: ${dir}`);
    try {
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
      }
    } catch (error) {
      console.error(`Ошибка при удалении ${dir}:`, error.message);
    }
  }
});

FILES_TO_REMOVE.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`Удаление файла: ${file}`);
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`Ошибка при удалении ${file}:`, error.message);
    }
  }
});

console.log('Очистка временных файлов npm...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.error('Ошибка при очистке кэша npm:', error.message);
}

console.log('\nПроект успешно очищен. Выполните следующие команды для переустановки:');
console.log('npm install');
console.log('npx expo prebuild --clean');
