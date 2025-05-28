#!/bin/bash

# Сценарий для отключения проверки подписи кода в проекте XCode

# Путь к файлу project.pbxproj
PROJECT_FILE="ios/autopartsapp.xcodeproj/project.pbxproj"

# Проверка существования файла
if [ ! -f "$PROJECT_FILE" ]; then
  echo "Error: Project file not found at $PROJECT_FILE"
  exit 1
fi

# Резервная копия файла проекта
cp "$PROJECT_FILE" "${PROJECT_FILE}.backup"

# Отключение подписи кода для всех конфигураций
sed -i '' 's/CODE_SIGN_IDENTITY = ".*";/CODE_SIGN_IDENTITY = "";/g' "$PROJECT_FILE"
sed -i '' 's/DEVELOPMENT_TEAM = ".*";/DEVELOPMENT_TEAM = "";/g' "$PROJECT_FILE"
sed -i '' 's/PROVISIONING_PROFILE_SPECIFIER = ".*";/PROVISIONING_PROFILE_SPECIFIER = "";/g' "$PROJECT_FILE"

# Добавление для всех конфигураций отключения требования подписи
sed -i '' 's/buildSettings = {/buildSettings = {\n\t\t\t\tCODE_SIGNING_REQUIRED = NO;\n\t\t\t\tCODE_SIGNING_ALLOWED = NO;/g' "$PROJECT_FILE"

echo "Code signing disabled in $PROJECT_FILE" 