; Inno Setup installer script for Astrante Theme
; Requires Inno Setup 6.x or later (https://jrsoftware.org/isdl.php)

#define AppName "Astrante Theme"
#define AppVersion "1.0.0"
#define AppPublisher "Astrante"
#define AppURL "https://github.com/Astrante/astrante-lol-client-extention"
#define AppExeName "AstranteTheme-Installer.exe"

[Setup]
; App identification
AppId={{8B5A3F21-4E8A-4F3D-9A1C-7E2B8A5D9F3E}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
AppCopyright=Copyright (C) 2025 {#AppPublisher}. MIT License.

; Default directory - will be set dynamically by user selection
DefaultDirName={code:GetPenguPath}
DefaultGroupName={#AppName}

; Output settings
OutputBaseFilename=AstranteTheme-Installer
OutputDir=output
Compression=lzma2
SolidCompression=yes

; UI settings
WizardStyle=modern
WizardImageStretch=no
DisableWelcomePage=no
DisableDirPage=no
DisableProgramGroupPage=yes
DisableReadyPage=yes
DisableFinishedPage=no

; Permissions (may require admin for Program Files)
PrivilegesRequired=admin
CreateAppDir=yes

; Remove previous version
Uninstallable=yes
UninstallFilesDir={app}

; Icon (place app_icon.ico in the installer/ folder)
SetupIconFile=app_icon.ico

; Messages
UninstallDisplayName={#AppName}
AppendDefaultDirName=no
DirExistsWarning=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[CustomMessages]
english.SelectPenguDir=Select Pengu Loader Plugins Directory
english.SelectPenguDirDescription=Please select the folder where Pengu Loader stores its plugins.%n%nThis is usually the "plugins" folder inside Pengu Loader installation directory.%n%nThe theme will be installed to: AstranteTheme
english.PenguDirLabel=Pengu Loader Plugins &Directory:
english.VerifyPenguDir=Verify Pengu Loader
english.PenguDirNotFound=The specified directory does not appear to contain Pengu Loader plugins.%n%nDo you want to continue anyway?
english.InstallSuccess={#AppName} has been successfully installed!%n%n%nThe theme is now available in Pengu Loader.
english.OpenGitHub=Open GitHub Page
english.LaunchLeague=Launch League of Legends
english.PenguFound=Pengu Loader installation found at:
english.PenguNotFound=Pengu Loader installation was not found automatically.%n%nPlease select the plugins folder manually.
english.PenguinCheckResults=Folder Search Results
english.PluginsNotFound=The plugins folder was not found in the selected Pengu Loader directory.%n%nDo you want to continue anyway?
english.InstallPath=Installation path:

russian.SelectPenguDir=Выберите папку плагинов Pengu Loader
russian.SelectPenguDirDescription=Выберите папку, в которой Pengu Loader хранит свои плагины.%n%nОбычно это папка "plugins" внутри каталога установки Pengu Loader.%n%nТема будет установлена в папку: AstranteTheme
russian.PenguDirLabel=&Каталог плагинов Pengu Loader:
russian.VerifyPenguDir=Проверить Pengu Loader
russian.PenguDirNotFound=Указанная папка не содержит плагины Pengu Loader.%n%nХотите продолжить всё равно?
russian.InstallSuccess={#AppName} успешно установлен!%n%n%nТема теперь доступна в Pengu Loader.
russian.OpenGitHub=Открыть страницу GitHub
russian.LaunchLeague=Запустить League of Legends
russian.PenguFound=Установка Pengu Loader найдена в папке:
russian.PenguNotFound=Установка Pengu Loader не была найдена автоматически.%n%nПожалуйста, выберите папку plugins вручную.
russian.PenguinCheckResults=Результаты поиска папки
russian.PluginsNotFound=Папка plugins не найдена в выбранном каталоге Pengu Loader.%n%nХотите продолжить всё равно?
russian.InstallPath=Путь установки:

[Files]
; Build output files (dist is in parent directory)
Source: "..\dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; Note: Add additional files here if needed
; Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Uninstall icon
Name: "{group}\{cm:UninstallProgram,{#AppName}}"; Filename: "{uninstallexe}"

[Run]
; Optional: Open GitHub page after installation
Filename: "{#AppURL}"; Description: "{cm:OpenGitHub}"; Flags: shellexec postinstall skipifsilent unchecked

; Optional: Launch League of Legends
; Filename: "{code:GetLeaguePath}"; Description: "{cm:LaunchLeague}"; Flags: shellexec postinstall skipifsilent unchecked

[UninstallDelete]
; Remove all files and folders
Type: filesandordirs; Name: "{app}\*"

[Code]
var
  PenguPathPage: TInputDirWizardPage;
  PenguPathValue: String;
  IsUpdatingPath: Boolean;

// Event handler for when the path edit field changes
procedure PathEditChange(Sender: TObject);
var
  CurrentPath: String;
  NewPath: String;
begin
  // Prevent recursive calls
  if IsUpdatingPath then
    Exit;

  CurrentPath := PenguPathPage.Values[0];

  // Only process if path is not empty and doesn't already end with \AstranteTheme
  if (CurrentPath <> '') then
  begin
    // Remove trailing backslash if present (but not if it's just a drive letter)
    if (Length(CurrentPath) > 1) and (CurrentPath[Length(CurrentPath)] = '\') and
       (Length(CurrentPath) > 3) then
      CurrentPath := Copy(CurrentPath, 1, Length(CurrentPath) - 1);

    // Check if it already ends with \AstranteTheme
    if (Length(CurrentPath) >= 13) and
       (Copy(CurrentPath, Length(CurrentPath) - 12, 13) <> '\AstranteTheme') then
    begin
      IsUpdatingPath := True;
      NewPath := CurrentPath + '\AstranteTheme';
      PenguPathPage.Values[0] := NewPath;
      IsUpdatingPath := False;
    end;
  end;
end;

// Get the Pengu Loader plugins path selected by user
function GetPenguPath(Param: String): String;
begin
  if PenguPathPage = nil then
    Result := 'C:\AstranteTheme'
  else if PenguPathPage.Values[0] = '' then
    Result := 'C:\AstranteTheme'
  else
    Result := PenguPathPage.Values[0];
end;

// Skip the standard directory selection page
function ShouldSkipPage(PageID: Integer): Boolean;
begin
  // Skip the standard "Select Destination Location" page
  Result := (PageID = wpSelectDir);
end;

// Called when user clicks Next button - set installation directory from custom page
function NextButtonClick(CurPageID: Integer): Boolean;
begin
  // If on the custom directory page, set the installation directory
  if (PenguPathPage <> nil) and (CurPageID = PenguPathPage.ID) then
  begin
    WizardForm.DirEdit.Text := PenguPathPage.Values[0];
  end;

  Result := True;
end;

// Initialize custom wizard page
procedure InitializeWizard;
var
  DefaultPath: String;
begin
  DefaultPath := 'C:\AstranteTheme';
  IsUpdatingPath := False;

  // Create custom directory selection page
  PenguPathPage := CreateInputDirPage(wpSelectDir,
    CustomMessage('SelectPenguDir'),
    CustomMessage('SelectPenguDirDescription'),
    CustomMessage('PenguDirLabel'),
    False, '');

  PenguPathPage.Add('');
  PenguPathPage.Values[0] := DefaultPath;
  PenguPathValue := DefaultPath;

  // Attach the event handler to the edit control
  PenguPathPage.Edits[0].OnChange := @PathEditChange;
end;

// Get League of Legends path (optional feature)
function GetLeaguePath(Param: String): String;
var
  LeaguePaths: array of String;
  I: Integer;
begin
  SetArrayLength(LeaguePaths, 3);
  LeaguePaths[0] := 'C:\Riot Games\League of Legends\LeagueClient.exe';
  LeaguePaths[1] := ExpandConstant('{pf}\Riot Games\League of Legends\LeagueClient.exe');
  LeaguePaths[2] := ExpandConstant('{localappdata}\Riot Games\League of Legends\LeagueClient.exe');

  for I := 0 to GetArrayLength(LeaguePaths) - 1 do
  begin
    if FileExists(LeaguePaths[I]) then
    begin
      Result := LeaguePaths[I];
      Exit;
    end;
  end;

  Result := '';
end;
