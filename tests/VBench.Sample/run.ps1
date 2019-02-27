Param(
	[string]$Filter = "*RandomTest*",
	[switch]$Dry
)

Clear-Host;
[string]$projectFile = Join-Path $PSScriptRoot "*.csproj" | Resolve-Path;
&dotnet build $projectFile --configuration "Release" --verbosity minimal;
if ($LASTEXITCODE -ne 0) { throw "The build failed!"; }

try
{
	[string]$job = "";
	if ($Dry.IsPresent) { $job = "--job dry"; }

	[string]$app = Join-Path $PSScriptRoot "bin/Release/*/*Sample.dll" | Resolve-Path;
	Split-Path $app -Parent | Push-Location;
	&dotnet $app --filter $Filter --memory $job;
}
finally { Pop-Location; }