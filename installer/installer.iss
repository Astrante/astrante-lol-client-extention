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
DefaultDirName={code:GetPenguPath}\plugins\simpletheme
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
english.SelectPenguDir=Select Pengu Loader Installation Directory
english.SelectPenguDirDescription=Please select the folder where Pengu Loader is installed.%n%nThe theme will be installed to the plugins subfolder automatically.
english.PenguDirLabel=Pengu Loader &Directory:
english.VerifyPenguDir=Verify Pengu Loader
english.PenguDirNotFound=The specified directory does not appear to contain Pengu Loader.%n%nDo you want to continue anyway?
english.InstallSuccess={#AppName} has been successfully installed!%n%n%nThe theme is now available in Pengu Loader.
english.OpenGitHub=Open GitHub Page
english.LaunchLeague=Launch League of Legends

russian.SelectPenguDir=Выберите папку установки Pengu Loader
russian.SelectPenguDirDescription=Выберите папку, в которую установлен Pengu Loader.%n%nТема будет автоматически установлена в подпапку plugins.
russian.PenguDirLabel=&Каталог Pengu Loader:
russian.VerifyPenguDir=Проверить Pengu Loader
russian.PenguDirNotFound=Указанная папка не содержит Pengu Loader.%n%nХотите продолжить всё равно?
russian.InstallSuccess={#AppName} успешно установлен!%n%n%nТема теперь доступна в Pengu Loader.
russian.OpenGitHub=Открыть страницу GitHub
russian.LaunchLeague=Запустить League of Legends

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

// Get the Pengu Loader path selected by user
function GetPenguPath(Param: String): String;
begin
  if PenguPathPage = nil then
    Result := 'C:\Program Files\Pengu Loader'
  else if PenguPathPage.Values[0] = '' then
    Result := 'C:\Program Files\Pengu Loader'
  else
    Result := PenguPathPage.Values[0];
end;

// Try to auto-detect Pengu Loader installation
function DetectPenguPath: String;
var
  CommonPaths: array of String;
  I: Integer;
begin
  // Common installation paths
  SetArrayLength(CommonPaths, 5);
  CommonPaths[0] := 'C:\Program Files\Pengu Loader';
  CommonPaths[1] := 'C:\Program Files (x86)\Pengu Loader';
  CommonPaths[2] := ExpandConstant('{localappdata}\Programs\Pengu Loader');
  CommonPaths[3] := ExpandConstant('{pf}\Pengu Loader');
  CommonPaths[4] := ExpandConstant('{pf32}\Pengu Loader');

  // Check each path
  for I := 0 to GetArrayLength(CommonPaths) - 1 do
  begin
    if DirExists(CommonPaths[I]) then
    begin
      Result := CommonPaths[I];
      Exit;
    end;
  end;

  // Default fallback
  Result := 'C:\Program Files\Pengu Loader';
end;

// Initialize custom wizard page
procedure InitializeWizard;
var
  DetectedPath: String;
begin
  // Auto-detect Pengu Loader path
  DetectedPath := DetectPenguPath();

  // Create custom directory selection page
  PenguPathPage := CreateInputDirPage(wpSelectDir,
    CustomMessage('SelectPenguDir'),
    CustomMessage('SelectPenguDirDescription'),
    CustomMessage('PenguDirLabel'),
    False, '');

  PenguPathPage.Add('');
  PenguPathPage.Values[0] := DetectedPath;
  PenguPathValue := DetectedPath;
end;

// Validate user input before proceeding
function NextButtonClick(CurPageID: Integer): Boolean;
var
  PathStr: String;
begin
  Result := True;

  if CurPageID = PenguPathPage.ID then
  begin
    PathStr := PenguPathPage.Values[0];
    PenguPathValue := PathStr;

    // Check if path is empty
    if PathStr = '' then
    begin
      MsgBox(CustomMessage('PenguDirNotFound'), mbError, MB_OK);
      Result := False;
      Exit;
    end;

    // Optional: Verify Pengu Loader exists (uncomment to enable)
    (*
    if not DirExists(PathStr + '\plugins') then
    begin
      if MsgBox(CustomMessage('PenguDirNotFound'), mbConfirmation, MB_YESNO) = IDNO then
      begin
        Result := False;
        Exit;
      end;
    end;
    *)
  end;
end;

// Override the directory shown on the "Select Destination Location" page
function AppendPath(Path: String; Append: String): String;
begin
  if Copy(Path, Length(Path), 1) = '\' then
    Result := Path + Append
  else
    Result := Path + '\' + Append;
end;

// Update wizard with selected path
procedure CurPageChanged(CurPageID: Integer);
begin
  if CurPageID = wpSelectDir then
  begin
    // Show the full path including plugins\AstranteTheme
    WizardForm.DirEdit.Text := AppendPath(GetPenguPath(''), 'plugins\AstranteTheme');
  end;
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
